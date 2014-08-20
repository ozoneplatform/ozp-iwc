/** @namespace */
var ozpIwc=ozpIwc || {};


/**
 * A deferred action, but not in the sense of the Javascript standard.
 * @class
 */
ozpIwc.AsyncAction=function() {
	this.callbacks={};
};

ozpIwc.AsyncAction.prototype.when=function(state,callback,self) {
    self=self || this;
	
	if(this.resolution === state) {
		callback.apply(self,this.value);
	} else {
		this.callbacks[state]=function() { return callback.apply(self,arguments); };
	}
	return this;
};


ozpIwc.AsyncAction.prototype.resolve=function(status) {
	if(this.resolution) {
		throw "Cannot resolve an already resolved AsyncAction";
	}
	var callback=this.callbacks[status];
	this.resolution=status;
	this.value=Array.prototype.slice.call(arguments,1);
	
	if(callback) {
		callback.apply(this,this.value);
	}
	return this;
};

ozpIwc.AsyncAction.prototype.success=function(callback,self) {
	return this.when("success",callback,self);
};

ozpIwc.AsyncAction.prototype.failure=function(callback,self) {
	return this.when("failure",callback,self);
};
/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */
(function(e,t){if(typeof define==="function"&&define.amd){define(t)}else if(typeof exports==="object"){module.exports=t()}else{e.returnExports=t()}})(this,function(){var e=Function.prototype.call;var t=Object.prototype;var r=e.bind(t.hasOwnProperty);var n;var o;var i;var c;var f=r(t,"__defineGetter__");if(f){n=e.bind(t.__defineGetter__);o=e.bind(t.__defineSetter__);i=e.bind(t.__lookupGetter__);c=e.bind(t.__lookupSetter__)}if(!Object.getPrototypeOf){Object.getPrototypeOf=function g(e){var r=e.__proto__;if(r||r===null){return r}else if(e.constructor){return e.constructor.prototype}else{return t}}}function u(e){try{e.sentinel=0;return Object.getOwnPropertyDescriptor(e,"sentinel").value===0}catch(t){}}if(Object.defineProperty){var p=u({});var a=typeof document==="undefined"||u(document.createElement("div"));if(!a||!p){var l=Object.getOwnPropertyDescriptor}}if(!Object.getOwnPropertyDescriptor||l){var b="Object.getOwnPropertyDescriptor called on a non-object: ";Object.getOwnPropertyDescriptor=function E(e,n){if(typeof e!=="object"&&typeof e!=="function"||e===null){throw new TypeError(b+e)}if(l){try{return l.call(Object,e,n)}catch(o){}}if(!r(e,n)){return}var u={enumerable:true,configurable:true};if(f){var p=e.__proto__;var a=e!==t;if(a){e.__proto__=t}var _=i(e,n);var s=c(e,n);if(a){e.__proto__=p}if(_||s){if(_){u.get=_}if(s){u.set=s}return u}}u.value=e[n];u.writable=true;return u}}if(!Object.getOwnPropertyNames){Object.getOwnPropertyNames=function x(e){return Object.keys(e)}}if(!Object.create){var _;var s=!({__proto__:null}instanceof Object);if(s||typeof document==="undefined"){_=function(){return{__proto__:null}}}else{_=function(){var e=document.createElement("iframe");var t=document.body||document.documentElement;e.style.display="none";t.appendChild(e);e.src="javascript:";var r=e.contentWindow.Object.prototype;t.removeChild(e);e=null;delete r.constructor;delete r.hasOwnProperty;delete r.propertyIsEnumerable;delete r.isPrototypeOf;delete r.toLocaleString;delete r.toString;delete r.valueOf;r.__proto__=null;function n(){}n.prototype=r;_=function(){return new n};return new n}}Object.create=function z(e,t){var r;function n(){}if(e===null){r=_()}else{if(typeof e!=="object"&&typeof e!=="function"){throw new TypeError("Object prototype may only be an Object or null")}n.prototype=e;r=new n;r.__proto__=e}if(t!==void 0){Object.defineProperties(r,t)}return r}}function d(e){try{Object.defineProperty(e,"sentinel",{});return"sentinel"in e}catch(t){}}if(Object.defineProperty){var y=d({});var O=typeof document==="undefined"||d(document.createElement("div"));if(!y||!O){var j=Object.defineProperty,v=Object.defineProperties}}if(!Object.defineProperty||j){var w="Property description must be an object: ";var P="Object.defineProperty called on non-object: ";var m="getters & setters can not be defined "+"on this javascript engine";Object.defineProperty=function S(e,u,p){if(typeof e!=="object"&&typeof e!=="function"||e===null){throw new TypeError(P+e)}if(typeof p!=="object"&&typeof p!=="function"||p===null){throw new TypeError(w+p)}if(j){try{return j.call(Object,e,u,p)}catch(a){}}if(r(p,"value")){if(f&&(i(e,u)||c(e,u))){var l=e.__proto__;e.__proto__=t;delete e[u];e[u]=p.value;e.__proto__=l}else{e[u]=p.value}}else{if(!f){throw new TypeError(m)}if(r(p,"get")){n(e,u,p.get)}if(r(p,"set")){o(e,u,p.set)}}return e}}if(!Object.defineProperties||v){Object.defineProperties=function T(e,t){if(v){try{return v.call(Object,e,t)}catch(n){}}for(var o in t){if(r(t,o)&&o!=="__proto__"){Object.defineProperty(e,o,t[o])}}return e}}if(!Object.seal){Object.seal=function D(e){return e}}if(!Object.freeze){Object.freeze=function k(e){return e}}try{Object.freeze(function(){})}catch(h){Object.freeze=function F(e){return function t(r){if(typeof r==="function"){return r}else{return e(r)}}}(Object.freeze)}if(!Object.preventExtensions){Object.preventExtensions=function G(e){return e}}if(!Object.isSealed){Object.isSealed=function C(e){return false}}if(!Object.isFrozen){Object.isFrozen=function N(e){return false}}if(!Object.isExtensible){Object.isExtensible=function I(e){if(Object(e)!==e){throw new TypeError}var t="";while(r(e,t)){t+="?"}e[t]=true;var n=r(e,t);delete e[t];return n}}});
//# sourceMappingURL=es5-sham.map
/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */
(function(t,e){if(typeof define==="function"&&define.amd){define(e)}else if(typeof exports==="object"){module.exports=e()}else{t.returnExports=e()}})(this,function(){var t=Array.prototype;var e=Object.prototype;var r=Function.prototype;var n=String.prototype;var i=Number.prototype;var a=t.slice;var o=t.splice;var l=t.push;var u=t.unshift;var s=r.call;var f=e.toString;var c=function(t){return e.toString.call(t)==="[object Function]"};var h=function(t){return e.toString.call(t)==="[object RegExp]"};var p=function ve(t){return f.call(t)==="[object Array]"};var v=function ge(t){return f.call(t)==="[object String]"};var g=function ye(t){var e=f.call(t);var r=e==="[object Arguments]";if(!r){r=!p(e)&&t!==null&&typeof t==="object"&&typeof t.length==="number"&&t.length>=0&&c(t.callee)}return r};var y=Object.defineProperty&&function(){try{Object.defineProperty({},"x",{});return true}catch(t){return false}}();var d;if(y){d=function(t,e,r,n){if(!n&&e in t){return}Object.defineProperty(t,e,{configurable:true,enumerable:false,writable:true,value:r})}}else{d=function(t,e,r,n){if(!n&&e in t){return}t[e]=r}}var m=function(t,r,n){for(var i in r){if(e.hasOwnProperty.call(r,i)){d(t,i,r[i],n)}}};function w(t){t=+t;if(t!==t){t=0}else if(t!==0&&t!==1/0&&t!==-(1/0)){t=(t>0||-1)*Math.floor(Math.abs(t))}return t}function b(t){var e=typeof t;return t===null||e==="undefined"||e==="boolean"||e==="number"||e==="string"}function x(t){var e,r,n;if(b(t)){return t}r=t.valueOf;if(c(r)){e=r.call(t);if(b(e)){return e}}n=t.toString;if(c(n)){e=n.call(t);if(b(e)){return e}}throw new TypeError}var S=function(t){if(t==null){throw new TypeError("can't convert "+t+" to object")}return Object(t)};var O=function de(t){return t>>>0};function T(){}m(r,{bind:function me(t){var e=this;if(!c(e)){throw new TypeError("Function.prototype.bind called on incompatible "+e)}var r=a.call(arguments,1);var n=function(){if(this instanceof u){var n=e.apply(this,r.concat(a.call(arguments)));if(Object(n)===n){return n}return this}else{return e.apply(t,r.concat(a.call(arguments)))}};var i=Math.max(0,e.length-r.length);var o=[];for(var l=0;l<i;l++){o.push("$"+l)}var u=Function("binder","return function ("+o.join(",")+"){return binder.apply(this,arguments)}")(n);if(e.prototype){T.prototype=e.prototype;u.prototype=new T;T.prototype=null}return u}});var j=s.bind(e.hasOwnProperty);var E;var N;var I;var D;var _;if(_=j(e,"__defineGetter__")){E=s.bind(e.__defineGetter__);N=s.bind(e.__defineSetter__);I=s.bind(e.__lookupGetter__);D=s.bind(e.__lookupSetter__)}var M=function(){var t=[1,2];var e=t.splice();return t.length===2&&p(e)&&e.length===0}();m(t,{splice:function we(t,e){if(arguments.length===0){return[]}else{return o.apply(this,arguments)}}},M);var F=function(){var e={};t.splice.call(e,0,0,1);return e.length===1}();m(t,{splice:function be(t,e){if(arguments.length===0){return[]}var r=arguments;this.length=Math.max(w(this.length),0);if(arguments.length>0&&typeof e!=="number"){r=a.call(arguments);if(r.length<2){r.push(this.length-t)}else{r[1]=w(e)}}return o.apply(this,r)}},!F);var R=[].unshift(0)!==1;m(t,{unshift:function(){u.apply(this,arguments);return this.length}},R);m(Array,{isArray:p});var k=Object("a");var C=k[0]!=="a"||!(0 in k);var U=function xe(t){var e=true;var r=true;if(t){t.call("foo",function(t,r,n){if(typeof n!=="object"){e=false}});t.call([1],function(){"use strict";r=typeof this==="string"},"x")}return!!t&&e&&r};m(t,{forEach:function Se(t){var e=S(this),r=C&&v(this)?this.split(""):e,n=arguments[1],i=-1,a=r.length>>>0;if(!c(t)){throw new TypeError}while(++i<a){if(i in r){t.call(n,r[i],i,e)}}}},!U(t.forEach));m(t,{map:function Oe(t){var e=S(this),r=C&&v(this)?this.split(""):e,n=r.length>>>0,i=Array(n),a=arguments[1];if(!c(t)){throw new TypeError(t+" is not a function")}for(var o=0;o<n;o++){if(o in r){i[o]=t.call(a,r[o],o,e)}}return i}},!U(t.map));m(t,{filter:function Te(t){var e=S(this),r=C&&v(this)?this.split(""):e,n=r.length>>>0,i=[],a,o=arguments[1];if(!c(t)){throw new TypeError(t+" is not a function")}for(var l=0;l<n;l++){if(l in r){a=r[l];if(t.call(o,a,l,e)){i.push(a)}}}return i}},!U(t.filter));m(t,{every:function je(t){var e=S(this),r=C&&v(this)?this.split(""):e,n=r.length>>>0,i=arguments[1];if(!c(t)){throw new TypeError(t+" is not a function")}for(var a=0;a<n;a++){if(a in r&&!t.call(i,r[a],a,e)){return false}}return true}},!U(t.every));m(t,{some:function Ee(t){var e=S(this),r=C&&v(this)?this.split(""):e,n=r.length>>>0,i=arguments[1];if(!c(t)){throw new TypeError(t+" is not a function")}for(var a=0;a<n;a++){if(a in r&&t.call(i,r[a],a,e)){return true}}return false}},!U(t.some));var A=false;if(t.reduce){A=typeof t.reduce.call("es5",function(t,e,r,n){return n})==="object"}m(t,{reduce:function Ne(t){var e=S(this),r=C&&v(this)?this.split(""):e,n=r.length>>>0;if(!c(t)){throw new TypeError(t+" is not a function")}if(!n&&arguments.length===1){throw new TypeError("reduce of empty array with no initial value")}var i=0;var a;if(arguments.length>=2){a=arguments[1]}else{do{if(i in r){a=r[i++];break}if(++i>=n){throw new TypeError("reduce of empty array with no initial value")}}while(true)}for(;i<n;i++){if(i in r){a=t.call(void 0,a,r[i],i,e)}}return a}},!A);var P=false;if(t.reduceRight){P=typeof t.reduceRight.call("es5",function(t,e,r,n){return n})==="object"}m(t,{reduceRight:function Ie(t){var e=S(this),r=C&&v(this)?this.split(""):e,n=r.length>>>0;if(!c(t)){throw new TypeError(t+" is not a function")}if(!n&&arguments.length===1){throw new TypeError("reduceRight of empty array with no initial value")}var i,a=n-1;if(arguments.length>=2){i=arguments[1]}else{do{if(a in r){i=r[a--];break}if(--a<0){throw new TypeError("reduceRight of empty array with no initial value")}}while(true)}if(a<0){return i}do{if(a in r){i=t.call(void 0,i,r[a],a,e)}}while(a--);return i}},!P);var Z=Array.prototype.indexOf&&[0,1].indexOf(1,2)!==-1;m(t,{indexOf:function De(t){var e=C&&v(this)?this.split(""):S(this),r=e.length>>>0;if(!r){return-1}var n=0;if(arguments.length>1){n=w(arguments[1])}n=n>=0?n:Math.max(0,r+n);for(;n<r;n++){if(n in e&&e[n]===t){return n}}return-1}},Z);var J=Array.prototype.lastIndexOf&&[0,1].lastIndexOf(0,-3)!==-1;m(t,{lastIndexOf:function _e(t){var e=C&&v(this)?this.split(""):S(this),r=e.length>>>0;if(!r){return-1}var n=r-1;if(arguments.length>1){n=Math.min(n,w(arguments[1]))}n=n>=0?n:r-Math.abs(n);for(;n>=0;n--){if(n in e&&t===e[n]){return n}}return-1}},J);var z=!{toString:null}.propertyIsEnumerable("toString"),$=function(){}.propertyIsEnumerable("prototype"),G=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],B=G.length;m(Object,{keys:function Me(t){var e=c(t),r=g(t),n=t!==null&&typeof t==="object",i=n&&v(t);if(!n&&!e&&!r){throw new TypeError("Object.keys called on a non-object")}var a=[];var o=$&&e;if(i||r){for(var l=0;l<t.length;++l){a.push(String(l))}}else{for(var u in t){if(!(o&&u==="prototype")&&j(t,u)){a.push(String(u))}}}if(z){var s=t.constructor,f=s&&s.prototype===t;for(var h=0;h<B;h++){var p=G[h];if(!(f&&p==="constructor")&&j(t,p)){a.push(p)}}}return a}});var H=Object.keys&&function(){return Object.keys(arguments).length===2}(1,2);var L=Object.keys;m(Object,{keys:function Fe(e){if(g(e)){return L(t.slice.call(e))}else{return L(e)}}},!H);var X=-621987552e5;var Y="-000001";var q=Date.prototype.toISOString&&new Date(X).toISOString().indexOf(Y)===-1;m(Date.prototype,{toISOString:function Re(){var t,e,r,n,i;if(!isFinite(this)){throw new RangeError("Date.prototype.toISOString called on non-finite value.")}n=this.getUTCFullYear();i=this.getUTCMonth();n+=Math.floor(i/12);i=(i%12+12)%12;t=[i+1,this.getUTCDate(),this.getUTCHours(),this.getUTCMinutes(),this.getUTCSeconds()];n=(n<0?"-":n>9999?"+":"")+("00000"+Math.abs(n)).slice(0<=n&&n<=9999?-4:-6);e=t.length;while(e--){r=t[e];if(r<10){t[e]="0"+r}}return n+"-"+t.slice(0,2).join("-")+"T"+t.slice(2).join(":")+"."+("000"+this.getUTCMilliseconds()).slice(-3)+"Z"}},q);var K=false;try{K=Date.prototype.toJSON&&new Date(NaN).toJSON()===null&&new Date(X).toJSON().indexOf(Y)!==-1&&Date.prototype.toJSON.call({toISOString:function(){return true}})}catch(Q){}if(!K){Date.prototype.toJSON=function ke(t){var e=Object(this),r=x(e),n;if(typeof r==="number"&&!isFinite(r)){return null}n=e.toISOString;if(typeof n!=="function"){throw new TypeError("toISOString property is not callable")}return n.call(e)}}var V=Date.parse("+033658-09-27T01:46:40.000Z")===1e15;var W=!isNaN(Date.parse("2012-04-04T24:00:00.500Z"))||!isNaN(Date.parse("2012-11-31T23:59:59.000Z"));var te=isNaN(Date.parse("2000-01-01T00:00:00.000Z"));if(!Date.parse||te||W||!V){Date=function(t){function e(r,n,i,a,o,l,u){var s=arguments.length;if(this instanceof t){var f=s===1&&String(r)===r?new t(e.parse(r)):s>=7?new t(r,n,i,a,o,l,u):s>=6?new t(r,n,i,a,o,l):s>=5?new t(r,n,i,a,o):s>=4?new t(r,n,i,a):s>=3?new t(r,n,i):s>=2?new t(r,n):s>=1?new t(r):new t;f.constructor=e;return f}return t.apply(this,arguments)}var r=new RegExp("^"+"(\\d{4}|[+-]\\d{6})"+"(?:-(\\d{2})"+"(?:-(\\d{2})"+"(?:"+"T(\\d{2})"+":(\\d{2})"+"(?:"+":(\\d{2})"+"(?:(\\.\\d{1,}))?"+")?"+"("+"Z|"+"(?:"+"([-+])"+"(\\d{2})"+":(\\d{2})"+")"+")?)?)?)?"+"$");var n=[0,31,59,90,120,151,181,212,243,273,304,334,365];function i(t,e){var r=e>1?1:0;return n[e]+Math.floor((t-1969+r)/4)-Math.floor((t-1901+r)/100)+Math.floor((t-1601+r)/400)+365*(t-1970)}function a(e){return Number(new t(1970,0,1,0,0,0,e))}for(var o in t){e[o]=t[o]}e.now=t.now;e.UTC=t.UTC;e.prototype=t.prototype;e.prototype.constructor=e;e.parse=function l(e){var n=r.exec(e);if(n){var o=Number(n[1]),l=Number(n[2]||1)-1,u=Number(n[3]||1)-1,s=Number(n[4]||0),f=Number(n[5]||0),c=Number(n[6]||0),h=Math.floor(Number(n[7]||0)*1e3),p=Boolean(n[4]&&!n[8]),v=n[9]==="-"?1:-1,g=Number(n[10]||0),y=Number(n[11]||0),d;if(s<(f>0||c>0||h>0?24:25)&&f<60&&c<60&&h<1e3&&l>-1&&l<12&&g<24&&y<60&&u>-1&&u<i(o,l+1)-i(o,l)){d=((i(o,l)+u)*24+s+g*v)*60;d=((d+f+y*v)*60+c)*1e3+h;if(p){d=a(d)}if(-864e13<=d&&d<=864e13){return d}}return NaN}return t.parse.apply(this,arguments)};return e}(Date)}if(!Date.now){Date.now=function Ce(){return(new Date).getTime()}}var ee=i.toFixed&&(8e-5.toFixed(3)!=="0.000"||.9.toFixed(0)!=="1"||1.255.toFixed(2)!=="1.25"||0xde0b6b3a7640080.toFixed(0)!=="1000000000000000128");var re={base:1e7,size:6,data:[0,0,0,0,0,0],multiply:function Ue(t,e){var r=-1;while(++r<re.size){e+=t*re.data[r];re.data[r]=e%re.base;e=Math.floor(e/re.base)}},divide:function Ae(t){var e=re.size,r=0;while(--e>=0){r+=re.data[e];re.data[e]=Math.floor(r/t);r=r%t*re.base}},numToString:function Pe(){var t=re.size;var e="";while(--t>=0){if(e!==""||t===0||re.data[t]!==0){var r=String(re.data[t]);if(e===""){e=r}else{e+="0000000".slice(0,7-r.length)+r}}}return e},pow:function Ze(t,e,r){return e===0?r:e%2===1?Ze(t,e-1,r*t):Ze(t*t,e/2,r)},log:function Je(t){var e=0;while(t>=4096){e+=12;t/=4096}while(t>=2){e+=1;t/=2}return e}};m(i,{toFixed:function ze(t){var e,r,n,i,a,o,l,u;e=Number(t);e=e!==e?0:Math.floor(e);if(e<0||e>20){throw new RangeError("Number.toFixed called with invalid number of decimals")}r=Number(this);if(r!==r){return"NaN"}if(r<=-1e21||r>=1e21){return String(r)}n="";if(r<0){n="-";r=-r}i="0";if(r>1e-21){a=re.log(r*re.pow(2,69,1))-69;o=a<0?r*re.pow(2,-a,1):r/re.pow(2,a,1);o*=4503599627370496;a=52-a;if(a>0){re.multiply(0,o);l=e;while(l>=7){re.multiply(1e7,0);l-=7}re.multiply(re.pow(10,l,1),0);l=a-1;while(l>=23){re.divide(1<<23);l-=23}re.divide(1<<l);re.multiply(1,1);re.divide(2);i=re.numToString()}else{re.multiply(0,o);re.multiply(1<<-a,0);i=re.numToString()+"0.00000000000000000000".slice(2,2+e)}}if(e>0){u=i.length;if(u<=e){i=n+"0.0000000000000000000".slice(0,e-u+2)+i}else{i=n+i.slice(0,u-e)+"."+i.slice(u-e)}}else{i=n+i}return i}},ee);var ne=n.split;if("ab".split(/(?:ab)*/).length!==2||".".split(/(.?)(.?)/).length!==4||"tesst".split(/(s)*/)[1]==="t"||"test".split(/(?:)/,-1).length!==4||"".split(/.?/).length||".".split(/()()/).length>1){(function(){var e=/()??/.exec("")[1]===void 0;n.split=function(r,n){var i=this;if(r===void 0&&n===0){return[]}if(f.call(r)!=="[object RegExp]"){return ne.call(this,r,n)}var a=[],o=(r.ignoreCase?"i":"")+(r.multiline?"m":"")+(r.extended?"x":"")+(r.sticky?"y":""),l=0,u,s,c,h;r=new RegExp(r.source,o+"g");i+="";if(!e){u=new RegExp("^"+r.source+"$(?!\\s)",o)}n=n===void 0?-1>>>0:O(n);while(s=r.exec(i)){c=s.index+s[0].length;if(c>l){a.push(i.slice(l,s.index));if(!e&&s.length>1){s[0].replace(u,function(){for(var t=1;t<arguments.length-2;t++){if(arguments[t]===void 0){s[t]=void 0}}})}if(s.length>1&&s.index<i.length){t.push.apply(a,s.slice(1))}h=s[0].length;l=c;if(a.length>=n){break}}if(r.lastIndex===s.index){r.lastIndex++}}if(l===i.length){if(h||!r.test("")){a.push("")}}else{a.push(i.slice(l))}return a.length>n?a.slice(0,n):a}})()}else if("0".split(void 0,0).length){n.split=function $e(t,e){if(t===void 0&&e===0){return[]}return ne.call(this,t,e)}}var ie=n.replace;var ae=function(){var t=[];"x".replace(/x(.)?/g,function(e,r){t.push(r)});return t.length===1&&typeof t[0]==="undefined"}();if(!ae){n.replace=function Ge(t,e){var r=c(e);var n=h(t)&&/\)[*?]/.test(t.source);if(!r||!n){return ie.call(this,t,e)}else{var i=function(r){var n=arguments.length;var i=t.lastIndex;t.lastIndex=0;var a=t.exec(r);t.lastIndex=i;a.push(arguments[n-2],arguments[n-1]);return e.apply(this,a)};return ie.call(this,t,i)}}}var oe=n.substr;var le="".substr&&"0b".substr(-1)!=="b";m(n,{substr:function Be(t,e){return oe.call(this,t<0?(t=this.length+t)<0?0:t:t,e)}},le);var ue="	\n\f\r \xa0\u1680\u180e\u2000\u2001\u2002\u2003"+"\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028"+"\u2029\ufeff";var se="\u200b";var fe="["+ue+"]";var ce=new RegExp("^"+fe+fe+"*");var he=new RegExp(fe+fe+"*$");var pe=n.trim&&(ue.trim()||!se.trim());m(n,{trim:function He(){if(this===void 0||this===null){throw new TypeError("can't convert "+this+" to object")}return String(this).replace(ce,"").replace(he,"")}},pe);if(parseInt(ue+"08")!==8||parseInt(ue+"0x16")!==22){parseInt=function(t){var e=/^0[xX]/;return function r(n,i){n=String(n).trim();if(!Number(i)){i=e.test(n)?16:10}return t(n,i)}}(parseInt)}});
//# sourceMappingURL=es5-shim.map
/** @namespace */
var ozpIwc=ozpIwc || {};

