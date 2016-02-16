var express = require('express');
var helpers = require('./helpers');
var fs = require('fs');

var router = express.Router({
	mergeParams:true
});
//Log which method we send
router.all('/',function(req, res, next){
	console.log(req.method, 'for', req.params.username);
		next();
});
// Use username form url to show username in page
router.get('/',helpers.verifyUser, function(req,res){
	//get params from url
	var username = req.params.username;
	var user = helpers.getUser(username);

	//send paramethers to template system
	res.render('user',{
		user:user,
		address: user.location
	});
})

router.get('/edit', function(req,res){
	res.send('You want to edit '+ req.params.username +'???');
});

//Update user
router.put('/',function(req,res){
	var username = req.params.username;
	var user = helpers.getUser(username);
	user.location = req.body;
	// Log new data
	console.log(req.body)
	helpers.saveUser(username, user);
	res.end();
})

//Delete user
router.delete('/',function(req,res){
	//TODO: remove images related to user
	var fp = helpers.getUserFilePath(req.params.username);
	fs.unlinkSync(fp);
	console.log("Delete user" + req.params.username);
	res.sendStatus(200);
})

module.exports = router;