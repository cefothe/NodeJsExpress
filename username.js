var express = require('express');
var helpers = require('./helpers');
var fs = require('fs');

// return database connection
var User = require('./db').User;

var router = express.Router({
	mergeParams:true
});

//Log which method we send
router.use('/',function(req, res, next){
	console.log(req.method, 'for', req.params.username);
		next();
});

// Use username form url to show username in page
router.get('/', function(req,res){
	//get params from url
	var username = req.params.username;
	User.findOne({username:username},function(err, user){
		//send paramethers to template system
		res.render('user',{
			user:user,
			address: user.location
		});
	})
})

//Error handaling
router.use(function(err,req, res, next){
	console.error(err.stack);
	res.status(500).send('Somethink broke!');
});

router.get('/edit', function(req,res){
	res.send('You want to edit '+ req.params.username +'???');
});

//Update user
router.put('/',function(req,res){
	var username = req.params.username;

	//Update database
	User.findOne({username:username}, function(err,user){
		if(err) console.error(err);

		user.location = req.body.location;
		//Use virtual property
		user.name.full = req.body.name;

		//Commit changes
		user.save(function(){
			res.end();
		})
	})
})

//Delete user
router.delete('/',function(req,res){
	var username = req.params.username;
	User.findOneAndRemove({username:username}, function(err){
		console.log("Delete user" + req.params.username);
		res.sendStatus(200);
	});
})

module.exports = router;