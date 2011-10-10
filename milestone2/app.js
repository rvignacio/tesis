/**
 * Module dependencies.
 */
var express = require('express'),
	syntacticSearchService = require('./libs/syntacticSearchService'),
	redis = require("redis"),
	Step = require('step');
	util = require("util");

var app = module.exports = express.createServer(),
	recli = redis.createClient();

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
		recli.smembers('word:'+word+':functions', function(err, data){
			if (err){
				next(new Error('error when looking up for \''+word+'\' functions locally: '+err));
			}else if (data[0]){
				req.data = data;
				console.log('functions from \''+word+'\' found locally');
				next();	
			}else{
				syntacticSearchService.search(word, function(err, funcs){
					if (err){
						next(new Error('error when looking up for \''+word+'\' functions remotely: '+err));	
					}else{
						var multi = recli.multi();
						Step(function addWord(){
							multi.sadd('words', word);	
							return this.parallel();
						}, function addWordFunctions(){
							if (funcs[0]){
								multi.sadd('word:'+word+':functions', funcs);	
							}
							return this.parallel();
						}, function addWordToFunctions(){
							var group = this.group();
							funcs.forEach(function(func){
								multi.sadd('function:'+func+':words', word);
								group()();
							});
						}, function goNext(err){
							if (err){
								multi.discard();
								next(new Error('error when adding \''+word+'\' data: '+err));
							}
							multi.exec();
							req.data = funcs;
							console.log('functions from \''+word+'\' found remotely');
							next();
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

app.post('/words/assign', function(req, res){
	var multi = recli.multi(), word = req.body.word, fn = req.body.function;
	multi.srem('function::words', word)
	.sadd('word:'+word+':functions', fn)
	.sadd('function:'+fn+':words', word)
	.exec(function (err, replies){
		if (err){
			console.log(err);
			res.send('');
		}
		res.send('1');
	});
});

/* controlador que busca la funci?n sint?ctica de
 * una palabra en el servicio web 
 */
app.get('/words/assign', function(req, res){

	recli.smembers('function::words', function(err, words){
		if (err){
			throw new Error('error when trying to get words');
			return;
		}
		res.render('list', {
			title: 'Lista de palabras no encontradas',
			words: words,
			functions: ['',
					  'sustantivo',
					  'verbo',
					  'adjetivo',
					  'artículo',
					  'adverbio',
					  'preposición',
					  'conjunción',
					  'pronombre']
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