/**
	* @class
	*/
ozpIwc.Event=function() {
	this.events={};
};

/**
 * Registers a handler for the the event.
 * @param {string} event The name of the event to trigger on
 * @param {function} callback Function to be invoked
 * @param {object} [self] Used as the this pointer when callback is invoked.
 * @returns {object} A handle that can be used to unregister the callback via [off()]{@link ozpIwc.Event#off}
 */
ozpIwc.Event.prototype.on=function(event,callback,self) {
	var wrapped=callback;
	if(self) {
		wrapped=function() {
			callback.apply(self,arguments);
		};
		wrapped.ozpIwcDelegateFor=callback;
	}
	this.events[event]=this.events[event]||[];
	this.events[event].push(wrapped);
	return wrapped;
};

/**
 * Unregisters an event handler previously registered.
 * @param {type} event
 * @param {type} callback
 */
ozpIwc.Event.prototype.off=function(event,callback) {
	this.events[event]=(this.events[event]||[]).filter( function(h) {
		return h!==callback && h.ozpIwcDelegateFor !== callback;
	});
};

/**
 * Fires an event that will be received by all handlers.
 * @param {string} eventName  - Name of the event
 * @param {object} event - Event object to pass to the handers.
 * @returns {object} The event after all handlers have processed it
 */
