var pug = require('pug');
var mongoose = require('mongoose');
var Poll = require('../models/poll.js');
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');

exports.create = function(req, res) {
    console.log("About to dir req");
    console.dir(req);    
    var pollQuestion = req.body['poll-question'];
    var pollOptions = [];
    var postKeys = Object.keys(req.body);
    //Count how many options are in the poll
    var nOptions = 0;
    postKeys.forEach(function(ele, idx, arr) {
        if (ele.substr(0,11) == "poll-option") {
            nOptions++;
        }
    });
    for(var i=1; i <= nOptions; i++ ) {
        pollOptions.push(req.body['poll-option-' + i]);
    }
    var user = req.user;
    console.log(nOptions + " options");
    console.dir(pollOptions);
    console.dir(user);
    
    var poll = new Poll({
        pollOwner   : {
            userProvider: user.provider,
            userId      : user.id,
            userName    : user.username},
        question    : pollQuestion,
        options     : pollOptions,
        votes       : []
    });
    console.log("About to save poll...");
    poll.save();
    
    var html = pug.renderFile("./views/poll-submit.pug");
    res.write(html);
    res.end();
}

exports.castVote = function(req, res) {
    var errors = [];
    //First, we got to find the poll
    Poll.findOne({'_id': req.body['poll-id']}, function(err, poll) {
        if (poll) {
            console.log("Poll found! DIRing poll");
            console.dir(poll);
            if (req.body["vote-selection"] == undefined) {
                res.json({error: "No vote selection provided"});
                return false;
            }
            console.log(typeof parseInt(req.body["vote-selection"]));
            if (!isNaN(parseInt(req.body["vote-selection"]))) {
                console.log("Selection was a number");
                //We have a number, but let's make sure that Nth option exists
                if (poll.options[parseInt(req.body["vote-selection"])] !== undefined) {
                    console.log("The option selected exists");
                    
                    
                    //Make sure the user has not already voted...
                    
                    console.log("About to dir requser and pollvotes");
                    console.dir(req.user);
                    console.dir(poll._doc.votes);
                    
                    if (typeof req.user !== 'undefined') {
                        Poll.findOne({'_id': req.body['poll-id']}, {votes: {$elemMatch: {userId: req.user.id}}}, function(err, vote) {
                            if (err) {
                                console.error(err);
                            }
                            if(vote._doc.votes.length === 0) {
                                poll.votes.push({
                                    userProvider:   req.user.provider,
                                    userName:       req.user.username,
                                    userId:         req.user.id,
                                    userIP:         req.connection.remoteAddress,
                                    nOptionVoted:   parseInt(req.body["vote-selection"])
                                });
                                console.log("About to call save");
                                poll.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send({ result: "error" });
                                    }
                                    else {
                                        res.json({result: "success"});
                                    }
                                });
                            }
                            else {
                                res.json({result: "already voted"})
                            }
                        });
                    }
                    else {
                        console.log("User is not signed in.  Searching by IP address for previous voting...");
                        Poll.findOne({'_id': req.body['poll-id']}, { "votes.userIP": req.connection.remoteAddress}, function(err, doc) {
                            if (err) {
                                console.error(err);
                            }
                            if (doc._doc.votes.length === 0) {
                                console.log("No votes found");
                                poll.votes.push({
                                    userProvider:   null,
                                    userName:       null,
                                    userId:         null,
                                    userIP:         req.connection.remoteAddress,
                                    nOptionVoted:   parseInt(req.body["vote-selection"])
                                });
                                console.log("About to call save");
                                poll.save(function(err) {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send({ result: "error" });
                                    }
                                    else {
                                        res.json({result: "success"});
                                    }
                                });
                            }
                            else {
                                res.json({result: "already voted"});
                            }
                        });
                    }
                    
                }
            }
            //User wants to add a custom option
            else if (req.body["vote-selection"] == "addNew") {
                //Make sure they included their custom option
                if (req.body["custom-vote"] === undefined) {
                    res.json({error: "Custom option undefined or blank"});
                    return false;
                }
                //Make sure it isn't blank
                if (req.body["custom-vote"].length == 0) {
                    res.json({error: "Custom option undefined or blank"});
                    return false;
                }
                //Add the option using $addToSet (which will not add it again if it is already there)
                poll.options.addToSet(req.body["custom-vote"]);
                poll.save(function(err) {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ result: "error" });
                    }
                    else {
                        res.json({result: "success"});
                    }
                });
            }
            //res.end();
        }
        else {
            res.write("Poll not found");
        }
    });
}

exports.getResults = function(req, res) {
    //res.write("Requested for " + res.locals.chartID);
    console.log("getResults called");
    //Get the text of options for this poll, so we can match up the aggregates in the subsequent query
    db.collection('fccvote-polls').findOne(
        {_id: ObjectID(res.locals.chartID)},
        { options:1 , _id:0},
        function(err, doc) {
            if (doc === null) {
                res.json({error: "Poll not found"});
                return false;
            }
            var options = doc.options;
            console.dir(options);
            db.collection('fccvote-polls').aggregate([
                { $unwind: "$votes"},
                { $match: {_id: ObjectID(res.locals.chartID)}},
                { $group: {_id: "$votes.nOptionVoted", nVotes:{$sum: 1}}}
            ]).toArray(function(err, docs) {
                console.dir(docs);
                var resArr = {};
                for (var i=0; i<docs.length; i++) {
                    console.log("i is: " + docs[i]["_id"]);
                    resArr[options[i]] = docs[i]["nVotes"];
                }
                res.send(resArr);
                
            });
        }
    );
}
