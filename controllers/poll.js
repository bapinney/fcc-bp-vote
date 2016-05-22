var pug = require('pug');
var mongoose = require('mongoose');
var Poll = require('../models/poll.js');
var ObjectID = require('mongodb').ObjectID;

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
            console.log(54);
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
                            console.log("About to return fineOne vote result _doc");
                            console.dir(vote._doc);
                        });
                    }
                    else {
                        console.log("User is not signed in.  Searching by IP address for previous voting...");
                        Poll.findOne({'_id': req.body['poll-id']}, { "votes.userIP": req.connection.remoteAddress}, function(err, doc) {
                            if (err) {
                                console.error(err);
                            }
                            if (doc._doc.votes.length == 0) {
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
            else if (req.body["vote-selection"] == "addNew") {
                if (req.body["custom-vote"] == undefined || res.body["custom-vote"].length == 0) {
                    res.json({error: "Custom option undefined or blank"})
                }
            }
            //res.end();
        }
        else {
            res.write("Poll not found");
        }
    });
    //console.log("About to log req");
    //console.dir(req);
}

exports.getResults = function(req, res) {
    //res.write("Requested for " + res.locals.chartID);
    /*
    Poll.findOne({'_id': res.locals.chartID}, {"votes": true}, function(err, votes) {
        if (err) {
            console.error(err);
            res.status(500).json({error: "Error retrieving poll results"});
            return false;
        }
        console.log("Returning votes...");
        console.dir(votes);
    }); */
    
    /*
    db.getCollection('fccvote-polls').aggregate([
        { $unwind: "$votes" },
        { $match: { _id: ObjectId("573d2c68703d86570499813a")}},
        { $group: { _id: "$votes.nOptionVoted", nVotes:{$sum: 1}}}
    ]
    */
    db.collection('fccvote-polls').aggregate([
        { $unwind: "$votes"},
        { $match: {_id: ObjectID(res.locals.chartID)}},
        { $group: {_id: "$votes.nOptionVoted", nVotes:{$sum: 1}}}
    ]).toArray(function(err, docs) {
        console.log("Returning aggregates...");
        console.dir(docs);
        res.json(docs);
    });
    
}
