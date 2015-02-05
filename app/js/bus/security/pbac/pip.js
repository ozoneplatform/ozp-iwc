ozpIwc = ozpIwc || {};


ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * Policy Information Point
 *
 * @param config
 * @param {Object} config.informationCache
 * @constructor
 */
ozpIwc.policyAuth.PIP = function(config){
    config = config || {};


    this.informationCache = config.informationCache || {};


};


/**
 * @method getAttributes(id)
 * @param {String} [subjectId] – The authenticated identity to get attributes for.
 * @returns {Promise} – Returns the attributes of the subject merged with any parent subjects.
 */
ozpIwc.policyAuth.PIP.prototype.getAttributes = function(id){
    var asyncAction = new ozpIwc.AsyncAction();
    var self = this;

    if(this.informationCache[id]) {
        var returnObj = {};
        returnObj[id] = self.informationCache[id];
        return asyncAction.resolve('success', returnObj);
    } else {
        ozpIwc.util.ajax({
            href: id,
            method: "GET"
        }).then(function(data){
            if(data.attributeValue) {
                self.informationCache[id] = {};
                self.informationCache[id].attributeValue = Array.isArray(data.attributeValue ) ?
                    data.attributeValue  : [data.attributeValue ];
                    var returnObj = {};
                    returnObj[id] = self.informationCache[id];
                asyncAction.resolve('success',returnObj);
            } else {
                asyncAction.resolve('failure',"Invalid data loaded from the remote PIP");
            }
        })['catch'](function(err){
            asyncAction.resolve('failure',err);
        });
        return asyncAction;
    }

};
/**
 * @method grantAttributes(subjectId,attributes)
 * @param {String} [subjectId] – The recipient of attributes.
 * @param {object} [attributes] – The attributes to grant (replacing previous values, if applicable)
 */
ozpIwc.policyAuth.PIP.prototype.grantAttributes = function(subjectId,attributes){
    this.informationCache[subjectId] = attributes;
};

/**
 * @method grantParent(subjectId,parentSubjectId)
 * @param {String} [subjectId] – The recipient of attributes.
 * @param {String} [parentSubjectId] – The subject to inherit attributes from.
 */
ozpIwc.policyAuth.PIP.prototype.grantParent = function (subjectId,parentId){
    var asyncAction = new ozpIwc.AsyncAction();
    this.informationCache[subjectId] = this.informationCache[subjectId] || [];
    var self = this;

    if(self.informationCache[parentId]){
        for(var i in self.informationCache[parentId]){
            if(self.informationCache[subjectId].indexOf(self.informationCache[parentId]) < 0){
                self.informationCache[subjectId].push(self.informationCache[parentId][i]);
            }
        }
        return asyncAction.resolve('success',self.informationCache[subjectId]);

    } else {
        self.getAttributes(parentId)
            .success(function(attributes){
                for(var i in attributes){
                    if(self.informationCache[subjectId].indexOf(attributes[i]) < 0) {
                        self.informationCache[subjectId].push(attributes[i]);
                    }
                }
                asyncAction.resolve('success',self.informationCache[subjectId]);
            }).failure(function(err){
                asyncAction.resolve('failure',err);
            });
        return asyncAction;
    }
};