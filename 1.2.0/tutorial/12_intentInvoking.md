---
layout: tutorial
title: Invoking an Intent (Shared Function)
category: intermediate
tag: 1.2.0
---

# Invoking an Intent on the Intents Api
The previous tutorial covered registering functions as intent handlers, this tutorial will cover the other half of
the Intents Api, calling the intent functions.

***
## Invoking any handler
When invoking an intent on the IWC, the default behavior is to invoke an **intent action** and allow the IWC to process
 which registered handler to use. The choosing falls into 3 cases:

 1. There is only one handler matching that action: simply, the only handler is chosen.
 2. There are multiple handlers and the user has no stored preference: A pop-up window opens to prompt the user which
 application to use to handle the invocation. The user has the option there to store their preference (for as long
 as that handling application is open) to have it always handle the request. This has not been implemented yet as of
 version 1.1.14 and is a planned feature.
 3. There are multiple handlers and the user has stored preference: The preferred handler is sent the invocation.


**To invoke an action and let the IWC handle where it is run:** call the intent's `invoke` action with the
`/{Type}/{Sub-type}/{Action}` path. The invoke function signature has **3 parameters**:

####Parameters

| parameter | type   | description                                                                                                                                                            |
|-----------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| resource  | String | A string path-name used as a key for the value. As explained in the [Intents Explained](10_intentInit.html) tutorial, intent registrations use a `/{Type}/{Sub-type/{Action}/{Handler}` format. If the `/{Handler}` portion is not provided the IWC will auto-generate a handler Id.                                |
| options   | Object | An object of options for the action. More options are covered in later tutorials, for now we will focus on the`config.entity` option, which is **the payload of the invocation**. |
| callback  | Function| A callback that is called whenever the state of the intent invocation changes.

###Returns
A promise that resolves with a response object upon the remote function handling of the request. It matches the format
of the other IWC action promise resolutions, the properties noted below are siginificant changes with the values of
the properties in an invoke action resolution.

| property | type   | description                                                                                 |
|----------|--------|---------------------------------------------------------------------------------------------|
| src      | String | The address of of the response sender. "intents.api" is the source as the response message is received and formatted there. |
| response | String | The status of the message. **"complete"** means the request was successfully handled.                 |
| entity   | Object | The value returned by the intent handler function.                                            |


####Callback
The callback of the invoke action is for applications that wish to receive status updates pertaining to the handling
of an invocation. If the desire is to simply have someone handle some data and optionally return a response, simply
utilizing the promise response should suffice.


The callback receives 2 parameters:
 1. `reply`: contains various information about an intent. For the introductory purposes of intent registrations, only
 `reply.entity` is covered here, other properties will be covered for more advanced intents in a later tutorial.
 2. `done`: A function to call to stop handling intent requests. Useful for conditionally stopping intent handling.

| property | type   | description                                |
|----------|--------|--------------------------------------------|
| entity   | Object | Data pertaining to the state of the intent.|
| entity.handler| Object| Data pertaining to the IWC client handling the request.|
| entity.handler.address| String| The address of the handling IWC client.|
| entity.handler.reason| String| The reason for this handler being used("onlyOne", "userSelected", or "remembered"|
| entity.handler.resource| String| The resource path of the handler function.|
| entity.request| * | The data passed to the IWC in the invoke request.|
| entity.response | * | The data returned from the handler when finished computing (only available if state is "complete").|
| entity.state | String | The state of the intent handling explained in table below.|
| entity.status | String | Will be "ok" if this callback is reachable (internal use).|

####Intent states
The following are the states that will trigger the invoke callback.

| State   | description                                |
|---------|--------------------------------------------|
| init    | The request was acknowledged by the IWC.   |
| choosing| If multiple handlers are available and the user needs to pick, it will sit in the choosing state until the user has selected from the intent chooser.   |
| delivering| The IWC is delivering the intent invocation to the client that will handle it. |
| running | The handling client has received the invocation and is currently processing it. |
| complete| The handling client has finished processing the request and has returned the result. |


**Note:** this code example wil receive a "noResource" response if the [intent handler](http://s.codepen.io/Kevin-K/debug/xZbdLv) isn't open. Simply open it in another
tab prior to invoking.
<p data-height="500" data-theme-id="0" data-slug-hash="YwXXdW" data-default-tab="js" data-user="Kevin-K" class='codepen'>

##Invoking a specific handler
If a specific IWC client is desired to handle an invoke action, simply invoke the client's registered resource:
`/{Type}/{Sub-type}/{Action}/{HandlerId}` (as apposed to the general action resource: `/{Type}/{Sub-type}/{Action}`).
If a handler doesn't register with its own unique handler ID (covered in the [registering tutorial](11_intentRegister.html)),
the `{HandlerId}` will be runtime generated and can not be statically referenced.

***

##Broadcast: Invoking all handlers
The `broadcast` follows the same signature & functionality as `invoke` with one key difference. It **invokes on all
handlers matching the supplied action**.

There are three differences between broadcasting and invoking:

1. Broadcast receives callback messages for state changes of every handler rather than an individual.
2. Broadcast promises resolve **when all handlers finish handling**.
3. The entity of the promise resolution holds a map of handler resource names with their respective results. If a handler
failed, its result is undefined.

<p data-height="500" data-theme-id="0" data-slug-hash="qbdQbO" data-default-tab="js" data-user="Kevin-K" class='codepen'>
