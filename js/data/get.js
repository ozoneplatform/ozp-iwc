var dataApi = client.data();

var foo;

dataApi.get('/foo').then(function(res){
    if(res.response === 'ok'){
        foo = res.entity;
    }
});