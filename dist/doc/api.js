YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ozpIwc.AjaxPersistenceQueue",
        "ozpIwc.ApiBase",
        "ozpIwc.ApiError",
        "ozpIwc.ApiNode",
        "ozpIwc.AsyncAction",
        "ozpIwc.BadActionError",
        "ozpIwc.BadContentError",
        "ozpIwc.BadRequestError",
        "ozpIwc.BadResourceError",
        "ozpIwc.BadStateError",
        "ozpIwc.CancelableEvent",
        "ozpIwc.Client",
        "ozpIwc.ClientParticipant",
        "ozpIwc.CommonApiBase",
        "ozpIwc.CommonApiCollectionValue",
        "ozpIwc.CommonApiValue",
        "ozpIwc.DataApi",
        "ozpIwc.DataNode",
        "ozpIwc.Endpoint",
        "ozpIwc.EndpointRegistry",
        "ozpIwc.Event",
        "ozpIwc.FragmentPacket",
        "ozpIwc.FragmentStore",
        "ozpIwc.IntentsApi",
        "ozpIwc.IntentsInFlightNode",
        "ozpIwc.InternalParticipant",
        "ozpIwc.KeyBroadcastLocalStorageLink",
        "ozpIwc.LeaderGroupParticipant",
        "ozpIwc.Lifespan.Bound",
        "ozpIwc.Lifespan.Ephemeral",
        "ozpIwc.Lifespan.Persistent",
        "ozpIwc.LocksApi",
        "ozpIwc.LocksApiValue",
        "ozpIwc.MetricsRegistry",
        "ozpIwc.MulticastParticipant",
        "ozpIwc.NamesApi",
        "ozpIwc.NamesNode",
        "ozpIwc.NetworkPacket",
        "ozpIwc.NoActionError",
        "ozpIwc.NoMatchError",
        "ozpIwc.NoPermissionError",
        "ozpIwc.NoResourceError",
        "ozpIwc.PacketRouter",
        "ozpIwc.Participant",
        "ozpIwc.Peer",
        "ozpIwc.PostMessageParticipant",
        "ozpIwc.PostMessageParticipantListener",
        "ozpIwc.Router",
        "ozpIwc.RouterWatchdog",
        "ozpIwc.SystemNode",
        "ozpIwc.Timer",
        "ozpIwc.TransportPacket",
        "ozpIwc.TransportPacketContext",
        "ozpIwc.apiFilter",
        "ozpIwc.apiFilter.Function",
        "ozpIwc.log",
        "ozpIwc.metricStats",
        "ozpIwc.metricStats.BinaryHeap",
        "ozpIwc.metricStats.ExponentiallyDecayingSample",
        "ozpIwc.metricTypes.BaseMetric",
        "ozpIwc.metricTypes.Counter",
        "ozpIwc.metricTypes.Gauge",
        "ozpIwc.metricTypes.Histogram",
        "ozpIwc.metricTypes.Meter",
        "ozpIwc.metricsStats.Sample",
        "ozpIwc.metricsStats.UniformSample",
        "ozpIwc.packetRouter",
        "ozpIwc.policyAuth.PDP",
        "ozpIwc.policyAuth.SecurityAttribute",
        "ozpIwc.standardApiFilters",
        "ozpIwc.util",
        "ozpIwcPolicies"
    ],
    "modules": [
        "bus",
        "bus.api",
        "bus.network",
        "bus.security",
        "bus.service",
        "bus.service.Type",
        "bus.service.Value",
        "bus.transport",
        "bus.util",
        "client",
        "common",
        "metrics",
        "metrics.statistics",
        "metrics.types",
        "ozpIwc"
    ],
    "allModules": [
        {
            "displayName": "bus",
            "name": "bus",
            "description": "```\n   .---------------------------.\n  /,--..---..---..---..---..--. `.\n //___||___||___||___||___||___\\_|\n [j__ ######################## [_|\n    \\============================|\n .==|  |\"\"\"||\"\"\"||\"\"\"||\"\"\"| |\"\"\"||\n/======\"---\"\"---\"\"---\"\"---\"=|  =||\n|____    []*  IWC     ____  | ==||\n//  \\\\        BUS    //  \\\\ |===||  hjw -(& kjk)\n\"\\__/\"---------------\"\\__/\"-+---+'\n```"
        },
        {
            "displayName": "bus.api",
            "name": "bus.api",
            "description": "Classes related to api aspects of the IWC."
        },
        {
            "displayName": "bus.api.Type",
            "name": "bus.api.Type",
            "description": "The API classes that can be used on the IWC bus. All of which subclass {{#crossLink \"ozpIwc.CommonApiBase\"}}{{/crossLink}}"
        },
        {
            "displayName": "bus.api.Value",
            "name": "bus.api.Value",
            "description": "The API Value types that can be used in IWC apis. All of which subclass\n{{#crossLink \"CommonApiValue\"}}{{/crossLink}}"
        },
        {
            "displayName": "bus.network",
            "name": "bus.network",
            "description": "Classes related to security aspects of the IWC."
        },
        {
            "displayName": "bus.network.packets",
            "name": "bus.network.packets",
            "description": "Various packet definitions for the network aspects of the IWC. These are not instantiable, rather guidelines for\nconforming to classes that use them."
        },
        {
            "displayName": "bus.security",
            "name": "bus.security",
            "description": "Classes related to security aspects of the IWC."
        },
        {
            "displayName": "bus.service",
            "name": "bus.service"
        },
        {
            "displayName": "bus.service.Type",
            "name": "bus.service.Type",
            "description": "Service API classes of the bus."
        },
        {
            "displayName": "bus.service.Value",
            "name": "bus.service.Value",
            "description": "Service API Value classes of the bus."
        },
        {
            "displayName": "bus.service.Value.Persistance",
            "name": "bus.service.Value.Persistance",
            "description": "Persistance types for the apiNode."
        },
        {
            "displayName": "bus.transport",
            "name": "bus.transport",
            "description": "Classes related to transport aspects of the IWC."
        },
        {
            "displayName": "bus.util",
            "name": "bus.util",
            "description": "Utility methods used on the IWC bus."
        },
        {
            "displayName": "client",
            "name": "client",
            "description": "Client-side functionality of the IWC. This is the API for widget use."
        },
        {
            "displayName": "common",
            "name": "common",
            "description": "Common classes used between both the Client and the Bus."
        },
        {
            "displayName": "metrics",
            "name": "metrics",
            "description": "Metrics capabilities for the IWC."
        },
        {
            "displayName": "metrics.statistics",
            "name": "metrics.statistics",
            "description": "Statistics classes for the ozpIwc Metrics"
        },
        {
            "displayName": "metrics.types",
            "name": "metrics.types",
            "description": "Types of metrics available."
        },
        {
            "displayName": "ozpIwc",
            "name": "ozpIwc",
            "description": "The base class for APIs. Use {{#crossLink \"ozpIwc.createApi\"}}{{/crossLink}} to subclass\nthis.\n\nLeader State Management\n=======================\nThe base API uses locks.api to always have a single leader at a time.  An api instance goes\nthrough a linear series of states:  member -> loading -> leader\n* __member__ does not service requests\n* __loading__ is a transitory state between acquiring the leader lock and being ready to serve requests\n* __leader__ actively serves requests and broadcasts a death scream upon shutdown\n\nThe member state has two substates-- ready and dormant\n * __ready__ queues requests in case it has to become leader.  switches back to dormant on discovering a leader\n * __dormant__ silently drops requests.  Upon hearing a deathScream, it switches to ready."
        }
    ]
} };
});