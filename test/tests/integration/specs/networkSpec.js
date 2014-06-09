/**
 * Network Integration
 */

/** Issue #31 [1]
 * All tests exercise at least two origins-- test and IWC bus. A mock or stub origin
 * may be necessary in some situations for coordination between participants.
 *
 * Does this mean a peer window? or operating on logic using the client class && IWC bus?
  *
 */
var peerWin = window.open("additionalOrigin.html", "widget", "height=5,width=5");

/** Issue #31 [3]
 * Allow for testing of the LeadershipParticipant where widgets are being opened and closed.
 *
 * Try adding spies to the window and check the status of LeadershipParticipant.
 *
 */
window.addEventListener("beforeunload", function () {
    peerWin.close();
});

/** Issue #31 [2]
 * Allow for testing of all APIs in a multi-application environment.
 *
 * Test using client && peer window all api functionality?
 * Figure out if there is a way to test the peer window widget with minimal intrusion
 *
 */
describe("API Integration", function () {
    var client;
    beforeEach(function (done) {
        // current version of jasmine breaks if done() is called multiple times
        // use the called flag to prevent this
        var called = false;

        client = new ozpIwc.Client({peerUrl: "http://localhost:13000"});
        client.on("connected", function () {
            if (!called) {
                done();
                called = true;
            }
        });
    });

    afterEach(function () {
        if (client) {
            client.disconnect();
            client = null;
        }
    });

    describe('data.api', function () {

        it('watches resources published by the client.', function (done) {
            var called = false;

            var watchPacket = {
                dst: "keyValue.api",
                action: "watch",
                resource: "/test"
            };

            var watchCallback = function (reply) {
                if (!called) {
                    console.log(reply);
                    done();
                    expect(reply.entity).toEqual("testData");
                    called = true;

                    client.send({
                        dst: "keyValue.api",
                        action: "unwatch",
                        resource: "/test"
                    });
                }
            };
            client.send(watchPacket, watchCallback);

            client.send({
                dst: "keyValue.api",
                action: "set",
                resource: "/test",
                entity: "testData"
            });
        });

        it('watches resources published by other origins', function(){});
    });
});