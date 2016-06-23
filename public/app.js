//Remember this is the CLIENT-SIDE JS
var app = angular.module("fcc-bp-vote", ['ui.router', 'ngAnimate']);

app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home'); //Where we go if there is no route

    // templateProvider: Provider function that returns HTML content string. See http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$stateProvider
    $stateProvider
        .state('home', {
            url: '/home',
            params: {reload: true}, 
            templateUrl: 'home'
        })
        .state('new', {
            url: '/new',
            templateUrl: 'new' //Resolves to newpoll.pug in routes.js
        })
        .state('mypolls', {
            url: '/mypolls',
            templateUrl: 'mypolls'
        })
        .state('logout', {
            url: '/logout',
            templateUrl: 'logout'
        })
    
    
        //For a refresher on URL params, see: https://github.com/angular-ui/ui-router/wiki/URL-Routing
    
        .state('poll', {
            url: '/poll/:id',
            params: {reload: true}, //In case anyone else voted since last time.
            templateUrl: function($stateParams) { //We use this to get the poll ID from the Object in the ui-sref attribute for that poll, and then navigate to the URL with that ID
                return '/poll/' + $stateParams.id;
            },
        });

});

app.run(function($rootScope, $urlRouter) {
    //Creates a listener for when Angular has changed states (or hard loaded a page anew).
    $rootScope.$on('$viewContentLoaded', function(event) {    
        if (typeof event.targetScope.$resolve !== "undefined" &&
        typeof event.targetScope.$resolve.$$state.self.name !== "undefined") {
            if (event.targetScope.$resolve.$$state.self.name == "poll") {
                console.log("Calling pollInit().  Document readyState is " + document.readyState);
                pollInit();
            }
            if (event.targetScope.$resolve.$$state.self.name == "home") {
                //TODO: Make call to DataTables to refresh data...
            }
        }
    });
});