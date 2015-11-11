describe("Data Node", function () {
    var dataNode;
    var NodeType = ozpIwc.api.data.node.Node;
    beforeEach(function () {
        dataNode = new NodeType({
            resource: "/foo",
            version: 50,
            self: {href: "https://example.com/iwc/foo"},
            contentType: "text/plain",
            entity: "hello world"
        });
    });
    it("fails if constructed without a resource", function () {
        expect(function () {
            new NodeType();
        }).toThrow();
    });
    it("deserializes and serializes live data with the same outcome", function () {
        var serialized = dataNode.serializeLive();
        var node2 = new NodeType({resource: "/foo"});
        node2.deserializeLive(serialized);
        expect(node2).toEqual(dataNode);
    });

    it("a set with etag properly updates the version", function () {
        dataNode.set({
            entity: "goodbye world",
            eTag: 100
        });
        expect(dataNode.entity).toEqual("goodbye world");
        expect(dataNode.version).toEqual(100);
    });

    it("deserializes and serializes persisted data with the same outcome", function () {
        var node2 = new NodeType({resource: "/foo"});
        // server format
        var serialized = JSON.stringify({entity: dataNode.serialize()});
        node2.deserialize(serialized, NodeType.serializedContentType);
        expect(node2).toEqual(dataNode);
    });

    it("deserializes and serializes persisted data with the same outcome using the constructor", function () {
        // server format
        var serialized = JSON.stringify({entity: dataNode.serialize()});
        var node2 = new NodeType({
            serializedEntity: serialized,
            serializedContentType: NodeType.serializedContentType
        });
        expect(node2).toEqual(dataNode);
    });

    it("deserializes and serializes persisted data with the same outcome using the constructor without content type", function () {
        // server format
        var serialized = JSON.stringify({entity: dataNode.serialize()});
        var node2 = new NodeType({
            serializedEntity: serialized
        });
        expect(node2).toEqual(dataNode);
    });

});