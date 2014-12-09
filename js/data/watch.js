var dataApi = client.data();

var onChange = function(reply,done){
    var newVal = reply.entity.newValue;
    var oldVal = reply.entity.oldValue;

    var doneCondition = {
        'foo': 1
    };
    if(newVal === doneCondition){
        done();
    }

};

dataApi.watch('/foo',onChange).then(function(res){
    if(res.response === 'ok'){
        doSomethingElse();
    }
});