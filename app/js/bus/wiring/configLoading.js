/**
 * Configs, override in iwc.conf.js and include prior to ozpIwc-bus.js.
 */
var ozpIwc=ozpIwc || {};
/**
 * An object of configuration variables for the IWC Bus.
 * @namespace ozpIwc
 * @property ozpIwc.config
 * @type {Object}
 */
ozpIwc.config = ozpIwc.config || {};

/**
 * A configurable version string used by the debugger to give easy access to current IWC build. If modifying
 * IWC code outside of distribution, add version references to ozpIwc.conf.js for distinguishing, otherwise IWC
 * distrobution builds will update this default value.
 *
 * @namespace ozpIwc
 * @property ozpIwc.config.version
 * @type String
 * @default "1.0.10"
 */
ozpIwc.config.version = ozpIwc.util.ifUndef(ozpIwc.util.ifUndef(ozpIwc.config.version || "1.0.10"));

/**
 * A configurable log level for IWC internal messages. Only messages equal to, or less than the log level will be
 * written to the console:
 *  0  : NONE
 *  1  : DEFAULT
 *  3  : ERROR
 *  6  : INFO
 *  7  : DEBUG
 *  10 : ALL
 *
 * @namespace ozpIwc
 * @property ozpIwc.config.threshold
 * @type Number
 * @default 6
 */
ozpIwc.config.logLevel = ozpIwc.util.ifUndef(ozpIwc.config.logLevel || 6);

/**
 * A configurable time for bus consensus algorithms to use to determine an election rounds result.
 * @namespace ozpIwc
 * @property ozpIwc.config.consensusTimeout
 * @type Number
 * @default 3000
 */
ozpIwc.config.consensusTimeout = ozpIwc.util.ifUndef(ozpIwc.config.consensusTimeout  || 3000);

/**
 * A configurable time for bus components to use for their heartbeat intervals.
 * @namespace ozpIwc
 * @property ozpIwc.config.heartBeatFrequency
 * @type Number
 * @default 20000
 */
ozpIwc.config.heartBeatFrequency = ozpIwc.util.ifUndef(ozpIwc.config.heartBeatFrequency || 20000);

/**
 * A configurable url for the root of api resources. Override with backend specific path in ozpIwc.conf.js.
 * @namespace ozpIwc
 * @property ozpIwc.config.apiRootUrl
 * @type String
 * @default "/"
 */
ozpIwc.config.apiRootUrl =  ozpIwc.util.ifUndef(ozpIwc.config.apiRootUrl || "/");

/**
 * A configurable url for security policy loading. Override with backend specific path in ozpIwc.conf.js.
 * @namespace ozpIwc
 * @property ozpIwc.config.policyRootUrl
 * @type String
 * @default "/policy"
 */
ozpIwc.config.policyRootUrl = ozpIwc.util.ifUndef(ozpIwc.config.policyRootUrl || "/policy");

/**
 * A configurable prefix for link relations on resources.
 * @namespace ozpIwc
 * @property ozpIwc.config.linkRelPrefix
 * @type String
 * @default "ozp"
 */
ozpIwc.config.linkRelPrefix = ozpIwc.util.ifUndef(ozpIwc.config.linkRelPrefix || "ozp");

/**
 * A configurable url for the intent chooser's path. If a custom intent chooser is to be deployed, override this
 * variable in the ozpIwc.conf.js
 * @namespace ozpIwc
 * @property ozpIwc.config.intentsChooserUri
 * @type String
 * @default "intentsChooser.html"
 */
ozpIwc.config.intentsChooserUri = ozpIwc.util.ifUndef(ozpIwc.config.intentsChooserUri || "intentsChooser.html");

/**
 * A configuration flag for the iwc.conf.js file. If true, app/js/build-config/legacySupport.js configurations are used.
 * @namespace ozpIwc
 * @property ozpIwc.config.legacySupport
 * @type Boolean
 * @default true
 */
ozpIwc.config.legacySupport = ozpIwc.util.ifUndef(ozpIwc.config.legacySupport,true);

/**
 * A configuration flag for the iwc.conf.js file. If false, app/js/build-config/backendSupport.js configurations are used.
 * @namespace ozpIwc
 * @property ozpIwc.config.backendSupport
 * @type Boolean
 * @default false
 */
ozpIwc.config.backendSupport = ozpIwc.util.ifUndef(ozpIwc.config.backendSupport,false);

/**
 * A configuration flag for the iwc.conf.js file. If true, app/js/bus/config/defaultWiring.js instantiates the Api modules.
 * @namespace ozpIwc
 * @property ozpIwc.config.runApis
 * @type Boolean
 * @default true
 */
ozpIwc.config.runApis = ozpIwc.util.ifUndef(ozpIwc.config.runApis,true);

/**
 * A configuration flag for the iwc.conf.js file. If true, app/js/bus/config/defaultWiring.js allows connections to ozpIwc clients
 * in the same browsing window. Often set to false for the intent chooser/debugger as they are directly connected to the
 * bus.
 *
 * @namespace ozpIwc
 * @property ozpIwc.config.allowLocalClients
 * @type Boolean
 * @default true
 */
ozpIwc.config.allowLocalClients = ozpIwc.util.ifUndef(ozpIwc.config.allowLocalClients,true);

/**
 * A configuration flag for the iwc.conf.js file. If true, app/js/bus/config/defaultWiring.js will instantiate the 
 * default components of the bus if false. Used for integration testing, not intended for end user modification.
 *
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config._testMode
 * @type Boolean
 * @default true
 */
ozpIwc.config._testMode = ozpIwc.util.ifUndef(ozpIwc.config._testMode,false);

/**
 * The absolute path for the bus's root location (ex. http://localhost:13000/).
 * Path is set automatically on bus instantiation, does not need to be set in iwc.conf.js
 *
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config._busRoot
 * @type String
 * @default "<Absolute root path of current browser URL>"
 */
ozpIwc.config._busRoot = ozpIwc.util.ifUndef(ozpIwc.config._busRoot,(function(){
    return window.location.protocol + "//" +
        window.location.host +
        window.location.pathname.replace(/[^\/]+$/,"");
})());


/**
 * Features for the intent chooser's window opener.
 *
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config.intentChooserFeatures
 * @type String
 * @default "width=330,height=500"
 */
ozpIwc.config.intentChooserFeatures = ozpIwc.util.ifUndef(ozpIwc.config.intentChooserFeatures,"width=330,height=500");

/**
 * Root location for owf7 legacy preferences should this bus support legacy widgets through the ozp-iwc-owf7-adapter.
 *
 * @namespace ozpIwc
 * @private
 * @property ozpIwc.config.owf7PrefsUrl
 * @type String
 * @default "/owf/prefs"
 */
ozpIwc.config.owf7PrefsUrl = ozpIwc.util.ifUndef(ozpIwc.config.owf7PrefsUrl,"/owf/prefs");