ozpIwc.Event.prototype.trigger=function(eventName,event) {
	event = event || new ozpIwc.CancelableEvent();
	var handlers=this.events[eventName] || [];

	handlers.forEach(function(h) {
		h(event);
	});
	return event;
};


/**
 * Adds an on() and off() function to the target that delegate to this object
 * @param {object} target Target to receive the on/off functions
 */
ozpIwc.Event.prototype.mixinOnOff=function(target) {
	var self=this;
	target.on=function() { return self.on.apply(self,arguments);};
	target.off=function() { return self.off.apply(self,arguments);};
};

/**
 * Convenient base for events that can be canceled.  Provides and manages
 * the properties canceled and cancelReason, as well as the member function
 * cancel().
 * @class
 * @param {object} data - Data that will be copied into the event
 */
ozpIwc.CancelableEvent=function(data) {
	data = data || {};
	for(var k in data) {
		this[k]=data[k];
	}
	this.canceled=false;
	this.cancelReason=null;
};

/**
 * Marks the event as canceled.
 * @param {type} reason - A text description of why the event was canceled.
 * @returns {ozpIwc.CancelableEvent} Reference to self
 */
ozpIwc.CancelableEvent.prototype.cancel=function(reason) {
	reason= reason || "Unknown";
	this.canceled=true;
	this.cancelReason=reason;
	return this;
};

