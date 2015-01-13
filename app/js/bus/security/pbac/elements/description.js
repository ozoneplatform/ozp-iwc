ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * The <Description> element contains a free-form description of the <PolicySet>, <Policy>, <Rule> or <Apply> element.
 * The <Description> element is of xs:string simple type.
 * @class Description
 * @namespace ozpIwc.policyAuth
 * @param string
 * @returns {*}
 * @constructor
 */
ozpIwc.policyAuth.Description = function(string){
    var ret = string;
    if(typeof ret !== "string"){
        ret = JSON.stringify(string);
    }
    return ret;
};