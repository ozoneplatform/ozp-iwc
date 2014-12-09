var dataApi = client.data();

dataApi.delete('/foo').then(function(res){
    if(res.response === 'ok'){
        doSomethingElse();
    }
});