//Remember this is the CLIENT-SIDE JS
var app = angular.module("fcc-bp-vote", ['ui.router']);

app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home'); //Where we go if there is no route

    // templateProvider: Provider function that returns HTML content string. See http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$stateProvider
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'home'
        })
        .state('new', {
            url: '/new',
            templateUrl: 'new' //Resolves to newpoll.pug in routes.js
        })
        .state('mypolls', {
            url: '/mypolls',
            templateUrl: 'mypolls',
            controller: function($scope) {
                $scope.foo = "bar";
            }
        })
        .state('poll.pollid', {
            url: '/poll/{pollid}',
            templateUrl: 'poll',
            controller: function($scope) {
                console.log("state params!!1one");
            }
        });

});
