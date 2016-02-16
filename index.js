//Initialise express
var express = require('express');
var app = express();

// Initialise libraly to work on file system
var fs = require('fs');

var _=require('lodash');

// This libraly contaion information for HBS template system
var engines = require('consolidate');

//Define libraly to work with path directory
var path = require('path');

var bodyParser = require('body-parser');

// Extract all function in difrent file
var helpers = require('./helpers');

var JSONStream = require('JSONStream');

// return database connection
var User = require('./db').User;

// Set HBS tempalte engine
app.engine('hbs', engines.handlebars);

app.set('views','./views');
app.set('view engine','hbs');

//Define static images
app.use(express.static('images'));

app.use(bodyParser.urlencoded({extended: true}));

//Fix bug in chrome
app.get('/favicon.ico', function (req ,res){
	res.end();
})

app.get('/',function(req, res){
	User.find({}, function(err,users){
	  res.render('index', {users: users})
	})
});

app.get('*.json', function(req, res){
	// TODO: create a validation for user exit
	res.download('./users/'+ req.path);
});

app.get('/data/:username', function(req, res){
	var username = req.params.username;
	// Return stream 
	var readable = fs.createReadStream('./users/' + username + '.json');
	readable.pipe(res);
});

// Implement filters by gender
app.get('/users/by/:gender', function(req,res){
	var gender = req.params.gender;
	var readable = fs.createReadStream('users.json');

// Make filter
	readable
		.pipe(JSONStream.parse('*', function(user){
			if(user.gender === gender) return user
		}))
		.pipe(JSONStream.stringify('[\n  ', ',\n  ', '\n]\n'))
		.pipe(res);
});

//Error message if user doen't exist
app.get('/error/:username', function(req,res){
 res.send('No user named ' + req.params.username + ' found').status(404);
});

// Use custom router to user information
var userRouter = require('./username');
app.use('/:username', userRouter);


//Start express server on port 3000
var server =app.listen(3000, function(){
	console.log('Server running at http://localhost:'+ server.address().port);
});