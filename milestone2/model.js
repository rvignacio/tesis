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
	addWeightToFunctions: function(word, funcs, next){
		var len = funcs.length, ret = [];
		funcs.forEach(function(func, idx){
			var over = idx === len-1;
			recli.get('word:'+word+':function:'+func+':weight', function (err, weight){
				if (err){
					next(new Error('error when trying to get weight for function \''+func+'\' in word \''+word+'\''));
				}
				ret.push({
					'fn': func,
					'weight': weight
				});
				if (over){
					next(null, ret);
				}
			});
		});
	},
	assignDataToWord: function(word, data, next){
		var multi = recli.multi();
		multi.srem('function:'+data.oldFn+':words', word)
		.srem('word:'+word+':functions', data.oldFn)
		.sadd('word:'+word+':functions', data.newFn)
		.set('word:'+word+':function:'+data.newFn+':weight', data.weight)
		.sadd('function:'+data.newFn+':words', word)
		.exec(next);
	},
	getUnfound: function(next){
		recli.smembers('function::words', next);
	},
	searchFunctions: function(text, next){
		var words = text.match(/[a-zA-Z0-9áéíóú]+/g), matches = {}, words_len = words.length, counts = {};
		if (words) {
			words.forEach(function(word, key){
				model.searchWordFunctions(word, function(err, funcs){
					if (err){
						next(err);
					}
					model.addWeightToFunctions(word, funcs, function(err, funcs){
						if (err){
							next(err);
						}
						matches[word] = funcs;
						counts[word] = (counts[word] || 0) + 1;
						words_len -= 1;
						var over = !words_len;
						if (over){
							next(null, {
								'funcs': matches,
								'counts': counts
							});
						}
					});
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
				console.log('functions from \''+word+'\' found locally: '+data);
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
						}, function addWordAndWeightToFunctions(){
							var group = this.group();
							funcs.forEach(function(func){
								multi.sadd('function:'+func+':words', word);
								multi.set('word:'+word+':function:'+func+':weight', 50);
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