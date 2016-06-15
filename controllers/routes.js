var express = require('express');
var router = express.Router();
//var passport = require('./models/user');
var assert = require('assert');
var passport = require('passport');
var pug = require('pug');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var poll = require('./poll.js');
var Poll = require('../models/poll.js');

/**
 * Middleware to check if the user is logged in.  If not, redirect user to /login
 * @param {object}   req  Request
 * @param {object} res  Reaponse
 * @param {function} next Next
 */
var loggedIn = function(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
};

router.get('/auth/twitter', function (req, res, next) {
    console.log("auth twitter called");
    console.log(req.headers.referer);
    req.session.cburl = req.headers.referer;
    passport.authenticate('twitter', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
    })(req, res, next);
});

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
	successRedirect : '/authreturn',
	failureRedirect : '/'
}));

router.get('/authreturn', function(req, res) {
    console.log("Auth return called...");
    if (typeof req.session.cburl !== "undefined" && req.session.cburl.length > 0) {
        //Note to self:  Now that we are using Angular, the callback URL is going to act differently
        console.log("Valid callback URL: " + req.session.cburl);
        res.redirect("/");
        res.end(); //End this request since the browser will make a seperate request for the page we are redirecting to
        console.log("End called");
        //res.redirect(req.session.cburl);
    }
    else {
        res.redirect('/');
    }
});

router.get('/delete*', loggedIn, function (req, res) {
    if (typeof req.query.type == "undefined" || typeof req.query.id == "undefined") {
        return false;
    }
    console.log("Delete called");
    var currentUser = req.user;
    console.log("User is...");
    console.dir(currentUser);
    var pollID = req.query.id;
    console.log("Poll is " + req.query.id);
    //Find the poll
    var Poll = require('../models/poll.js');
    Poll.findOne({
        _id: pollID
    }, function (err, doc) {
        if (err) {
            console.error(err);
            res.send("Error");
        }
        if (doc) {
            var pollOwner = doc._doc.pollOwner[0]._doc;
            console.log("Poll owner is...");
            console.dir(pollOwner);
            if (currentUser.provider !== pollOwner.userProvider ||
                currentUser.id       !== pollOwner.userId ||
                currentUser.username !== pollOwner.userName) {
                res.json({result:false, message:"Credentials do not match poll owner"});
                return false;
            }
            Poll.remove({_id: pollID}, function(err, result) {
                if (err) {
                    console.log("Error when removing poll: " + err);
                    res.json({result: false, message: err});
                    return false;
                }
                if (result) {
                    console.log("Remove poll result: " + result);
                    res.json({  result: true,
                        message: "Poll deleted"});
                    return true;
                }
            });
        }
    });
})

router.get('/getChartData/*', function (req, res) {
    var chartID = req.params[0];
    if (chartID.length !== 24) {
        res.status(500).json({error: "Expected ChartID to be 24 characters"})
        res.end();
        return;
    }
    else {
        //ChartID is valid.  Store it in res.locals and let the middleware take care of the rest
        res.locals.chartID = chartID;
        poll.getChartData(req, res);
    }
    console.dir(req.params);
});

router.get('/login', function(req, res) {
    var html = pug.renderFile('./views/login-notice.pug');
    res.send(html);
});

router.get('/loginfail', function(req, res) { res.send("Error: Login fail"); });

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//Note the loggedIn middleware function to ensure the user is logged in before displaying the page
router.get('/mypolls', loggedIn, function(req, res) {
    console.log("mypolls called");
    //Remember this is asynchronous, so put the stuff we need to do, afterwards, in the callback
    Poll.find({
        'pollOwner.userProvider': req.user.provider,
        'pollOwner.userId' : req.user.id,
        'pollOwner.userName': req.user.username
    }, function(err, docs) {
        if (err) {
            console.log(err);
        }
        var polls = [];
        for (var i=0; i < docs.length; i++) {
            polls.push(docs[i]._doc);
        }
        var html = pug.renderFile('./views/mypolls.pug', {
            title: "My Polls",
            polls: polls,
            username: req.user.username
        });
        res.send(html);
    });
});

