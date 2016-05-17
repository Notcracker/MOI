var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');


// Connection URL
var urlm = 'mongodb://localhost:27017/conFusion';

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
	 var meanScore = 0;
	 var L = 0;
	 $('anime').each(function(i, element){
	 	var id = $(this).children('series_animedb_id');
	 	var allEpisodes = $(this).children('series_episodes').text();
	 	var watchedEp = $(this).children('my_watched_episodes').text();
	 	if(allEpisodes === watchedEp){
		 	Arr.push({ uri: baseUrl + '/anime/' + id.text(),
		 		seriesTitle: $(this).children('series_title').text(),
		 		score: Number($(this).children('my_score').text()),
		 		tags: $(this).children('my_tags').text()
		 	});}
	 	if ((Number($(this).children('my_score').text()))!==0){
			meanScore = Number($(this).children('my_score').text()) + meanScore;
			console.log(meanScore);
			L = L+1;
		}


	});
	 console.log(meanScore/L);
	 GetStats();
	});
	
};


/*q или bluebird*/

function GetStats() {
	MongoClient.connect(urlm,function(err,db){
		assert.equal(err,null);
		console.log('Connected correctly to server');
	
		var meanScore = 0;
		var L = 0;
		var Arry = Arr;
		Arry.forEach(function(value, index){
			request(value.uri, function(err, res, body){
				
				var $ = cheerio.load(body, { xmlMode: true });
				value['genres'] = [];
				value['gScore'] = 0;
				$('div').has('span:contains("Genres:")').children('a').each(function(i, element){
					value.genres.push($(this).text());
				})
				value.gScore = Number($('span[itemprop="ratingValue"]').text());
				console.log(value.genres, value.gScore);
			

					var collection = db.collection('mal');
					collection.insert(value, {continueOnError: true}, function(err, result) {
							assert.equal(err,null);
							
						});
		
			});
		}).then(db.close());

	});

};		

			
		



























