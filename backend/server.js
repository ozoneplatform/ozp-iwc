'use strict';
var express = require("express");
var bodyParser = require("body-parser");
var utils = require("./lib/utils.js");
var ServerConfig = require("./ServerConfig.js");
var index = require('./routes/index');
var data = require('./routes/data');
var listing = require('./routes/listing');

var app = express();


//=======================================
// Middleware
//=======================================
app.use(function (req, res, next) {
    for(var i in  ServerConfig.ALLOW_ORIGINS){
        req.headers.origin = req.headers.origin || [];
        if(req.headers.origin.indexOf(ServerConfig.ALLOW_ORIGINS[i]) > -1){
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            break;
        }
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers',  'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

//@TODO: this is only because IWC churns out text/plain, to be fixed.
app.use(function rawText(req, res, next) {
    req.setEncoding('utf8');
    req.rawBody = '';
    req.on('data', function(chunk) {
        req.rawBody += chunk;
    });
    req.on('end', function(){
        next();
    });
});

//=======================================
// Routes
//=======================================
//Library routes
app.use(ServerConfig.ROOT_ROUTE,express.static('../dist', {index: "debugger.html"}));

// Api Root Route
app.use(ServerConfig.API_ROOT_ROUTE,index);

// Data Api Routes
app.use(ServerConfig.API_ROOT_ROUTE + ServerConfig.DATA_ROUTE,data);

// System Api Application Listing Routes
app.use(ServerConfig.API_ROOT_ROUTE + ServerConfig.LISTING_ROUTE,listing);


// Applications & Application Bower component routes
app.use(ServerConfig.APPLICATION_ROUTE,express.static('public'));
app.use(ServerConfig.APPLICATION_ROUTE,express.static('../bower_components/ozp-demo/app'));
app.use(ServerConfig.APPLICATION_ROUTE + "/bower_components/ozp-iwc/dist",express.static('../dist'));
app.use(ServerConfig.APPLICATION_ROUTE+ "/bower_components",express.static('../bower_components'));

// Legacy support
app.use(ServerConfig.ROOT_ROUTE,express.static('../bower_components/ozp-iwc-owf7-widget-adapter/dist'));

var server = app.listen(ServerConfig.SERVER_PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('IWC Example Backend listening at http://%s:%s', host, port);
});
