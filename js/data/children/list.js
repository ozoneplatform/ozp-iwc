var dataApi = client.data();

var cartItems = [];

dataApi.list('/shoppingCart').then(function(res){
    if(res.response === 'ok'){
        cartItems = res.entity;

        doSomethingElse();
    }
});
