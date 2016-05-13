var express = require('express');
var http = require('http');
var morgan = require('morgan');

var hostname = "localhost";
var port = 3000;

var app = express();

app.get('/', function(req, res, err){
	res.end('Hi!');
})


app.listen(port, hostname, function(){
	console.log(`Server running at http://${hostname}:${port}/`);
})