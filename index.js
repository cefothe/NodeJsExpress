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

// Set HBS tempalte engine
app.engine('hbs', engines.handlebars);

app.set('views','./views');
app.set('view engine','hbs');

//Define static images
app.use(express.static('images'));

app.use(bodyParser.urlencoded({extended: true}));

app.get('/',function(req, res){
	//Define empty array to put in all user from users.json file
	  var users = []
	  fs.readdir('users', function (err, files) {
	  	if(err) throw err;
	    files.forEach(function (file) {
	      fs.readFile(path.join(__dirname, 'users', file), {encoding: 'utf8'}, function (err, data) {
	        if(err) throw err;
	        var user = JSON.parse(data)
	        user.name.full = _.startCase(user.name.first + ' ' + user.name.last)
	        users.push(user)
	        if (users.length === files.length) res.render('index', {users: users})
	      })
	    })
	  })
});

app.get('*.json', function(req, res){
	// TODO: create a validation for user exit
	res.download('./users/'+ req.path);
});

app.get('/data/:username', function(req, res){
	var username = req.params.username;
	var user = helpers.getUser(username);
	res.json(user);
});


app.route('/:username')
	.all(function(req, res, next){
		console.log(req.method, 'for', req.params.username);
		next();
	})
	.get(helpers.verifyUser, function(req,res){
		// Use username form url to show username in page
		//get params from url
		var username = req.params.username;
		var user = helpers.getUser(username);

		//send paramethers to template system
		res.render('user',{
			user:user,
			address: user.location
		});
	})
	.put(function(req,res){
		//Update user
		var username = req.params.username;
		var user = helpers.getUser(username);
		user.location = req.body;
		// Log new data
		console.log(req.body)
		helpers.saveUser(username, user);
		res.end();
	})
	.delete(function(req,res){
		//Delete user
		//TODO: remove images related to user
		var fp = helpers.getUserFilePath(req.params.username);
		fs.unlinkSync(fp);
		console.log("Delete user" + req.params.username);
		res.sendStatus(200);
	})

//Error message if user doen't exist
app.get('/error/:username', function(req,res){
 res.send('No user named ' + req.params.username + ' found').status(404);
});


//Start express server on port 3000
var server =app.listen(3000, function(){
	console.log('Server running at http://localhost:'+ server.address().port);
});