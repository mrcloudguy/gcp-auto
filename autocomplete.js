$('#autocomplete').autocomplete({
    source: function(req, res) {
	    var loadFromCache = autocomplete_from_cache(req.term);
	    // Return cache results, if there are
	    if (loadFromCache) {
		    return res(loadFromCache);
	    }
	
      $.get('/autocomplete/company/' + req.term.replace(/ /g, '+'), function(r) {
        autocomplete_add_cache(req.term, r);
        return res(r);
      }, 'json');
  },
  minLength: 2,
  select: function (e, ui) {
    $(e.target).val(ui.item.name);
    return false;
  }
}).autocomplete('instance')._renderItem = function (ul, item) {
    return $('<li>')
      .append('<a>' + item.name + '</a>')
      .appendTo(ul);
};

function autocomplete_add_cache(term, results) {
	var expiry = new Date();
	expiry.setMonth(expiry.getMonth() + 1);
	expiry = expiry.getTime();

	localStorage.setItem('autocomplete-company-' + encodeURI(term.toLowerCase()), JSON.stringify({ expiry: expiry, results: results }));
}

function autocomplete_from_cache(term) {
  // Check for local storage
  if (typeof localStorage !== 'undefined') {
      try {
          localStorage.setItem('feature_test', 'yes');
          if (localStorage.getItem('feature_test') === 'yes') {
              localStorage.removeItem('feature_test');
          } else {
              return false;
          }
      } catch(e) {
          return false;
      }
  } else {
      return false;
  }

  // Check if item exists
  if (localStorage.getItem('autocomplete-' + type + '-' + encodeURI(term.toLowerCase())) === null)
      return false;

  var autocomplete = JSON.parse(localStorage.getItem('autocomplete-company-' + encodeURI(term.toLowerCase())));
  // Check if is expired
  if (autocomplete.expiry < new Date().getTime()) {
      return false;
  }

  return autocomplete.results;
}
