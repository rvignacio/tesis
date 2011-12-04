/**
 * Module dependencies.
 */
var	syntacticSearchService = require('./libs/syntacticSearchService'),
	redis = require('redis'),
	//util = require('util'),
	Step = require('step');

var	recli = redis.createClient();
recli.on("error", function (err) {
    console.log("Error connecting to redis: "+err);
});
/*recli.monitor(function (err, res) {
    console.log("Entering monitoring mode.");
});

recli.on("monitor", function (time, args) {
    console.log(time + ": " + util.inspect(args));
});*/
var model = module.exports = {
	assignDataToWord: function(word, data, next){
		var multi = recli.multi();
		multi.srem('function::words', word)
		.del('word:'+word+':functions', data.fn)
		.sadd('word:'+word+':functions', data.fn)
		.sadd('word:'+word+':function:'+data.fn+':weight', data.weight)
		.sadd('function:'+data.fn+':words', word)
		.exec(next);
	},
	getUnfound: function(next){
		recli.smembers('function::words', next);
	},
	searchFunctions: function(text, next){
		var words = text.match(/[a-zA-Z0-9áéíóú]+/g), matches = {}, words_len = words.length;
		if (words) {
			words.forEach(function(word, key){
				model.searchWordFunctions(word, function(err, funcs){
					if (err){
						next(err);
					}
					matches[word] = funcs;
					var over = Object.keys(matches).length === words_len;
					if (over){
						next(null, matches);
					}
				});	
			});
		}else{
			next(new Error('no words received'));
		}
	},
	searchWordFunctions: function(word, next){
		recli.smembers('word:'+word+':functions', function(err, data){
			if (err){
				next(new Error('error when looking up for \''+word+'\' functions locally: '+err));
			}else if (data[0]){
				console.log('functions from \''+word+'\' found locally');
				next(null, data);	
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
							console.log('functions from \''+word+'\' found remotely');
							next(null, funcs);
						});
					}
				});	
			}
		});		
	}
}