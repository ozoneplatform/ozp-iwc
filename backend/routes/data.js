var express = require('express');
var utils = require("../lib/utils.js");
var Datastore = require('nedb');

var router = express.Router();
var data = new Datastore({ filename: 'db/data', autoload: true });

//========================================
// Initialization
//========================================
//NeDB uses a append-updates structure. Clean out historical data every 10 seconds.
data.persistence.setAutocompactionInterval(10000);

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
                return  {'href': utils.getFullUrl(req) + item.key};
            })
        });
        res.status(200).json(wrapped);
    });
});


/**
 * GET
 * Data Api Resource : /data/{resource}
 *
 * Returns the desired resource.
 */
router.get(/\/(.*)/, function(req,res){
    data.findOne({ key: req.params[0] },function(err, result){
        if(err){
            res.status(500, {error: err});
            return;
        }

        if (!result) {
            res.status(404);
            return;
        }

        var wrapped = utils.hateoas(result, { 'self': {'href': utils.getFullUrl(req,true)}});
        res.setHeader('Content-Type', "application/vnd.ozp-iwc-data-object-v1+json");
        res.status(200).json(wrapped);
    });
});


/**
 * PUT
 * Data Api Resource : /data/{resource}
 *
 * Stores the desired resource in the NeDB.
 * @TODO Currently takes raw text/plain
 */
router.put(/\/(.*)/, function(req,res){
    var obj = {
        'key': req.params[0],
        'entity': req.rawBody
    };
    if(obj.key[0] === "/") {
        obj.key = obj.key.substr(1);
    }
    console.log(obj);
    data.update({'key': obj.key}, obj, {'upsert': true}, function (err, num, upsert) {

        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        res.status(200).json({ success: { message: "Updated data api resource: " + req.params[0]}});
    });
});

/**
 * Delete
 * Data Api Resource : /data/{resource}
 *
 * Removes the desired resource from the NeDB.
 */
router.delete(/\/(.*)/, function (req, res) {
    data.remove({ 'key': req.params[0] }, function (err, num) {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        res.send(204);
    });
});

module.exports = router;
