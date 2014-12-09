/* ... */

var initCart = function(){
    return dataApi.set('/shoppingCart',{entity:shoppingCart});
};

var getCart = function(){
    return dataApi.get('/shoppingCart');
};

var getItem = function(key){
    return dataApi.get(key);
};


var addItem = function(){
    var item = {
        'quantity':1,
        'price':10,
        'color': 'red',
        'size': 'M'
    };
    return dataApi.addChild('/shoppingCart',{entity:item});
};


var updateCart = function(item,add){
    shoppingCart.total = (add)?
        shoppingCart.total + item.price :
        shoppingCart.total - item.price;

    return dataApi.set('/shoppingCart',{entity:shoppingCart})
        .then(getCart)
        .then(function(res){
            shoppingCart = res.entity;
            console.log("Total:", res.entity.total);
        });
};

/* ... */