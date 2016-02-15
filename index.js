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


// This function return user file which contain information from current user
function getUserFilePath(username){
	return path.join(__dirname,'users',username) + '.json';
}

// This function return all user data
function getUser(username){
 var user = JSON.parse(fs.readFileSync(getUserFilePath(username), {encoding: 'utf8'}));

 user.name.full = _.startCase(user.name.first + ' ' +user.name.last);
 //Foreach all element in location array
 _.keys(user.location).forEach(function(key){
 	user.location[key] = _.startCase(user.location[key]);
 });
 return user;
}

function saveUser(username, data){
	//Log user which update your data
	console.log(username);

	var fp = getUserFilePath(username);
	fs.unlinkSync(fp);
	fs.writeFileSync(fp, JSON.stringify(data, null, 2), {encoding: 'utf8'} );
}

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
	    files.forEach(function (file) {
	      fs.readFile(path.join(__dirname, 'users', file), {encoding: 'utf8'}, function (err, data) {
	        var user = JSON.parse(data)
	        user.name.full = _.startCase(user.name.first + ' ' + user.name.last)
	        users.push(user)
	        if (users.length === files.length) res.render('index', {users: users})
	      })
	    })
	  })
})

// Use username form url to show username in page
app.get('/:username', function(req,res){

	//get params from url
	var username = req.params.username;
	var user = getUser(username);

	//send paramethers to template system
	res.render('user',{
		user:user,
		address: user.location
	});
})

//Update user
app.put('/:username',function(req,res){
	var username = req.params.username;
	var user = getUser(username);
	user.location = req.body;
	// Log new data
	console.log(req.body)
	saveUser(username, user);
	res.end();
});

//Delete user
app.delete('/:username', function(req,res){
	//TODO: remove images related to user
	var fp = getUserFilePath(req.params.username);
	fs.unlinkSync(fp);
	console.log("Delete user" + req.params.username);
	res.sendStatus(200);
});
//Start express server on port 3000
var server =app.listen(3000, function(){
	console.log('Server running at http://localhost:'+ server.address().port);
});