## Frequently Asked Questions

####What browser technologies does the IWC use to communicate?
The IWC has been designed to adapt to communication capabilities based on the users browser version. Currently 
the IWC operates using local storage as its lowest level transport (cross domain client to client communications), 
and window.postMessage to communicate between the client libraries and the bus.


####Why use the IWC over just window.postMessage?
PostMessage requires reference of the window which will receive the message, this limits communication to a
point-to-point topology. The IWC at it's lowest level is a bus topology. It uses bus topology underneath it's 
PostMessage point-to-point (client library to it's bus connection) to communicate across all bus connections using
localStorage. This adds a layer of abstraction for the IWC-using application such that it does not need to maintain 
knowledge of open IWC connections of different domains as the bus transport layer takes care of it.

####Why can't I use the system API to register an application?
Application registration for a bus is on an administrative level. Deployed Ozone platforms are intended to
maintain user based application registrations. The system API is read only.
    
####How do I know if another IWC application is registered to handle my application's intent invocation?
Individual application listings in the system API contain information about intents the application claims to be 
registered for. The IWC is aware of opened applications and will open a chooser window should more than 1 open
application be registered to handle said intent.
    
####Can the IWC open an application to handle an my application's intent invocation?
It is planned to direct the user to a choosing dialog for opening applications to handle an intent invocation. It
has not been implemented at this time.
    
####Can the IWC retain my choice when choosing an application to handle my applications's intent invocation?
It is planned to allow users to store their choices for intent decisions. This is in development but not
available at this time.
    
####Is there documentation on commonly used intents and the data they expect?
At the current stage of development there is not a definitive list of commonly used intents. As the platform continues
to grow this will be addressed and documented.

####In OWF7, I used publish subscribe between my applications. Why isn't that in the IWC?
Since the IWC framework is built around the concept of state rather than active events, there isn't a direct mapping of
the publish subscribe functionality. Rather there is the concept of set and watch, where set can act as the publish
functionality, and watch listens to changes of a resource. The difference between watch and subscribe is watch is state 
aware. A watch registered function will be called when the resource value is changed with both the new value and old
value of the resource. This gives developers the ability to do transitions in their applications without having to 
retain state of data themselves. For examples of transitioning from publish/subscribe to set/watch, refer to the 
[Migration Example](client/migration/pubsub_to_setwatch.md).