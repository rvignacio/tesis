/**
 * Module dependencies.
 */

var express = require('express'),
	syntacticSearchService = require('./libs/syntacticSearchService'),
	redis = require("redis"),
	util = require("util");

var app = module.exports = express.createServer(),
	recli = redis.createClient();;

recli.on("error", function (err) {
    console.log("Error connecting to redis: "+err);
});
/*recli.monitor(function (err, res) {
    console.log("Entering monitoring mode.");
});

recli.on("monitor", function (time, args) {
    console.log(time + ": " + util.inspect(args));
});*/

var search = function(req, res, next){
	var word = req.query.word;
	if (word) {
		recli.smembers(word, function(err, data){
			if (err){
				next(new Error('error when trying to get \''+word+'\' data: '+err));
			}else if (data && data[0]){
				req.data = data;
				console.log('data from \''+word+'\' found locally');
				next();	
			}else{
				syntacticSearchService.search(word, function(err, funcs){
					if (err){
						next(new Error('error when looking up for \''+word+'\': '+err));	
					}else{
						recli.sadd('words', word, function(err, data){
							if (err){
								next(new Error('error when creating \''+word+'\' in local DB: '+err));
							}else{
								recli.sadd(word, funcs.length?funcs:'', function(err, data){
									if (err){
										next(new Error('error when setting data to \''+word+'\': '+err));
									}else{
										req.data = funcs;
										console.log('data from \''+word+'\' found remotely');
										next();
									}
								});	
							}
						});
					}
				});	
			}
		});
	}else{
		next(new Error('no word received'));
	}
}
// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

/*app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});*/

// Routes

//controlador por default
app.get('/', function(req, res){
	res.render('index', {
		title: 'Evaluación de funciones sintácticas'
	});
});

/* controlador que busca la funci?n sint?ctica de
 * una palabra en el servicio web 
 */
app.get('/words/assign', function(req, res){
	var notFound = [];
	recli.smembers('words', function(err, words){
		if (err){
			throw new Error('error when trying to get words');
			return;
		}
		var len = words.length;
		words.forEach(function(word, idx){
			var over = !(len-idx-1);
			recli.smembers(word, function(ended){
				return function(err, funcs){
					if (!funcs[0]){
						notFound.push(word);
					}
					if (over){
						res.render('list', {
							title: 'Lista de palabras no encontradas',
							words: notFound
						});					
					}
				}
			}(over));
		});
	});
});
app.get('/syntacticSearch',search,function(req, res){
	res.send(req.data);
});


// Only listen on $ node app.js
if (!module.parent) {
	app.listen(3000);
	console.log("Express server listening on port %d", app.address().port);
}
