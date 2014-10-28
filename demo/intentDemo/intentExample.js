
var client=new ozpIwc.Client({peerUrl:"http://" + window.location.hostname + ":13000"});
var currentColor="black";
var colorRegistered = null;
var currentHandler = null;

$(document).ready(function(){
    client.connect().then(function(){
        console.log("The IWC Client is now connected with an address of (", client.address, ")");
        $('#myAddress').text(client.address);

        var colors=$("#intentColor option");
        var params=ozpIwc.util.parseQueryParams();
        currentColor=params['color'] || colors[Math.floor(Math.random() * colors.length)].value;
        $("#intentColor").val(currentColor);

        // Set the color this widget will print out text on.
        changeColor(currentColor);

        $("#intentColor").change(function(e) {
            var color=e.target.value;
            changeColor(color);
        });
    });

    window.addEventListener("beforeunload",function() {
       if(currentHandler){
           client.api("intents.api").delete(currentHandler);
       }
    });
});

/**
 * When a user changes the selected color, current intent registration (/text/plain/view) should be unregistered
 * and registration should be set with the updated color (handles same resource /text/plain/view)
 *
 * @method changeColor
 * @param {String} color The color value to be set for the widget to draw as its background and use in the handler label
 */
function changeColor(color) {
    // Change the actual drawn color
    $('#intentText').css("background",color);

    if(currentHandler){
        client.api("intents.api").delete(currentHandler).then(function(response){
            console.log("I respond when deleting a handler", response);
        });
    }

    // Register an intent handler for the color
    client.api('intents.api').register('/text/plain/view', {
        contentType: "application/ozpIwc-intents-handler-v1+json",
        entity: {
            icon: "https://ozp.slack.com/emoji/explosions/b88611dd6cbbbacb.gif",
            label: client.address + "/" + color
        }
    },function(foo,done){
        console.log("I get called when an intent is invoked on /text/plain/view!", foo);
        $("#intentText").append("Color: " + color + " Value: " + JSON.stringify(foo.entity) + "<br>");

        // if you want to stop the persistence of a callback, call done()
        // return the value you want to pass back to the invoker
        return {
            text: foo.entity,
            color: color
        };

    }).then(function(response) {
        console.log("I get called once after this intent sends off its registration!", response);
        colorRegistered = color;
        currentHandler = response.entity.resource;

    }).catch(function (error) {
        console.log("Error registering handler: ",error);
    });
}


/**
 * Invokes an intent of the specified resource. The client sends the invocation to the intents.api to be processed
 * and launch an intent picker if there is more than 1 handler registered.
 *
 * @method invoke
 * @param {String} resource The handler resource desired to be invoked (ex. /text/plain/view)
 * @param {Object} entity The data to be passed to the intent handler.
 */
function invoke(resource,entity) {
    client.api('intents.api').invoke(resource, {
        contentType: "application/ozpIwc-intents-handler-v1+json",
        entity: entity
    }).then(function(response){
       console.log("I get called when a resolution has been made on the intent invocation!",response);
    }).catch(function(e){
        console.error("Error invoking intent:",e);
    });
}
