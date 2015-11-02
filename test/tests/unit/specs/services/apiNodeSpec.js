describe("Base Node",function() {
	var apiNode;
    var NodeType = ozpIwc.api.base.Node;
    beforeEach(function() {
       apiNode=new NodeType({
            resource: "/foo",
            version: 50,        
            self: {href: "https://example.com/iwc/foo"},
            contentType: "text/plain",
            entity: {
							msg:"hello world",
							_links: {
								self: {href: "https://example.com/iwc/foo"},
								"ozp:iwcSelf": {href: "web+ozp://test.api/foo"}
							}
						}
       });
	});
    
    it("fails if constructed without a resource",function() {
        expect(function() {
            new NodeType();
        }).toThrow();
    });
    it("deserializes and serializes live data with the same outcome",function() {
        var serialized=apiNode.serializeLive();
        var node2=new NodeType({resource:"/foo"});
        node2.deserializeLive(serialized);
        expect(node2).toEqual(apiNode);     
    });
    
    it("a set with etag properly updates the version",function() {
        apiNode.set({
           entity: "goodbye world",
           eTag: 100
        });
        expect(apiNode.entity).toEqual("goodbye world");
        expect(apiNode.version).toEqual(100);
    });
    var serializedFields=["entity","resource","self"];
    it("deserializes and serializes persisted data with the same outcome",function() {
        var node2=new NodeType({resource:"/foo"});
        node2.deserialize(apiNode.serialize(),NodeType.serializedContentType);
        serializedFields.forEach(function(k) {
					expect(node2[k]).toEqual(apiNode[k]);
				});
				
    });
    
    it("deserializes and serializes persisted data with the same outcome using the constructor",function() {
        var node2=new NodeType({
            serializedEntity: apiNode.serialize(),
            serializedContentType:NodeType.serializedContentType
        });
        serializedFields.forEach(function(k) {
					expect(node2[k]).toEqual(apiNode[k]);
				});
    });
    
    it("deserializes and serializes persisted data with the same outcome using the constructor without content type",function() {
        var node2=new NodeType({
            serializedEntity: apiNode.serialize()
        });
        serializedFields.forEach(function(k) {
					expect(node2[k]).toEqual(apiNode[k]);
				});
    });
    it("sets up it's uri from a template",function(){
			// only defined if initEndpoints is called, so we define it here
			// rather than spyOn()
			ozpIwc.api.uriTemplate=function() {
				return {
                    name: "ozp:data-item",
                    href: "http://example.com/{+resource}",
                    type: NodeType.serializedContentType

                };
			};
			var node=new NodeType({
					resource: "/foo",
					version: 50,
					uriTemplate:"doesn't matter since it's mocked",
					contentType: "text/plain",
					entity: "hello world"
			});
			
			expect(node.self).toEqual({type: node.contentType});
            node.self = node.getSelfUri();
			expect(node.self.href).toEqual("http://example.com/foo");
            expect(node.self.type).toEqual(NodeType.serializedContentType);
		});
});