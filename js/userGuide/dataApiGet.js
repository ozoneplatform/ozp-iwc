var dataApi = client.data();

var foo;

dataApi.get('/foo').then(function(res){
    foo = res.entity;
});