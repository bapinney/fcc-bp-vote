var passport = require('passport');

//Do NOT add () to Strategy
var TwitterStrategy = require('passport-twitter').Strategy;
//Our Twitter User model
var User = require('../models/user');
