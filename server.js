var express = require('express');
var request = require('request');
var _ 		= require('lodash');
var pkg     = require( __dirname + '/package' );

var app     = express();
var regex   = /^(http)/igm;
var ip      = null;
var url     = null;


app.use(function(req, res, next) {
	ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	res.header( 'Access-Control-Allow-Origin', 	'*' );
	res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' );
	res.header( 'User-Agent', 					'bbrands-cors-proxy/' + pkg.version + ' (Linux; proxy)' );
	res.header( 'X-Powered-by', 				'bbrands/cors-proxy' );
	res.header( 'X-Forwarded-For', 				ip );

	next();
});

app.use('/', function(req, res) {
	var url    = _.trimStart(req.url, '/');
	var method = req.method;
	var valid  = url.match( regex );

	if (!url || !valid) {
		var errorMessage = 'Error: No valid URL received to proxy'
		log( ip, method, errorMessage );
		return error( res, errorMessage );
	}

	log( ip, method, url );

	req
		.pipe( request(url) )
		.on( 'error', function(e) {
			return error( res, e.message );
		})
		.pipe( res );
});

app.listen(process.env.PORT || 3000);


function error( res, message ) { return res.json({ status: 'error', message: message }); }
function log( ip, method, url ) { console.log( '[' + ip + '/' + method + '] Proxy Request Received', url ); }
