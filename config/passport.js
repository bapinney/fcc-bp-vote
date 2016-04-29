var User = require('../fapp/models/user.js'); //Pick up here

module.exports = function(passport) {
    
    //Session stuff
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    
    //Twitter
    passport.use(new TwitterStrategy({
            TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
            TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
            CALLBACK_URL = process.env.CALLBACK_URL; 
        },
        function(req, token, tokenSecret, profile, done) {
            
        }
    ));
    
}