router.get('/poll/*', function(req, res) {
    if (typeof req.params[0] !== "string" || req.params[0].length == 0) {
        res.status(500).json({error: "No poll ID provided"});
        res.end();
    }
    else {
        console.log("About to dir req...");
        console.dir(req);
        var Poll = require('../models/poll.js');
        Poll.findOne({_id: req.params[0]}, function(err, doc) {
            if (err) {
                console.error(err);
                res.send("There was an error: " + err);
            }
            else if (doc === null) {
                res.send("Poll not found");
            }
            else {
                console.log("Poll found");
                console.dir(doc._doc.pollOwner[0]._doc);
                var html = pug.renderFile('./views/poll.pug', {
                    poll: doc._doc,
                    "userName": (typeof req.user !== 'undefined' && typeof req.user.username !== 'undefined')? req.user.username : undefined,
                    "userId": (typeof req.user !== 'undefined' && typeof req.user.id !== 'undefined')? req.user.id : undefined,
                    "userProvider": (typeof req.user !== 'undefined' && typeof req.user.provider !== 'undefined')? req.user.provider : undefined
                });
                res.send(html);
            }
        });
    }
});

/*
router.get('/poll/*', function(req, res) {
    if (typeof req.params[0] !== "string" || req.params[0].length == 0) {
        res.status(500).json({error: "No poll ID provided"});
        res.end();
    }
    else {
        var Poll = require('../models/poll.js');
        Poll.findOne({_id: req.params[0]}, function(err, doc) {
            if (err) {
                console.error(err);
                res.send("There was an error: " + err);
            }
            else if (doc === null) {
                res.send("Poll not found");
            }
            else {
                console.log("Poll found");
                console.dir(doc._doc.pollOwner[0]._doc);
                var html = pug.renderFile('./views/poll.pug', {
                    poll: doc._doc,
                    "username": (typeof req.user !== 'undefined' && typeof req.user.username !== 'undefined')? req.user.username : undefined
                });
                res.send(html);
            }
        });
    }
})
*/

router.get('/new', loggedIn, function(req, res) {
    var html = pug.renderFile('./views/newpoll.pug', {"username" : req.user.username});
    res.send(html);
});


//urlencodedParser will put the POST data in req.body
router.post('/submit-poll', urlencodedParser, function(req, res) {
    poll.create(req, res);
});

//Submit *VOTE*
router.post('/submit-vote', urlencodedParser, function(req, res) {
    poll.castVote(req, res);
});

router.get('/home', function(req, res){
    var Poll = require('../models/poll.js');
    var polls = [];
    
    //Remember, this is asynchronous!
    Poll.find({})
        .limit(50)
        .sort('-dateCreated')
        .exec(function(err, docs) {
            for (var i=0; i < docs.length; i++) {
                polls.push(docs[i]._doc);
            }
            if (req.hasOwnProperty("user") && req.user.hasOwnProperty("username")) {
                console.log("We have a user, here!");
                var html = pug.renderFile('./views/home.pug', {
                    title: "Home", 
                    polls: polls,
                    username: req.user.username
                });
            }
            else {
                console.log("We don't have a user here!");
                var html = pug.renderFile('./views/home.pug', {
                    title: "Home", 
                    polls: polls,
                });
            }
            res.send(html);
        }); // </exec>
    // </Poll>
});

router.get('/', function(req, res) {
    if (req.hasOwnProperty("user") && req.user.hasOwnProperty("username")) {
        var html = pug.renderFile('./views/shell.pug', {
            title: "Home",
            username: req.user.username
        });
        res.send(html);
    }
    else { //We have no user
        var html = pug.renderFile('./views/shell.pug', {
            title: "Home"
        });
        res.send(html);
    }
});

module.exports = router;