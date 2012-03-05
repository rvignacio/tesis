var model = require('./model');
module.exports = {
	assignDataToWord: function(req, res, next){
		var word = req.body.word, newFn = req.body.newFn, oldFn = req.body.oldFn, weight = req.body.weight;
		model.assignDataToWord(word, {
			newFn: newFn,
			oldFn: oldFn,
			weight: weight
		},function (err, replies){
			if (err){
				next(err);
				console.log('ERROR: couldn\'t assign data to \''+ word + '\'');
			}
			console.log('data assigned properly to \''+ word + '\'');
			req.data = '1';
			next();
		});
	},
	getUnfound: function(req, res, next){
		model.getUnfound(function(err, words){
			if (err){
				next(new Error('error when trying to get words'));
			}
			req.words = words;
			next();
		});
	},
	searchFunctions: function(req, res, next){
		var text = req.query.text;
		model.searchFunctions(text, function(err, data){
			if (err){
				next(err);
			}
			console.log('mws.js - searchFunctions: functions found');
			req.data = data;
			next();
		});
	},
	sortWords: function(req, res, next){
		model.sortWords(req.data, function(){
			console.log('mws.js - sortWords: words sorted');
			next();
		});
	}
}