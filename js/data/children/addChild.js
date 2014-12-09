var dataApi = client.data();

var cartEntry = {
    'price': 10,
    'size': 'M',
    'color': 'red',
    'quantity': 1
};

var cartEntryResource = "";

dataApi.addChild('/shoppingCart',{ entity: cartEntry})
    .then(function(res){
        if(res.response === 'ok'){
            cartEntryResource = res.entity.resource;

            doSomethingElse();
        }
    });