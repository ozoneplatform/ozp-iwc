var dataApi = client.data();

var removeEntry = {
    resource: "/shoppingCart/1234"
};

removeEntry.persist = true;

dataApi.removeChild('/shoppingCart',{ entity: removeEntry})
    .then(function(res){
        if(res.response === 'ok'){
            doSomethingElse();
        }
    });