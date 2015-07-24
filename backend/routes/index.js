var express = require('express');
var utils = require("../lib/utils.js");
var OzoneConfig = require("../OzoneConfig.js");
var router = express.Router();


//========================================
// Routes
//========================================
/**
 * GET
 * Backend Root : /
 *
 * Returns information about each API endpoint.
 */
router.get("/", function(req,res){
    var wrapped = utils.hateoas({}, {
        "curies": {
            "href": "http://ozoneplatform.org/docs/rels/{rel}",
            "name": "ozp",
            "templated": true
        },
        "ozp:application": {"href": utils.getFullUrl(req,true) + OzoneConfig.LISTING_ROUTE},
        "ozp:user-data": {"href": utils.getFullUrl(req,true) + OzoneConfig.DATA_ROUTE},
        "self": {"href": utils.getFullUrl(req)}
    });

    res.status(200).json(wrapped);
});
module.exports = router;