/** @namespace */
var ozpIwc=ozpIwc || {};

/**
 * @type {object}
 * @property {function} log - Normal log output.
 * @property {function} error - Error output.
 */
ozpIwc.log=ozpIwc.log || {
	log: function() {
		if(window.console && typeof(window.console.log)==="function") {
			window.console.log.apply(window.console,arguments);
		}
	},
	error: function() {
		if(window.console && typeof(window.console.error)==="function") {
			window.console.error.apply(window.console,arguments);
		}
	}
};

/** @namespace */
var ozpIwc=ozpIwc || {};

/** @namespace */
ozpIwc.util=ozpIwc.util || {};

/**
 * Generates a large hexidecimal string to serve as a unique ID.  Not a guid.
 * @returns {String}
 */
ozpIwc.util.generateId=function() {
    return Math.floor(Math.random() * 0xffffffff).toString(16);
};

/**
 * Used to get the current epoch time.  Tests overrides this
 * to allow a fast-forward on time-based actions.
 * @returns {Number}
 */
ozpIwc.util.now=function() {
    return new Date().getTime();
};

/**
 * Create a class with the given parent in it's prototype chain.
 * @param {function} baseClass - the class being derived from
 * @param {function} newConstructor - the new base class
 * @returns {Function} newConstructor with an augmented prototype
 */
