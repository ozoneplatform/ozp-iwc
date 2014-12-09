var dataApi = client.data();

var shoppingCart = { 'total': 0 };

shoppingCart.persist = true;

dataApi.set('/shoppingCart',{ entity: shoppingCart})
    .then(function(res){
        if(res.response === 'ok'){
            doSomethingElse();
        }
    });