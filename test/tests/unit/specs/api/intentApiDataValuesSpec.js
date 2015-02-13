describe("Intents Content Type Value",function() {
    var node;
    var viewNode=new ozpIwc.CommonApiValue({resource:"/text/plain/view"});
    var editNode=new ozpIwc.CommonApiValue({resource:"/text/plain/edit"});
    var handlerNode=new ozpIwc.CommonApiValue({resource:"/text/plain/view/1234"});
    
    beforeEach(function() {
        node=new ozpIwc.IntentsApiTypeValue({
                resource: "/text/plain",
                intentType: "text/plain"
        });
    });
    
    it("sets the contentType to application/vnd.ozp-iwc-intent-type-v1+json",function() {
        expect(node.contentType).toEqual("application/vnd.ozp-iwc-intent-type-v1+json");
    });
    
    it("marks new actions as requiring an update",function() {
        expect(node.isUpdateNeeded(viewNode)).toBe(true);
    });

    it("ignores handlers on update",function() {
        expect(node.isUpdateNeeded(handlerNode)).toBe(false);
    });
    
    it("updates actions when changed",function() {
        node.updateContent([viewNode,editNode]);
        expect(node.entity.actions).toEqual(["/text/plain/view","/text/plain/edit"]);
    });
    
});


describe("Intents Definition Value",function() {
    
});

describe("Intents Handler Value",function() {
    
});

describe("Intents in Flight Value",function() {
   var node;

    var viewNode=new ozpIwc.IntentsApiDefinitionValue({
        resource:"/text/plain/view",
        intentType: "text/plain",
        intentAction: "view"
    });
//    var handlerNode=new ozpIwc.CommonApiValue({resource:"/text/plain/view/1234"});
    var packet =  {
            src: "src0",
            msgId: "p:0",
            entity: "Some test value"
    };
    beforeEach(function(){
        node = new ozpIwc.IntentsApiInFlightIntent({
            resource: '/ozpIntents/invocations/abcd',
            invokePacket:packet,
            contentType: viewNode.contentType,
            type: viewNode.entity.type,
            action: viewNode.entity.action,
            entity: packet.entity,
            handlerChoices: viewNode.getHandlers()
        });

    });

    it("expects initial state to be new",function(){
        console.log(node,viewNode);
        expect(node.entity.state).toEqual("new");
    });

    it("expects initial handler to be null",function(){
        expect(node.entity.handler.address).toEqual(null);
        expect(node.entity.handler.resource).toEqual(null);
    });

    it("expects initial handlerChosen to be null",function(){
        expect(node.entity.handlerChosen.reason).toEqual(null);
        expect(node.entity.handlerChosen.resource).toEqual(null);
    });

    it("expects intent action and type to match the corresponding definition",function(){
        expect(node.entity.intent.action).toEqual(viewNode.entity.action);
        expect(node.entity.intent.type).toEqual(viewNode.entity.type);
    });

    it("holds reference of the invoking packet for the invocation entity and reply address",function(){
        expect(node.invokePacket.entity).toEqual(packet.entity);
        expect(node.invokePacket.msgId).toEqual(packet.msgId);
        expect(node.invokePacket.src).toEqual(packet.src);
    });
});