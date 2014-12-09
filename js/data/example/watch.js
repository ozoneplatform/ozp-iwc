/* ... */

var watchCart = function(){
    var onChanged = function(reply,done){
        var addedChildren = reply.entity.addedChildren || [];
        var removedChildren  = reply.entity.removedChildren || [];

        addedChildren.forEach(function(item){
            getItem(item).then(function(res){
                updateCart(res.entity,true);
            })
        });

        removedChildren.forEach(function(item){
            getItem(item).then(function(res){
                updateCart(res.entity,false);
            })
        });
    };
    return dataApi.watch('/shoppingCart',onChanged);
};


/* ... */