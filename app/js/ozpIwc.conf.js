var ozpIwc = ozpIwc || {};

ozpIwc.config = {
    logLevel: 6,
    backendSupport: true,
    //apiRootUrl: "/iwc-api",
    apiRootUrl: "/marketplace/api",
    templates:{
        'ozp:data-item': {
            endpoint: "ozp:user-data",
            pattern: "/{+resource}",
            type:"application/vnd.ozp-iwc-data-object-v1+json"
        },
        'ozp:application-item': {
            href: "/marketplace/api/listing/{+resource}",
            type: "application/vnd.ozp-application-v1+json"
        }
    },
    ajaxPoolSize: 3
};