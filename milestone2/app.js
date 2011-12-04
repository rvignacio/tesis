/**
 * Module dependencies.
 */

var express = require('express'), mws = require('./mws');

var app = module.exports = express.createServer();

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
app.post('/words/assign', mws.assignDataToWord, function(req, res){
	res.send(req.data);
});
app.get('/words/assign', mws.getUnfound, function(req, res){
	res.render('list', {
		title: 'Lista de palabras no encontradas',
		words: req.words,
		functions: [
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
app.get('/syntacticSearch',mws.searchFunctions, function(req, res){
	res.send(req.funcs);
});

// Only listen on $ node app.js
if (!module.parent) {
	app.listen(3000);
	console.log("Express server listening on port %d", app.address().port);
}
