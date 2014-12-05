
var client = new ozpIwc.Client({
    peerUrl: "http://ozone-development.github.io/iwc"
});

client.connect().then(function(){
    var dataApi = client.data();

    var foo;

    dataApi.get('/foo').then(function(res){
        foo = res.entity;
    });
});