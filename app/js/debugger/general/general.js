/* global debuggerModule */
debuggerModule.controller('GeneralCtrl', ['$scope', '$state', 'iwcClient', function (scope, state, client) {
    scope.ozpIwc = ozpIwc;

    scope.endpointClicked = function (endpoint) {
        state.go('hal-browser', {url: endpoint});
    };
    scope.endpointTabulated = [];
    scope.config = {};

    client.connect().then(function () {
        client.getConfig().then(function(config){
            scope.config = config;
        });
        client.getApiEndpoints().then(function (apis) {
            apis.forEach(function (resp) {
                scope.$apply(function () {
                    scope.endpointTabulated.push(resp);
                });
            });
            return client.api('system.api').get('/user');
        }).then(function (data) {
            scope.$apply(function () {
                scope.systemUser = data.entity;
            });
            return client.api('system.api').get('/system');
        }).then(function (data) {
            scope.$apply(function () {
                scope.systemBuild = data.entity;
            });
        });
    });
}]);

debuggerModule.directive("general", [function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/general.tpl.html'
    };
}]);
debuggerModule.directive("genEndpoints", [function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/genEndpoints.tpl.html'
    };
}]);
debuggerModule.directive("genBuild", [function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/genBuild.tpl.html'
    };
}]);
debuggerModule.directive("genUser", [function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/genUser.tpl.html'
    };
}]);
debuggerModule.directive("genAbout", [function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/genAbout.tpl.html'
    };
}]);