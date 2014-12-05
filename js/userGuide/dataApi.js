
var client = new ozpIwc.Client({
    peerUrl: "http://ozone-development.github.io/iwc"
});

client.connect().then(function(){
    var dataApi = client.data();
});