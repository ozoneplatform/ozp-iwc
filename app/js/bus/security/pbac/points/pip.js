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
 * Returns an asyncAction that will resolve with the attributes stored at the given URN.
 *
 * @method getAttributes(id)
 * @param {String} [subjectId] – The authenticated identity to get attributes for.
 * @returns {ozpIwc.AsyncAction} – Resolves an object of the attributes of the subject.
 * @example URN "ozp:storage:myAttrs" may contain "ozp:iwc:loginTime" and "ozp:iwc:name".
 * getAttributes("ozp:storage:myAttrs") would resolve with the following:
 * ```
 * {
 *      'ozp:iwc:loginTime' : {
 *         'attributeValue': Array<Primative>
 *     },
 *      'ozp:iwc:name' : {
 *         'attributeValue': Array<Primative>
 *     }
 * }
 * ```
 */
ozpIwc.policyAuth.PIP.prototype.getAttributes = function(id){
    var asyncAction = new ozpIwc.AsyncAction();
    var self = this;

    if(this.informationCache[id]) {
        return asyncAction.resolve('success', self.informationCache[id]);
    } else {
        ozpIwc.util.ajax({
            href: id,
            method: "GET"
        }).then(function(data){
            if(typeof data !== "object") {
                return asyncAction.resolve('failure',"Invalid data loaded from the remote PIP");
            }
            self.informationCache[id] = {};
            for(var i in data){
                self.informationCache[id][i] = Array.isArray(data[i] ) ? data[i]  : [data[i] ];
            }
            asyncAction.resolve('success', self.informationCache[id]);
        })['catch'](function(err){
            asyncAction.resolve('failure',err);
        });
        return asyncAction;
    }

};
/**
 * Sets the desired attributes in the cache at the specified URN.
 *
 * @method grantAttributes(subjectId,attributes)
 * @param {String} [subjectId] – The recipient of attributes.
 * @param {object} [attributes] – The attributes to grant (replacing previous values, if applicable)
 */
ozpIwc.policyAuth.PIP.prototype.grantAttributes = function(subjectId,attributes){
    var attrs = {};
    for(var i in attributes){
        attrs[i] = Array.isArray(attributes[i]) ? attributes[i] : [attributes[i]];
    }
    this.informationCache[subjectId] = attrs;
};

/**
 * Merges the attributes stored at the parentId urn into the given subject. All merge conflicts take the parent
 * attribute. Will resolve with the subject when completed.
 *
 * @method grantParent(subjectId,parentSubjectId)
 * @param {String} [subjectId] – The recipient of attributes.
 * @param {String} [parentSubjectId] – The subject to inherit attributes from.
 * @returns {ozpIwc.AsyncAction} resolves with the subject and its granted attributes merged in.
 */
ozpIwc.policyAuth.PIP.prototype.grantParent = function (subjectId,parentId){
    var asyncAction = new ozpIwc.AsyncAction();
    this.informationCache[subjectId] = this.informationCache[subjectId] || {};
    var self = this;

    if(self.informationCache[parentId]){
        for(var i in self.informationCache[parentId]){
            self.informationCache[subjectId][i] = self.informationCache[subjectId][i] || [];
            for(var j in self.informationCache[parentId][i]) {
                if (self.informationCache[subjectId][i].indexOf(self.informationCache[parentId][i][j]) < 0) {
                    self.informationCache[subjectId][i].push(self.informationCache[parentId][i][j]);
                }
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