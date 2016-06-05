var app = angular.module("fcc-bp-vote", ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');  //Where we go if there is no route
    
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'home'
        });
    
});