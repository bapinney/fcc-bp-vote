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
        .state('text', {
            url: '/test',
            templateUrl: 'test'
        })
        .state('mypolls', {
            url: '/mypolls',
            templateProvider: 'mypolls'
        })
        .state('poll', {
            url: '/poll',
            templateUrl: 'poll'
        });
});
