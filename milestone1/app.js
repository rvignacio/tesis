/**
 * Module dependencies.
 */

var express = require('express'),
	syntacticSearchService = require('./libs/syntacticSearchService');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});


// Routes

//controlador por default
app.get('/', function(req, res){
	res.render('index', {
		title: 'Función sintáctica de una palabra'
	});
});

/* controlador que busca la funci?n sint?ctica de
 * una palabra en el servicio web 
 */
app.get('/syntacticSearch',function(req,res){
	
	syntacticSearchService.search(req.query.word,function(syntacticFunctions){
		
		res.send(syntacticFunctions);
    
	});

});


// Only listen on $ node app.js
if (!module.parent) {
	app.listen(3000);
	console.log("Express server listening on port %d", app.address().port);
}