ozpIwc.util.extend=function(baseClass,newConstructor) {
    if(!baseClass || !baseClass.prototype) {
        console.error("Cannot create a new class for ",newConstructor," due to invalid baseclass:",baseClass);
        throw new Error("Cannot create a new class due to invalid baseClass.  Dependency not loaded first?");
    };
    newConstructor.prototype = Object.create(baseClass.prototype);
    newConstructor.prototype.constructor = newConstructor;
    return newConstructor;
};

/**
 * Invokes the callback handler on another event loop as soon as possible.
*/
ozpIwc.util.setImmediate=function(f) {
//    window.setTimeout(f,0);
    window.setImmediate(f);
};

/**
 * Detect browser support for structured clones.
 * @returns {boolean} - true if structured clones are supported,
 * false otherwise
 */
ozpIwc.util.structuredCloneSupport=function() {
    if (ozpIwc.util.structuredCloneSupport.cache !== undefined) {
        return ozpIwc.util.structuredCloneSupport.cache;
    }
    var onlyStrings = false;
    //If the browser doesn't support structured clones, it will call toString() on the object passed to postMessage.
    //A bug in FF will cause File clone to fail (see https://bugzilla.mozilla.org/show_bug.cgi?id=722126)
    //We detect this using a test Blob
    try {
        window.postMessage({
            toString: function () {
                onlyStrings = true;
            },
            blob: new Blob()
        }, "*");
    } catch (e) {
        onlyStrings=true;
    }
    ozpIwc.util.structuredCloneSupport.cache=!onlyStrings;
    return ozpIwc.util.structuredCloneSupport.cache;
};

