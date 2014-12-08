var dataApi = client.data();

var foo = { 'bar': 'buz' };



dataApi.set('/foo',{ entity: foo});



dataApi.get('/foo').then(function(res){
    //res has /foo's value
});



dataApi.watch('/foo',function(response,done){
    //when I'm done watching I call done
    done();
});