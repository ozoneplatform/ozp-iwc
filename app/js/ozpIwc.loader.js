if (window.SharedWorker) {
    var worker = new SharedWorker('js/ozpIwc-bus.js');

    // Receive messages from the client and forward to the IWC Bus (shared worker)
    window.addEventListener('message', function (evt) {
        worker.port.postMessage(evt.data);
    });

    // When the client is closing, notify the shared worker so the IWC bus can clean up references
    window.addEventListener('beforeunload', function (evt) {
        worker.port.postMessage({windowEvent: evt.type});
    });

    // Receive messages from the the IWC Bus (shared worker) and forward to the client
    worker.port.addEventListener('message', function (evt) {
        window.parent.postMessage(evt.data, "*");
    });

    // Get the query params to see what type of client this is
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    var params = {};
    for (var i in vars) {
        var pair = vars[i].split("=");
        params[pair[0]] = pair[1];
    }
    params.type = params.type || "default";

    worker.port.postMessage(params);
    worker.port.start();
} else {
    //Fallback on loading individual bus instances
    (function () {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'js/ozpIwc-bus.js';
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
    })();
}