ozpIwc.util.structuredCloneSupport.cache=undefined;

/**
 * Does a deep clone of a serializable object.  Note that this will not
 * clone unserializable objects like DOM elements, Date, RegExp, etc.
 * @param {type} value - value to be cloned.
 * @returns {object} - a deep copy of the object
 */
ozpIwc.util.clone=function(value) {
	if(Array.isArray(value) || typeof(value) === 'object') {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (e) {
            console.log(e);
        }
	} else {
		return value;
	}
};


/**
 * Returns true if every needle is found in the haystack.
 * @param {array} haystack - The array to search.
 * @param {array} needles - All of the values to search.
 * @param {function} [equal] - What constitutes equality.  Defaults to a===b.
 * @returns {boolean}
 */
ozpIwc.util.arrayContainsAll=function(haystack,needles,equal) {
    equal=equal || function(a,b) { return a===b;};
    return needles.every(function(needle) { 
        return haystack.some(function(hay) { 
            return equal(hay,needle);
        });
    });
};


/**
 * Returns true if the value every attribute in needs is equal to 
 * value of the same attribute in haystack.
 * @param {array} haystack - The object that must contain all attributes and values.
 * @param {array} needles - The reference object for the attributes and values.
 * @param {function} [equal] - What constitutes equality.  Defaults to a===b.
 * @returns {boolean}
 */
