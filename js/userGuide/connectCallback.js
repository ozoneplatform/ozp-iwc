
var client = new ozpIwc.Client({
    peerUrl: "http://ozone-development.github.io/iwc"
});

client.connect();

client.on("connected",function() {
   /* client use goes here */
});