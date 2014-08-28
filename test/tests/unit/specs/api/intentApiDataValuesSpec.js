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
    
    it("sets the contentType to application/ozpIwc-intents-contentType-v1+json",function() {
        expect(node.contentType).toEqual("application/ozpIwc-intents-contentType-v1+json");
    });
    
    it("marks new actions as requiring an update",function() {
        expect(node.isUpdateNeeded(viewNode)).toBe(true);
    });

    it("ignores handlers on update",function() {
        expect(node.isUpdateNeeded(handlerNode)).toBe(true);
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