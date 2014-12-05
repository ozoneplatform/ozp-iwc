angular.module('app',[]);
angular.module('app').controller('mainController', function($scope) {
    $scope.scripts = [
        'js/userGuide/connectCallback.js',
        'js/userGuide/connectPromise.js',
        'js/userGuide/disconnect.js',
        'js/userGuide/dataApi.js',
        'js/userGuide/dataApiSet.js',
        'js/userGuide/dataApiGet.js'
    ];

}).directive('sourceCode', function(){
    return {
        restrict: 'A',
        scope: {
            data: '='
        },
        templateUrl: "templates/codeBlock.html",
        controller: function($scope,$http){
            console.log($scope.data);
            $http.get($scope.data).success(function(data){
                console.log(data);
                $scope.script = data;
            });
        }
    }
}).directive('codeDocRow',function(){
    return {
        restrict: 'A',
        scope: {
            url: '='
        },
        templateUrl: "templates/codeDocRow.html",
        transclude: true,
        controller: function($scope){
            $scope.data = $scope.url;
        }
    }
});