var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET;
var connect = require('connect'); //Used for cookie sessions
var cookieSession = require('cookie-session');
var uuid = require('uuid');
var session = require('express-session');
var os = require('os');
var mongoose = require('mongoose');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

if (!(process.env.TWITTER_CONSUMER_KEY)) {
    console.log("No envvar set for Twitter.  Loading config.js");
    require('./config.js');
}
if (process.env.TWITTER_CONSUMER_KEY) { //We use twitter for auth, so if this is not set, the program should exit
    TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
    TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
    CALLBACK_URL = process.env.CALLBACK_URL;
    
    app.use(cookieSession({
        name: 'fccbpvoteSession',
        secret: 'club sandwich, no tomatoes',
        cookie: {secure: false}
    }));
    
    passport.use(new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: CALLBACK_URL
    },
    function(token, tokenSecret, profile, done) {
        console.log("About to console.log");
        console.dir(profile.username);
        
    }));
    
    app.use(session({
        genid: function(req) {
            return uuid.v4();
        },
        resave: false,
        saveUninitialized: false,
        secret: 'tacos'})
    );
    
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback*', 
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/' 
        })
    );
    
    app.use(express.static('public'));
    app.use(passport.initialize());
    app.use(passport.session());
    app.listen(port, function() {
        console.log("Listening on port " + port);
    })
}
else {
    console.log("Exiting...");
}

var findOrCreate = function(userObj) {
    console.log("Find or create called");
}
