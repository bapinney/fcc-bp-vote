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
        })
        //For a refresher on URL params, see: https://github.com/angular-ui/ui-router/wiki/URL-Routing
    
        .state('poll', {
            url: '/poll/:id',
            templateUrl: function($stateParams) { //We use this to get the poll ID from the Object in the ui-sref attribute for that poll, and then navigate to the URL with that ID
                return '/poll/' + $stateParams.id;
            }
        });

});
