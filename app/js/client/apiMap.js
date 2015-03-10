ozpIwc = ozpIwc || {};

ozpIwc.apiMap = {
    "data.api" : { 'address': 'data.api',
        'actions': ["get","set","delete","watch","unwatch","list","addChild","removeChild"]
    },
    "intents.api" : { 'address': 'intents.api',
        'actions': ["get","set","delete","watch","unwatch","list","register","invoke","broadcast"]
    },
    "names.api" : { 'address': 'names.api',
        'actions': ["get","set","delete","watch","unwatch","list"]
    },
    "system.api" : { 'address': 'system.api',
        'actions': ["get","set","delete","watch","unwatch","list","launch"]
    }
};