var dataApi = client.data();

var dataResources = [];

dataApi.list().then(function(res){
    if(res.response === 'ok'){
        dataResources = res.entity;

        doSomethingElse();
    }
});