YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ozpIwc.Client",
        "ozpIwc.Debugger",
        "ozpIwc.Lifespan",
        "ozpIwc.Timer",
        "ozpIwc.alert",
        "ozpIwc.api",
        "ozpIwc.api.Endpoint",
        "ozpIwc.api.EndpointRegistry",
        "ozpIwc.api.Lifespan.Bound",
        "ozpIwc.api.Lifespan.Ephemeral",
        "ozpIwc.api.Lifespan.Persistent",
        "ozpIwc.api.base.Api",
        "ozpIwc.api.base.Node",
        "ozpIwc.api.data.Api",
        "ozpIwc.api.data.node.Node",
        "ozpIwc.api.data.node.Nodev2",
        "ozpIwc.api.error.BadActionError",
        "ozpIwc.api.error.BadContentError",
        "ozpIwc.api.error.BadRequestError",
        "ozpIwc.api.error.BadResourceError",
        "ozpIwc.api.error.BadStateError",
        "ozpIwc.api.error.BaseError",
        "ozpIwc.api.error.NoActionError",
        "ozpIwc.api.error.NoMatchError",
        "ozpIwc.api.error.NoPermissionError",
        "ozpIwc.api.error.NoResourceError",
        "ozpIwc.api.filter.Function",
        "ozpIwc.api.filter.base",
        "ozpIwc.api.filter.standard",
        "ozpIwc.api.intents.Api",
        "ozpIwc.api.intents.FSM",
        "ozpIwc.api.locks.Api",
        "ozpIwc.api.locks.Node",
        "ozpIwc.api.names.Api",
        "ozpIwc.api.names.Node",
        "ozpIwc.api.system.Api",
        "ozpIwc.api.system.node.ApplicationNode",
        "ozpIwc.api.system.node.ApplicationNodeV2",
        "ozpIwc.api.system.node.SystemNode",
        "ozpIwc.api.system.node.UserNode",
        "ozpIwc.api.system.node.UserNodeV2",
        "ozpIwc.apiMap",
        "ozpIwc.log",
        "ozpIwc.metric.Registry",
        "ozpIwc.metric.stats.BinaryHeap",
        "ozpIwc.metric.stats.ExponentiallyDecayingSample",
        "ozpIwc.metric.stats.Sample",
        "ozpIwc.metric.stats.UniformSample",
        "ozpIwc.metric.types.BaseMetric",
        "ozpIwc.metric.types.Counter",
        "ozpIwc.metric.types.Gauge",
        "ozpIwc.metric.types.Histogram",
        "ozpIwc.metric.types.Meter",
        "ozpIwc.network.KeyBroadcastLocalStorageLink",
        "ozpIwc.network.Peer",
        "ozpIwc.packet.Fragment",
        "ozpIwc.packet.FragmentStore",
        "ozpIwc.packet.Network",
        "ozpIwc.packet.Transport",
        "ozpIwc.policyAuth.PolicyCombining",
        "ozpIwc.policyAuth.elements.SecurityAttribute",
        "ozpIwc.policyAuth.points.PDP",
        "ozpIwc.policyAuth.points.PIP",
        "ozpIwc.policyAuth.points.PRP",
        "ozpIwc.policyAuth.points.utils",
        "ozpIwc.policyAuth.policies",
        "ozpIwc.transport.PacketContext",
        "ozpIwc.transport.Router",
        "ozpIwc.transport.consensus.Base",
        "ozpIwc.transport.consensus.Bully",
        "ozpIwc.transport.listener.SharedWorker",
        "ozpIwc.transport.participant.Base",
        "ozpIwc.transport.participant.Client",
        "ozpIwc.transport.participant.Debugger",
        "ozpIwc.transport.participant.Internal",
        "ozpIwc.transport.participant.Multicast",
        "ozpIwc.transport.participant.MutexClient",
        "ozpIwc.transport.participant.PostMessage",
        "ozpIwc.transport.participant.RouterWatchdog",
        "ozpIwc.transport.participant.SharedWorker",
        "ozpIwc.util",
        "ozpIwc.util.AjaxPersistenceQueue",
        "ozpIwc.util.ApiPromiseMixin",
        "ozpIwc.util.AsyncAction",
        "ozpIwc.util.CancelableEvent",
        "ozpIwc.util.Event",
        "ozpIwc.util.PacketRouter",
        "ozpIwc.util.Reference",
        "ozpIwc.util.mutex",
        "ozpIwc.util.object",
        "ozpIwc.wiring"
    ],
    "modules": [
        "ozpIwc",
        "ozpIwc.api",
        "ozpIwc.api.data",
        "ozpIwc.api.data.node",
        "ozpIwc.api.intents",
        "ozpIwc.api.intents.node",
        "ozpIwc.api.system",
        "ozpIwc.api.system.node",
        "ozpIwc.metric",
        "ozpIwc.metric.stats",
        "ozpIwc.metric.types",
        "ozpIwc.network",
        "ozpIwc.packet",
        "ozpIwc.policyAuth",
        "ozpIwc.policyAuth.elements",
        "ozpIwc.policyAuth.points",
        "ozpIwc.transport",
        "ozpIwc.util",
        "ozpIwc.worker"
    ],
    "allModules": [
        {
            "displayName": "ozpIwc",
            "name": "ozpIwc"
        },
        {
            "displayName": "ozpIwc.api",
            "name": "ozpIwc.api",
            "description": "Creates a persistent lifespan object"
        },
        {
            "displayName": "ozpIwc.api.base",
            "name": "ozpIwc.api.base",
            "description": "The base class for APIs. Use {{#crossLink \"ozpIwc.api.createApi\"}}{{/crossLink}} to subclass\nthis.\n\nLeader State Management\n=======================\nThe base API uses locks.api to always have a single leader at a time.  An api instance goes\nthrough a linear series of states:  member -> loading -> leader\n* __member__ does not service requests\n* __loading__ is a transitory state between acquiring the leader lock and being ready to serve requests\n* __leader__ actively serves requests and broadcasts a death scream upon shutdown\n\nThe member state has two substates-- ready and dormant\n * __ready__ queues requests in case it has to become leader.  switches back to dormant on discovering a leader\n * __dormant__ silently drops requests.  Upon hearing a deathScream, it switches to ready."
        },
        {
            "displayName": "ozpIwc.api.data",
            "name": "ozpIwc.api.data",
            "description": "The Data Api.\nSubclasses the {{#crossLink \"ozpIwc.api.base.Api\"}}{{/crossLink}}."
        },
        {
            "displayName": "ozpIwc.api.data.node",
            "name": "ozpIwc.api.data.node",
            "description": "A data Api Node class for content-type \"application/vnd.ozp-iwc-data-object+json;version=2\"."
        },
        {
            "displayName": "ozpIwc.api.error",
            "name": "ozpIwc.api.error",
            "description": "A base class for IWC error objects."
        },
        {
            "displayName": "ozpIwc.api.filter",
            "name": "ozpIwc.api.filter",
            "description": "A collection of basic filter generation functions."
        },
        {
            "displayName": "ozpIwc.api.intents",
            "name": "ozpIwc.api.intents",
            "description": "The Intents Api.\nSubclasses the {{#crossLink \"ozpIwc.api.base.Api\"}}{{/crossLink}}."
        },
        {
            "displayName": "ozpIwc.api.intents.node",
            "name": "ozpIwc.api.intents.node"
        },
        {
            "displayName": "ozpIwc.api.locks",
            "name": "ozpIwc.api.locks",
            "description": "The Locks Api. Treats each node as an individual mutex, creating a queue to access/own the resource.\nSubclasses the {{#crossLink \"ozpIwc.api.base.Api\"}}{{/crossLink}}. Utilizes the\n{{#crossLink \"ozpIwc.api.locks.Node\"}}{{/crossLink}} which subclasses the\n{{#crossLink \"ozpIwc.CommonApiValue\"}}{{/crossLink}}."
        },
        {
            "displayName": "ozpIwc.api.names",
            "name": "ozpIwc.api.names",
            "description": "The Names Api. Collects information about current IWC state, Manages names, aliases, and permissions through the\nIWC. Subclasses the {{#crossLink \"ozpIwc.api.base.Api\"}}{{/crossLink}}."
        },
        {
            "displayName": "ozpIwc.api.system",
            "name": "ozpIwc.api.system",
            "description": "The System Api. Provides reference data of registered applications, versions, and information about the current\nuser through the IWC. Subclasses the {{#crossLink \"ozpIwc.api.base.Api\"}}{{/crossLink}}."
        },
        {
            "displayName": "ozpIwc.api.system.node",
            "name": "ozpIwc.api.system.node",
            "description": "The same schema as UserNode, but content type naming scheme changed."
        },
        {
            "displayName": "ozpIwc.metric",
            "name": "ozpIwc.metric",
            "description": "A repository of metrics"
        },
        {
            "displayName": "ozpIwc.metric.stats",
            "name": "ozpIwc.metric.stats",
            "description": "Statistics classes for the ozpIwc Metrics"
        },
        {
            "displayName": "ozpIwc.metric.types",
            "name": "ozpIwc.metric.types",
            "description": "A counter running total that can be adjusted up or down.\nWhere a meter is set to a known value at each update, a\ncounter is incremented up or down by a known change."
        },
        {
            "displayName": "ozpIwc.network",
            "name": "ozpIwc.network",
            "description": "<p>This link connects peers using the HTML5 localstorage API.  It is a second generation version of\nthe localStorageLink that bypasses most of the garbage collection issues.\n\n<p> When a packet is sent, this link turns it to a string, creates a key with that value, and\nimmediately deletes it.  This still sends the storage event containing the packet as the key.\nThis completely eliminates the need to garbage collect the localstorage space, with the associated\nmutex contention and full-buffer issues."
        },
        {
            "displayName": "ozpIwc.packet",
            "name": "ozpIwc.packet",
            "description": "Various packet definitions for the network aspects of the IWC. These are not instantiable, rather guidelines for\nconforming to classes that use them."
        },
        {
            "displayName": "ozpIwc.policyAuth",
            "name": "ozpIwc.policyAuth"
        },
        {
            "displayName": "ozpIwc.policyAuth.elements",
            "name": "ozpIwc.policyAuth.elements",
            "description": "A security attribute constructor for policyAuth use. Structured to be common to both bus-internal and api needs."
        },
        {
            "displayName": "ozpIwc.policyAuth.points",
            "name": "ozpIwc.policyAuth.points",
            "description": "System entity that evaluates applicable policy and renders an authorization decision."
        },
        {
            "displayName": "ozpIwc.transport",
            "name": "ozpIwc.transport"
        },
        {
            "displayName": "ozpIwc.transport.consensus",
            "name": "ozpIwc.transport.consensus",
            "description": "A base-class for consensus modules."
        },
        {
            "displayName": "ozpIwc.transport.listener",
            "name": "ozpIwc.transport.listener"
        },
        {
            "displayName": "ozpIwc.transport.participant",
            "name": "ozpIwc.transport.participant",
            "description": "Base class for Participant listeners. Should be inherited from for different browser transport components."
        },
        {
            "displayName": "ozpIwc.util",
            "name": "ozpIwc.util",
            "description": "An AJAX queueing class that limits the amount of AJAX requests via the IWC by using ajax pools."
        },
        {
            "displayName": "ozpIwc.worker",
            "name": "ozpIwc.worker",
            "description": "Various scripts loaded into webWorkers to enhance the IWCs performance"
        }
    ],
    "elements": []
} };
});