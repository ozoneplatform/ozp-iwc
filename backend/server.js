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
    res.setHeader('Access-Control-Allow-Origin', ServerConfig.ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
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
//Bus routes
app.use(ServerConfig.ROOT_ROUTE,index);
app.use(ServerConfig.ROOT_ROUTE,express.static('../dist'));

// Data Api Routes
app.use(ServerConfig.DATA_ROUTE,data);

// System Api Application Listing Routes
app.use(ServerConfig.LISTING_ROUTE,listing);


// Applications & Application Bower component routes
app.use(ServerConfig.APPLICATION_ROUTE,express.static('public'));
app.use(ServerConfig.APPLICATION_ROUTE,express.static('../bower_components/ozp-demo/app'));
app.use(ServerConfig.APPLICATION_ROUTE + "/bower_components/ozp-iwc/dist",express.static('../dist'));
app.use(ServerConfig.APPLICATION_ROUTE+ "/bower_components",express.static('../bower_components'));

var server = app.listen(13000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('IWC Example Backend listening at http://%s:%s', host, port);
});
