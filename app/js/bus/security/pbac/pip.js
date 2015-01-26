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
    var self = this;
    if(this.informationCache[id]){
        return new Promise(function(resolve,reject){
            resolve(self.informationCache[id]);
        });
    } else {
        return ozpIwc.util.ajax({
            href: id,
            method: "GET"
        }).then(function (data) {
            self.informationCache[id] = data;
            return data;
        });
    }

};
/**
 * @method grantAttributes(subjectId,attributes)
 * @param {String} [subjectId] – The recipient of attributes.
 * @param {object} [attributes] – The attributes to grant (replacing previous values, if applicable)
 */
ozpIwc.policyAuth.PIP.prototype.grantAttributes = function(subjectId,attributes){
    this.informationCache[subjectId] = this.informationCache[subjectId] || {};
    for(var i in attributes){
        this.informationCache[subjectId][i] = attributes[i];
    }
};

/**
 * @method grantParent(subjectId,parentSubjectId)
 * @param {String} [subjectId] – The recipient of attributes.
 * @param {String} [parentSubjectId] – The subject to inherit attributes from.
 */
ozpIwc.policyAuth.PIP.prototype.grantParent = function (subjectId,parentId){
    this.informationCache[subjectId] = this.informationCache[subjectId] || {};
    var self = this;
    return new Promise(function(resolve,reject){

        if(self.informationCache[parentId]){
            for(var i in self.informationCache[parentId]){
                self.informationCache[subjectId][i] = self.informationCache[parentId][i];
            }
            resolve(self.informationCache[subjectId]);
        } else {
            return self.getAttributes(parentId).then(function(attributes){
                for(var i in attributes){
                    self.informationCache[subjectId][i] = attributes[i];
                }
                return attributes;
            });
        }
    });
};