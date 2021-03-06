var express = require('express');
var server = express();

if (process.env.NODE_ENV == 'dev' || process.env.NODE_ENV == 'serv') require(__dirname+'/app')(server) // uncomment for login (mongodb dependency)

server.use(require('body-parser').urlencoded({extended:true}))

server.post('/interest', function (req, res) {
    var data = req.body
    var str = ''
    for (var field in data) {
        str += field + ': ' + data[field] + '\t'
    }
    str += '\n'
	require('fs').appendFile('app/data/interest.txt', str, function(err){
		res.send('Thanks!');
	});
});

////////

server.get('/wob', function (req,res) {
    return res.redirect('https://www.facebook.com/events/862475787150706/')
})

server.get('/constitution', function (req,res) {
    return res.sendfile('public/Constitution.pdf')
})

//////// rush application stuff //////////

var formidable = require('formidable'),
    fs = require('fs')

server.get('/application', function (req,res) {
    var begin = new Date(2016, 0, 6)
    var end = new Date(2016, 0, 23);
    if (Date.now() < begin.getTime() || Date.now() > end.getTime()) {
        res.send('KTP W16 Application Closed'); 
    }
    else res.sendfile('public/application.html');
});

server.post('/application', function (req,res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        fs.mkdir('./data/'+fields.uniqname, function (err) {
            if(err && err.code !== 'EEXIST') throw err;
            var application = ''
            for(var field in fields) {
                application += field + ':\r\n'
                application += fields[field] + '\r\n'
            }
            fs.writeFile('./data/'+fields.uniqname+'/application.txt', application, function (err) {
                if(err) throw err;
            })
            for(var file in files) {                
                fs.rename(files[file].path,'./data/'+fields.uniqname+'/'+files[file].name, function (err) {
                    if(err) throw err;
                })
            }
        })
    })
    res.send('<html><body><center><br><h1>Thank you!</h1></center></body></html>');
});

////////// main page routing ////////////
server.get(['/','/home','/about','/rush','/contact'], function (req,res) {
    return res.sendfile('public/index.html')
})

server.use(express.static(__dirname+'/public'));

if (process.env.NODE_ENV !== 'serv') {
    server.listen(3000)
} else {
    console.log('LIVE')
    server.listen(80)
    process.on('uncaughtException', function (err) {
        console.dir(err)
        console.trace(err)
    })
}