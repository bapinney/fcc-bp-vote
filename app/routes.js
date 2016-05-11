var express = require('express');
var router = express.Router();
//var passport = require('./models/user');
var passport = require('passport');
var pug = require('pug');

var loggedIn = function(req, res, next) {
    if (req.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
};
        
router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', 
    passport.authenticate('twitter', { 
        successRedirect: '/mypolls',
        failureRedirect: '/loginfail' })
);

router.get('/mypolls', loggedIn, function(req, res) {
    //res.send("Hi " + req.user.username);
    var username = req.user.username;
    var html = pug.renderFile('./views/mypolls.pug', {"username" : username});
    res.send(html);
});

router.get('/login', function(req, res) {
    res.send("Add login message here.");
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/loginfail', function(req, res) { res.send("uh oh"); });

router.get('/', function(req, res){
    var html = pug.renderFile('./views/home.pug', {title: "Home"});
    res.send(html);
})

/* Use this to build a skeleton, then remove */
/*
router.get('/', function(req, res) {
    res.sendFile(global.rootDir + '/public/sindex.html');
});
*/

module.exports = router;