ozpIwc.util.objectContainsAll=function(haystack,needles,equal) {
    equal=equal || function(a,b) { return a===b;};
    
    for(var attribute in needles) {
        if(!equal(haystack[attribute],needles[attribute])) {
            return false;
        }
    }
    return true;
};

ozpIwc.util.parseQueryParams=function(query) {
    query = query || window.location.search;
    var params={};
	var regex=/\??([^&=]+)=?([^&]*)/g;
	var match;
	while(match=regex.exec(query)) {
		params[match[1]]=decodeURIComponent(match[2]);
	}
    return params;
};

ozpIwc.util.ajax = function (config) {

    var result = new ozpIwc.AsyncAction();
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState !== 4) {
            return;
        }

        if (request.status === 200) {
            result.resolve("success", JSON.parse(this.responseText));
        } else {
            result.resolve("failure", this.statusText, this.responseText);
        }
    };
    request.open(config.method, config.href, true);

    if(config.method === "POST") {
        request.send(config.data);
    }
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Cache-Control", "no-cache");
    request.send();

    return result;
};
var ozpIwc=ozpIwc || {};

/**
 * @class
 * This class will be heavily modified in the future.
 *
 * @todo accept a list of peer URLs that are searched in order of preference
 * @param {object} config
 * @param {string} config.peerUrl - Base URL of the peer server
 * @param {boolean} [config.autoPeer=true] - Whether to automatically find and connect to a peer
 */
