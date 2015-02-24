## Adding an IWC Client to your application 

An IWC client is an application's connection to an IWC bus. An IWC bus is always local to the user, but bound by the domain it is hosted from. For this example we will be using a predefined IWC bus hosted here on the ozp-iwc github page `http://ozone-development.github.io/iwc`.

Our example application for this guide is a simple journal application. This application, when connected to an IWC bus, can store/share/edit entries with other applications.

***

**HTML** 

Load in the IWC-client library first to expose it to our application JavaScript `app.js`. 
```
<html>
    <head>
        <script src="../bower_components/ozp-iwc/dist/js/ozpIwc-client.min.js"></script>
        <script src="js/app.js"></script>
    </head>
  ...
```

**Javascript** 
The IWC library is encapsulated in the `ozpIwc` namespace.