module.exports.check = function(word,cb){
	var $ = require('jquery'), http = require('http'), options = {
		host: 'www.wordreference.com',
		port: 80,
		path: '/definicion/'+word,
		method: 'GET',
		headers: {
			'User-Agent': "Im a fake and you know it"
		}
	}, data = '', req = http.request(options, function(res) {
		res.on('error', function(e) {
			var msj = 'Got error from '+options.host+': ' +e.message;
			console.log(msj);
			cb(msj);
		});
		res.on('data', function(chunk){
			data += chunk;
		})
		res.on('end',function(){
			var html = $(data), conj = html.find('dt:contains(\'Del verbo\')').length, firstEntry = html.find('ol.entry > li:first').text(), syntaxFunction = [];
			if (/^(v|tr|intr)\./.test(firstEntry) || conj){
				var sf = 'verbo'
				if (conj){
					sf += ' (conjugado)';
				}
				syntaxFunction.push(sf);
			}
			if (/^adv\./.test(firstEntry)){
				syntaxFunction.push('adverbio');
			}
			if (/^prep\./.test(firstEntry)){
				syntaxFunction.push('preposición');
			}
			if (/^adj\./.test(firstEntry)){
				syntaxFunction.push('adjetivo');
			}
			if (/^art\./.test(firstEntry)){
				syntaxFunction.push('artículo');
			}
			if (/^(f|m|s)\./.test(firstEntry)){
				syntaxFunction.push('sustantivo');
			}
			console.log('Got response from '+options.host+': ' + res.statusCode);
			cb(syntaxFunction);
		});
	});
	req.end();
}
