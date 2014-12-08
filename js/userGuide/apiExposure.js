var apis = client.apiMap;

for(var api in apis) {
    console.log("Api: ", apis[api].address,
        "Actions: ", apis[api].actions,
        "Function: ", apis[api].functionName);
};