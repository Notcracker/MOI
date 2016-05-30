var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var Promise = require("bluebird");
var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');


// Connection URL
var urldb = 'mongodb://localhost:27017/conFusion';

var START_URL = "http://myanimelist.net/malappinfo.php?u=soodesune&status=all&type=anime";
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;


var Arr = [];



visitPage(START_URL)
.then(GetStats)
.then(function(array1){
	MongoClient.connect(urldb,function(err,db){
		assert.equal(err,null);
		console.log('Connected correctly to server');

		var collection = db.collection('mally');
		collection.insert(array1, {continueOnError: true}, function(err, result) {
				assert.equal(err,null);
				db.close();		
				console.timeEnd('function');					
			});
	});
});

function visitPage(url) {
	return new Promise(function(resolve, reject){
						
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
							 		_id: id.text(),
							 		seriesTitle: $(this).children('series_title').text(),
							 		myScore: Number($(this).children('my_score').text()),
							 		tags: $(this).children('my_tags').text()
							 	});}
						 	if ((Number($(this).children('my_score').text()))!==0){
								meanScore = Number($(this).children('my_score').text()) + meanScore;
								console.log(meanScore);
								L = L+1;
							}


						});
						resolve(Arr);
									
						 
						});
	
});
};


/*q или bluebird*/

function GetStats(arr) {
		console.time('function')
		var meanScore = 0;
		var L = 0;
		var Arry = arr;
		Arry.forEach(function(value, index){
			
			request('http://myanimelist.net/includes/ajax.inc.php?t=64&id='+value._id, function(error, response, body){
				
				if (!error && response.statusCode == 200) {

		            var $ = cheerio.load('<body>' + body + '</body>');
		            var $body = $('body');

		            $('body div').children().empty();
		            var description = $('body div').text().trim();
		            var keys = $('body span').text().split(':');
		            keys.splice(-1, 1);
		            $body.children().empty();
		            var values = $body.text().trim().split('\n');

		            
		            value.description = description;
		           

		            for(var j = 0; j<keys.length; j++) {
		                value[(keys[j].toLowerCase().trim())] = (values[j].trim());
            		}
		        }



			});
		});
		console.timeEnd('function');	
		return Arry;

	};	

			
		



























