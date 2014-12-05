
var client = new ozpIwc.Client({
    peerUrl: "http://ozone-development.github.io/iwc"
});

client.connect().then(function(){
    var dataApi = client.data();

    var foo = {
        'bar': 'buz'
    };

    dataApi.set('/foo',{ entity: foo});
});