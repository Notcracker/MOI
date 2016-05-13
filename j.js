var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://myanimelist.net/malappinfo.php?u=soodesune&status=all&type=anime";
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;


var Arr = [];
visitPage(START_URL);
function visitPage(url) {
	
	// Make the request
	console.log("Visiting page " + url);
	request(url, function(error, response, body) {
	 // Check status code (200 is HTTP OK)
	 console.log("Status code: " + response.statusCode);
	 
	 // Parse the document body
	 var $ = cheerio.load(body, { xmlMode: true });
	 var miri = $('series_animedb_id').each(function(i, element){
	 	var id = $(this);
	 	Arr.push(baseUrl + '/anime/' + id.text());
	});
	console.log(Arr);
	});
};

