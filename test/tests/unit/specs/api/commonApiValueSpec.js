function commonApiValueContractTests(ClassUnderTest,baseConfig) {
    baseConfig=baseConfig || {};
    var value;
    var config;

    beforeEach(function() {
        config = ozpIwc.util.clone(baseConfig);
        config.resource= "testResource";
        config.entity= {'foo': 1};
        config.contentType= "test/testType+json";
        config.permissions={'perms': 'yes'};
        config.version= 1;
        
        value = new ClassUnderTest(config);
    });

    it("defaults to an empty value", function() {
        value = new ClassUnderTest(baseConfig);
        expect(value.resource).toBeUndefined();
        expect(value.entity).toBeUndefined();
        expect(value.contentType).toBeUndefined();
        expect(value.permissions).toEqual(new ozpIwc.policyAuth.SecurityAttribute());
        expect(value.version).toEqual(0);
    });

    it("initializes from config", function() {
        expect(value.resource).toEqual(config.resource);
        expect(value.entity).toEqual(config.entity);
        expect(value.contentType).toEqual(config.contentType);
        expect(value.permissions.attributes.perms).toEqual({attributeValue: ['yes']});
        expect(value.version).toEqual(1);
    });

    it("updates on set", function() {
        value.set({
            'entity': {'bar': 2},
            'contentType': "test/testType+json",
            'permissions': {'perms':"maybe"}
        });
        expect(value.resource).toEqual("testResource");
        expect(value.entity).toEqual({'bar': 2});
        expect(value.contentType).toEqual("test/testType+json");
        expect(value.permissions.attributes.perms.attributeValue.length).toEqual(1);
        expect(value.permissions.attributes.perms.attributeValue[0]).toEqual("maybe");
        expect(value.version).toEqual(2);
    });


    it("leaves the permissions unchanged if they aren't on the packet", function() {
        value.set({
            'entity': {'bar': 2},
            'contentType': "test/testType+json"
        });
        expect(value.resource).toEqual("testResource");
        expect(value.entity).toEqual({'bar': 2});
        expect(value.contentType).toEqual("test/testType+json");
        expect(value.permissions.attributes.perms.attributeValue.length).toEqual(1);
        expect(value.permissions.attributes.perms.attributeValue[0]).toEqual("yes");
        expect(value.permissions.attributes['ozp:iwc:node'].attributeValue.length).toEqual(1);
        expect(value.permissions.attributes['ozp:iwc:node'].attributeValue[0]).toEqual("testResource");
        expect(value.version).toEqual(2);
    });


    it("resets when calling deleteData", function() {
        value.deleteData();
        expect(value.resource).toEqual("testResource");
        expect(value.entity).toBeUndefined();
        expect(value.contentType).toBeUndefined();
        expect(value.permissions).toEqual([]);
        expect(value.version).toEqual(0);
    });

    it("converts to a packet", function() {
        var p = value.toPacket();
        expect(p.resource).toEqual(config.resource);
        expect(p.entity).toEqual(config.entity);
        expect(p.contentType).toEqual(config.contentType);
        expect(Object.keys(p.permissions.attributes)).toEqual(["ozp:iwc:node","perms"]);
        expect(p.permissions.attributes.perms.attributeValue.length).toEqual(1);
        expect(p.permissions.attributes.perms.attributeValue[0]).toEqual("yes");
        expect(p.eTag).toEqual(1);
    });

    it("copies so that the packet doesn't change when the value does", function() {
        var p = value.toPacket();
        value.set({
            'entity': {'bar': 2},
            'contentType': "test/testType+json",
            'permissions': {'perms': ['morePerms']}
        });
        expect(p.resource).toEqual(config.resource);
        expect(p.entity).toEqual(config.entity);
        expect(Object.keys(p.permissions.attributes)).toEqual(["ozp:iwc:node","perms"]);
        expect(p.permissions.attributes.perms.attributeValue.length).toEqual(1);
        expect(p.permissions.attributes.perms.attributeValue[0]).toEqual("yes");
        expect(p.eTag).toEqual(1);
    });

    it("shows no changes if it is not changed",function() {
        var snapshot=value.snapshot();
        var changes=value.changesSince(snapshot);
        
        expect(changes).toEqual(null);
    });

    it("shows changes from a single set",function() {
        var snapshot=value.snapshot();
        value.set({
            'entity': {'bar': 2},
            'contentType': "test/testType+json",
            'permissions': ['morePerms']
        });
        var changes=value.changesSince(snapshot);
        
        expect(changes.newValue).toEqual({'bar': 2});
        expect(changes.oldValue).toEqual(config.entity);

    });

    it("shows changes from a multiple sets",function() {
        var snapshot=value.snapshot();
        value.set({
            'entity': {'bar': 3},
            'contentType': "test/testType+json",
            'permissions': ['morePerms']
        });        
        value.set({
            'entity': {'bar': 2},
            'contentType': "test/testType+json",
            'permissions': ['morePerms']
        });
        value.set({
            'entity': {'bar': 2},
            'contentType': "test/testType+json",
            'permissions': ['morePerms']
        });
        
        var changes=value.changesSince(snapshot);
        expect(changes.newValue).toEqual({'bar': 2});
        expect(changes.oldValue).toEqual(config.entity);
    });


    describe("watcher tests", function() {
        beforeEach(function() {
            for (var i = 0; i < 5; ++i) {
                value.watch({
                    'src': "src" + i,
                    'msgId': i
                });
            }
        });

        it("iterates over the watchers", function() {
            var rv = value.eachWatcher(function(w) {
                return w;
            });
            rv.sort(function(l, r) {
                return l.msgId - r.msgId;
            });
            expect(rv.length).toEqual(5);
            expect(rv).toEqual([
                {src: 'src0', msgId: 0},
                {src: 'src1', msgId: 1},
                {src: 'src2', msgId: 2},
                {src: 'src3', msgId: 3},
                {src: 'src4', msgId: 4}
            ]);
        });

        it("unregisters a watcher", function() {
            value.unwatch({
                src: 'src2',
                replyTo: 2
            });
            var rv = value.eachWatcher(function(w) {
                expect(w.msgId).not.toEqual(2);
                return w;
            });
            rv.sort(function(l, r) {
                return l.msgId - r.msgId;
            });
            expect(rv.length).toEqual(4);
        });
    });
}
describe("Common API Value", function() {
    commonApiValueContractTests(ozpIwc.CommonApiValue);
});