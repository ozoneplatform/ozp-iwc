var express = require('express');
var utils = require("../lib/utils.js");
var ServerConfig = require("../ServerConfig.js");
var Datastore = require('nedb');
var glob = require('glob');
var fs = require('fs');
var router = express.Router();
var data = new Datastore({ filename: 'db/listing', autoload: true });
var idIndex = 0;

/**
 * Generates a unique Id for a listing.
 * @method getId
 */
var getId = function(){
    // store key as a string for easier querying
    return "" + idIndex++;
};

/**
 * Adds the application route prefix to a url. This directs to the static-hosted ozp-demo assets.
 * @method addPathing
 * @param {String} resource
 */
var addPathing = function(resource){
    if(resource.charAt(0) !== "/") {
        resource = "/" + resource;
    }
    resource = ServerConfig.APPLICATION_ROUTE +  resource;
    return resource;
};


/**
 * Asynchronously gathers a listing file from ozp-demo,formats, and passes the formatted listing to the callback.
 * @method fsGetListing
 * @param {String} listingFile
 * @param {Function} callback
 */
var fsGetListing = function(listingFile,callback){
    fs.readFile(listingFile, 'utf8',function(err,data){
        if(err) {
            throw "Unexpected error:" +  err;
        }
        var obj = JSON.parse(data);
        obj.id = getId();
        for(var i in obj.icons) {
            obj.icons[i] = addPathing(obj.icons[i]);
        }
        for(var i in obj.launchUrls) {
            obj.launchUrls[i] = addPathing(obj.launchUrls[i]);
        }

        callback(obj);
    });
};

/**
 * Stores/updates the given listing in the listing db. Indexed by the listings "id" property.
 * @method dbStoreListing
 * @param {Object} listing
 */
var dbStoreListing = function(listing){
    console.log(listing);
    data.update({'id': listing.id}, listing, {'upsert': true}, function (err, num, upsert) {
        if (err) {
            console.log("Error storing listing:", err,listing);
        }
    });
};


/**
 * Formats a listing object to be returned from a routed request. Prepends the full protocol/host path to
 * relative path resources within the listing.
 *
 * @method routeFormatListing
 * @param {Object} req
 * @param {Object} listing
 */
var routeFormatListing = function(req,listing){
    listing.icons = listing.icons || {};
    listing.launchUrls = listing.launchUrls || {};

    //Apply host name & protocol to url paths.
    for(var i in listing.icons){
        listing.icons[i] = utils.getHostUrl(req) + listing.icons[i];
    }
    for(var i in listing.launchUrls){
        if(listing.isLegacy) {
            listing.launchUrls[i] =  utils.getHostUrl(req) + "/owf7adapter.html?url=" + encodeURIComponent(utils.getHostUrl(req) + listing.launchUrls[i]);

        } else {
            listing.launchUrls[i] = utils.getHostUrl(req) + listing.launchUrls[i];
        }
    }
    // To comply with webtop's gathering of listings, providing a pre-formatted listing property.
    listing.listing = {
        'title': listing.title,
        'uuid': listing.id,
        'imageSmallUrl': listing.icons.small,
        'imageMediumUrl': listing.icons.large,
        'launchUrl': listing.launchUrls.default
    };

    return listing;
};

//========================================
// Initialization
//========================================

//Drop the application db
try {
    fs.mkdirSync('db');
} catch(e) {
    if ( e.code != 'EEXIST' ){
        throw e;
    }
}
fs.writeFileSync('db/listing', '');

//Populate with listing files
glob("../bower_components/ozp-demo/**/listing*.json", {}, function (er, files) {
    console.log(files);
    files.forEach(function(file){
        fsGetListing(file,dbStoreListing);
    });
});



//========================================
// Routes
//========================================
/**
 * GET
 * Data Api : /data
 *
 * Returns the path of every resource in the data api.
 */
router.get("/", function(req,res){
    data.find({},function(err, result){
        if(err){
            res.status(500).json({error: err});
            return;
        }
        var wrapped = utils.hateoas({},{
            'item': result.map(function (item) {
                return  {'href': utils.getFullUrl(req) + item.id};
            })
        });
        res.status(200).json(wrapped);
    });
});

/**
 * GET
 * System Api Resource : /application/{resource}
 *
 * Returns the desired application listing resource.
 */
router.get(/\/(.*)/, function(req,res){
    data.findOne({ id: req.params[0] },function(err, result){
        if(err){
            res.status(500, {error: err});
            return;
        }

        if (!result) {
            res.status(404);
            return;
        }

        var wrapped = utils.hateoas(routeFormatListing(req,result), { 'self': {'href': utils.getFullUrl(req,true)}});
        res.setHeader('Content-Type', 'application/vnd.ozp-application-v1+json');
        res.status(200).json(wrapped);
    });
});
module.exports = router;