ozpIwc.Client=function(config) {
	config=config || {};
	this.address="$nobody";
	this.replyCallbacks={};
	this.peerUrl=config.peerUrl;
	var a=document.createElement("a");
	a.href = this.peerUrl;
	this.peerOrigin=a.protocol + "//" + a.hostname;
	if(a.port)
		this.peerOrigin+= ":" + a.port;
	
	
	this.autoPeer=("autoPeer" in config) ? config.autoPeer : true;
	this.msgIdSequence=0;
	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);
	this.receivedPackets=0;
	this.receivedBytes=0;
	this.sentPackets=0;
	this.sentBytes=0;
	this.startTime=ozpIwc.util.now();
    this.window = window;
	var self=this;

	if(this.autoPeer) {
		this.findPeer();
	}

    this.postMessageHandler = function(event) {
        if(event.origin !== self.peerOrigin){
            return;
        }
        try {
            var message=event.data;
            if (typeof(message) === 'string') {
                message=JSON.parse(event.data);
            }
            self.receive(message);
            self.receivedBytes+=(event.data.length * 2);
            self.receivedPackets++;
        } catch(e) {
            // ignore!
        }
    };
	// receive postmessage events
	window.addEventListener("message", this.postMessageHandler, false);
    
    this.preconnectionQueue=[];
    
    this.on("connected",function() {
        self.preconnectionQueue.forEach(function(p) {
            console.log("Sending from queue: ",p);
            self.send(p.fields,p.callback,p.promise);
        });
        self.preconnectionQueue=null;
    });
};

/**
 * Receive a packet from the connected peer.  If the packet is a reply, then
 * the callback for that reply is invoked.  Otherwise, it fires a receive event
 * @fires ozpIwc.Client#receive
 * @protected
 * @param {ozpIwc.TransportPacket} packet
 * @returns {undefined}
 */
ozpIwc.Client.prototype.receive=function(packet) {
    if(packet.replyTo && this.replyCallbacks[packet.replyTo]) {
        if (!this.replyCallbacks[packet.replyTo](packet)) {
            this.cancelCallback(packet.replyTo);
        }
    } else {
        this.events.trigger("receive",packet);
    }
};
/**
 * Used to send a packet
 * @param {string} dst - where to send the packet
 * @param {object} entity - payload of the packet
 * @param {function} callback - callback for any replies. The callback will be
 * persisted if it returns a truth-like value, canceled if it returns a
 * false-like value.
 */
ozpIwc.Client.prototype.send=function(fields,callback,preexistingPromise) {
    var promise= preexistingPromise; // || new Promise();
    if(!(this.isConnected() || fields.dst=="$transport")) {
        // when send is switched to promises, create the promise first and return it here, as well
        console.log("Queuing to be sent later:",arguments);
        this.preconnectionQueue.push({
            'fields': fields,
            'callback': callback,
            'promise': promise
        });
        return promise;
    }
    var now=new Date().getTime();
	var id="p:"+this.msgIdSequence++; // makes the code below read better
	var packet={
		ver: 1,
		src: this.address,
		msgId: id,
		time: now
	};

	for(var k in fields) {
		packet[k]=fields[k];
	}

	if(callback) {
		this.replyCallbacks[id]=callback;
	}
	var data=packet;
    if (!ozpIwc.util.structuredCloneSupport()) {
        data=JSON.stringify(packet);
    }
	this.peer.postMessage(data,'*');
	this.sentBytes+=data.length;
	this.sentPackets++;
	return packet;
};
ozpIwc.Client.prototype.isConnected=function(){
	return this.address !== "$nobody";
};
/**
 * Cancel a callback registration
 * @param (string} msgId - The packet replyTo ID for which the callback was registered
 */
ozpIwc.Client.prototype.cancelCallback=function(msgId) {
    var success=false;
    if (msgId) {
        delete this.replyCallbacks[msgId];
        success=true;
    }
    return success;
};


ozpIwc.Client.prototype.on=function(event,callback) {
	if(event==="connected" && this.isConnected()) {
		callback(this);
		return;
	}
	return this.events.on.apply(this.events,arguments);
};

ozpIwc.Client.prototype.off=function(event,callback) {
    return this.events.off.apply(this.events,arguments);
};

ozpIwc.Client.prototype.disconnect=function() {
    this.replyCallbacks={};
    window.removeEventListener("message",this.postMessageHandler,false);
    if(this.iframe) {
        document.body.removeChild(this.iframe);
    }
};

ozpIwc.Client.prototype.createIframePeer=function(peerUrl) {
    var self=this;
    var createIframeShim=function() {
        self.iframe=document.createElement("iframe");
        self.iframe.src=peerUrl+"/iframe_peer.html";
        self.iframe.height=1;
        self.iframe.width=1;
        self.iframe.style.setProperty ("display", "none", "important")
        self.iframe.addEventListener("load",function() { self.requestAddress(); },false);
        document.body.appendChild(self.iframe);
        self.peer=self.iframe.contentWindow;

    };
    // need at least the body tag to be loaded, so wait until it's loaded
    if(document.readyState === 'complete' ) {
        createIframeShim();
    } else {
        window.addEventListener("load",createIframeShim,false);
    }
};

ozpIwc.Client.prototype.findPeer=function() {
    // check if we have a parent, get address there if so
//	if(window.parent!==window) {
//		this.peer=window.parent;
//		this.requestAddress();
//	} else {
    this.createIframePeer(this.peerUrl);
//	}
};

ozpIwc.Client.prototype.requestAddress=function(){
	// send connect to get our address
	var self=this;
	this.send({dst:"$transport"},function(message) {
		self.address=message.dst;
		self.events.trigger("connected",self);
        return null;//de-register callback
	});
};