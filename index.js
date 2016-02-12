//Initialise express
var express = require('express');
var app = express();

// Initialise libraly to work on file system
var fs = require('fs');

var _=require('lodash');

//Define empty array to put in all user from users.json file
var users = [];


fs.readFile('users.json', {encoding: 'utf8'}, function(err, data){
	if(err) throw err;

	JSON.parse(data).forEach(function(user){
		user.name.full = _.startCase(user.name.first + ' ' +user.name.last);
		users.push(user);
	})
})

app.set('views','./views');
app.set('view engine','jade');

app.get('/',function(req, res){
	res.render('index',{users:users});
})

//use regular expresion to show in console only user start with big
app.get(/big.*/, function(req,res,next){
	console.log('BIG USER ACCESS');
	next();
})

app.get(/.*dog.*/, function(req,res,next){
	console.log('DOGS GO WOOF');
	next();
})

// Use username form url to show username in page
app.get('/:username', function(req,res){
	var username = req.params.username;
	res.send(username);
})

app.get('/yo',function(req,res){
	res.send('YO!');
})

//Start express server on port 3000
var server =app.listen(3000, function(){
	console.log('Server running at http://localhost:'+ server.address().port);
});