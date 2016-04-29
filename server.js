var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET;
var session = require('express-session'); //Keep
var morgan = require('morgan'); //Logging -- Remove when done
var uuid = require('uuid');
var findOrCreate = require('mongoose-findorcreate')
var mongoose = require('mongoose');
var passport = require('passport');
var TwitterStrategy  = require('passport-twitter').Strategy;
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    provider: String,
    id: String,
    username: String,
    displayName: String
});
var User = require('./app/models/user.js');

app.use(morgan('dev')); //Log requests to console

if (!(process.env.TWITTER_CONSUMER_KEY)) {
    console.log("No envvar set for Twitter.  Loading config.js");
    require('./config/config.js');
}
if (process.env.TWITTER_CONSUMER_KEY) { //We use twitter for auth, so if this is not set, the program should exit
    TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
    TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
    CALLBACK_URL = process.env.CALLBACK_URL;
    
    //Passport serialization and deserialization
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    })
    
    
    passport.use(new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: CALLBACK_URL,
        passReqToCallback: true
    },
    function(token, tokenSecret, profile, done) {
        //PICK UP HERE!
        console.log("About to console.dir profile");
        console.dir(profile);

        if (!req.user) {
            console.log("User is not logged in");
            //Not logged in.  Authenticate via Twitter...
        }
        else {
            //Logged in.,  Associate twitter account with user.
            //Preserve the login state by supplying the existing user after association.
            console.log("Logged in.  Associate account w/ Twitter.");
            return done(null, req.user);
        }
        
    }));
    
    app.use(session({
        genid: function(req) {
            return uuid.v4(); // 'uuid' module
        },
        resave: true,
        saveUninitialized: true,
        secret: 'tacos'
    }));

    app.use(passport.initialize());
    app.use(passport.session()); //Passport piggybacks off the Express session (above)
    
    app.use(express.static('public'));
    
    //ROUTES
    require('./app/routes.js')(app, passport);
    
    app.listen(port, function() {
        console.log("Listening on port " + port);
    })
}
else {
    console.log("Exiting...");
}

