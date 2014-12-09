var dataApi = client.data();

var foo = {persist:true};

dataApi.delete('/foo',{ entity:foo }).then(function(res){
    if(res.response === 'ok'){
        doSomethingElse();
    }
});