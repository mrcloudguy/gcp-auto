package main

import (
	"gopkg.in/gin-gonic/gin.v1"
	"net/http"
	"io/ioutil"
	"github.com/patrickmn/go-cache"
  "time"
)

func main() {

	// Routes
 	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// Set cache default expiring to 30days and which purges expired items every 24h
	c := cache.New((24 * time.Hour) * 30 * 6, 24 * time.Hour)
	
	r.GET("/autocomplete/company/:term", func(g *gin.Context) {
		term := g.Param("term")
		
		// Check if in cache
		item, cached := c.Get("autocomplete-company-" + term)
		
		if cached {
			g.String(200, item.(string))
			return
		}

		res, err := http.Get("https://autocomplete.clearbit.com/v1/companies/suggest?query=" + term)
        if err != nil {
            panic(err.Error())
        }
        
        defer res.Body.Close()
        body, err := ioutil.ReadAll(res.Body)
        results := string(body)

        // Save in cache
        c.Set("autocomplete-company-" + term, results, cache.DefaultExpiration)
        g.String(200, results)
	})

	r.Run(":1234")
}
