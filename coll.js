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
	 $('anime').each(function(i, element){
	 	var id = $(this).children('series_animedb_id');
	 	var allEpisodes = $(this).children('series_episodes').text();
	 	var watchedEp = $(this).children('my_watched_episodes').text();
	 	if(allEpisodes === watchedEp){
		 	Arr.push({ uri: baseUrl + '/anime/' + id.text(),
		 		seriesTitle: $(this).children('series_title').text(),
		 		score: $(this).children('my_score').text(),
		 		tags: $(this).children('my_tags').text()
		 	});}
	});
	console.log(Arr);
	var Arry = Arr;

	Arry.forEach(function(value, index){
		request(value.uri, function(err, res, body){
			console.log('Visiting page ' + value.uri);
			console.log('Status code: ' + res.statusCode);
			var $ = cheerio.load(body);
			value['genres'] = [];
			$('div').has('span:contains("Genres:")').children('a').each(function(i, element){
				value.genres.push($(this).text());
			});
			console.log(value.genres);
		})
	});

	});
};



function GetStats() {
	var Arry = Arr;

	Arry.forEach(function(value, index){
		console.log('Visiting page '+value.uri);
		request(value.uri, function(err, res, body){
			console.log('Status code: ' + res.statusCode);
			var $ = cheerio.load(body);
			var genres = $('div').has('<span class="dark_text">Genres:</span>').text()
			console.log(genres);
		})
	});
};




















