describe("Names Api", function () {
    var client, namesApi;
    var BUS_URL = "http://" + window.location.hostname + ":14002";

    beforeAll(function (done) {
        client = new ozpIwc.Client({peerUrl: BUS_URL});
        client.connect().then(function () {
            namesApi = client.names();
            done();
        });
    });

    describe("general", function () {

        pit('Gets api information', function () {
            return namesApi.list('/api/').then(function (resp) {
                expect(resp.entity.indexOf('/api/data.api')).toBeGreaterThan(-1);
                expect(resp.entity.indexOf('/api/intents.api')).toBeGreaterThan(-1);
                expect(resp.entity.indexOf('/api/names.api')).toBeGreaterThan(-1);
                expect(resp.entity.indexOf('/api/system.api')).toBeGreaterThan(-1);
                expect(resp.entity.indexOf('/api/locks.api')).toBeGreaterThan(-1);
            });
        });

        pit('Api information returns actions of the api', function () {
            return namesApi.get('/api/names.api').then(function (resp) {
                expect(resp.entity.actions).toBeDefined();
            });
        });

        pit('Gets addresses of the names api', function () {
            return namesApi.get('/address').then(function (packet) {
                expect(packet.response).toEqual('ok');
            });
        });

        xit('Denied set access to names api addresses', function () {

        });

        xit('Denied delete access to names api addresses', function () {

        });
    });
});