var model = require('./model');
module.exports = {
	assignDataToWord: function(req, res, next){
		var word = req.body.word, fn = req.body.function, weight = req.body.weight;
		model.assignDataToWord(word, {
			fn: fn,
			weight: weight
		},function (err, replies){
			if (err){
				next(err);
			}
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
		model.searchFunctions(text, function(err, funcs){
			if (err){
				next(err);
			}
			req.funcs = funcs;
			next();
		});
	}
}