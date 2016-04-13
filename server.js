var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

if (!(process.env.TWITCKEY)) {
    require('./config.js');
}

app.use(express.static('public'));

app.listen(port, function() {
    console.log("Listening on port " + port);
})