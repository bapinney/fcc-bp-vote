var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET;
var chalk = require('chalk'); //Colors for terminal logging/monitoring
var session = require('express-session'); //Keep and use with passport.session()
var morgan = require('morgan'); //Logging -- Remove when done
var uuid = require('uuid');
var mongodb = require('mongodb'); //REMOVE?
var MongoClient = require('mongodb').MongoClient;
var findOrCreate = require('mongoose-findorcreate'); //Adds a findOrCreate for Mongoose models -- https://www.npmjs.com/package/mongoose-findorcreate
var mongoose = require('mongoose');
var pug = require('pug'); //Pug is the new Jade
global.rootDir = __dirname;
var passport = require('passport');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('./models/user.js'); //Mongoose 'User' model

app.use(morgan('dev')); //Log requests to console

var doInit = function () { //Initialization that begins once the app verifies we have correct credentials
    TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
    TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
    CALLBACK_URI = process.env.CALLBACK_URI;

    app.use(session({
        genid: function (req) {
            return uuid.v4(); // 'uuid' module
        },
        resave: true,
        saveUninitialized: true,
        secret: 'tacos'
    }));

    app.use(passport.initialize());
    app.use(passport.session()); //Passport piggybacks off the Express session (above)

    //Passport serialization and deserialization -- (move to another file, once working, and add lookup/insertion from Mongo)
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    })

    passport.use(new TwitterStrategy({
            consumerKey: TWITTER_CONSUMER_KEY,
            consumerSecret: TWITTER_CONSUMER_SECRET,
            callbackURL: CALLBACK_URI,
            passReqToCallback: true //Allows stuff like username to be in the req
        },
        function (req, token, tokenSecret, profile, callback) {
            /*  Properties we care about:
                id, token, name, screen_name, location, description
                All but ID are strings */

            process.nextTick(function () { //Asynchronous

                //Find or Create
                console.log(chalk.bgBlack.yellow("Searching for user ID ") + profile.id);
                User.findOne({
                        provider: "twitter",
                        id      : profile.id
                    },
                    function (err, user) {
                        console.log(chalk.bgBlack.yellow("User callback"));
                        if (err) {
                            console.log(chalk.bgBlack.red("Error: " + err));
                            callback(err);
                        }
                        if (user) { //We found the user
                            console.log(chalk.bgBlack.green("User found"));
                            return callback(null, user);
                        } else { //User does not exist
                            console.log(chalk.bgWhilte.black("User does not exist, yet"));
                            var newUser = new User({
                                provider    : "twitter",
                                id          : profile.id,
                                token       : token,
                                username    : profile.username
                                }
                            );
                            //Since newUser is a Mongoose schema from User, it has its own save method
                            console.log("About to save user: ");
                            newUser.save(function(err, newUser, numAffected) {
                                if (err) {
                                    console.log("Error when saving new user: ");
                                    console.error(err);
                                }
                                console.log("Num affected: " + numAffected);
                                return callback(null, newUser);
                            });
                        }
                    }
                ); 
            });

        }));

    //ROUTES
    app.use(express.static(__dirname + '/public'));
    var routes = require('./controllers/routes.js');
    app.use('/', routes);

    app.listen(port, function () {
        console.log("Listening on port " + port);
    })
};



if (!(process.env.TWITTER_CONSUMER_KEY)) {
    console.log("No envvar set for Twitter.  Loading config.js");
    require('./config/config.js');
}
if (process.env.TWITTER_CONSUMER_KEY) { //We use twitter for auth, so if this is not set, the program should exit
    if (!(process.env.MONGO_VOTE_URI)) {
        console.log(chalk.bgWhilte.red("Mongo URI not supplied.  Exiting..."));
    }
    else {
        console.log(chalk.bgBlue.white("Waiting to connect to MongoDB..."));
        mongoose.connect(process.env.MONGO_VOTE_URI);
        global.db = mongoose.connection;
        
        //http://codetunnel.io/javascript-partial-application-with-bind/
        global.db.on('error', function(error) {
            console.error("Mongoose connection error: ");
            console.dir(error);
            console.log("Exiting...");
        });
        
        global.db.once('open', function () {
            console.log(chalk.bgGreen.white("Connected to MongoDB.") + " Running init...");
            doInit(); //Initialize
        });
    }
} else {
    console.log(chalk.bgRed.white("No Twitter CKEY supplied.  Exiting..."));
}
