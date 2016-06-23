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
    var pollSaveResult = poll.save(function(err, record) {
        console.log("About to log record._doc._id");
        console.log(record._doc._id);
        res.json({pollID: record._doc._id});
    });
    
    return true;
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
                
                //Make sure the user has not already voted...
                Poll.findOne({'_id': req.body['poll-id']}, {votes: {$elemMatch: {userId: req.user.id}}}, function(err, vote) {
                    if (err) {
                        console.error(err);
                    }
                    if(vote._doc.votes.length > 0) {
                        res.status(403).send({error: "Cannot add custom option after voting"});
                        return false;
                    };
                    
                    //Add the option using $addToSet (which will not add it again if it is already there)
                    poll.options.addToSet(req.body["custom-vote"]);
                    poll.save(function(err) {
                        if (err) {
                            console.log(err);
                            res.status(500).send({ result: "error" });
                        }
                        else {
                            //Get the position of the option the user added so it can be voted on
                            var nOption = poll.options.indexOf(req.body["custom-vote"]);
                            poll.votes.push({
                                userProvider:   req.user.provider,
                                userName:       req.user.username,
                                userId:         req.user.id,
                                userIP:         req.connection.remoteAddress,
                                nOptionVoted:   parseInt(nOption)
                            });
                            poll.save(function(err) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send({ result: "error" });
                                }
                                else {
                                    res.json({result: "success", 
                                              message: "Custom option added and voted."});
                                }
                            });
                        }
                    });
                });
                                
            }
            //res.end();
        }
        else {
            res.write("Poll not found");
        }
    });
}

exports.getChartData = function(req, res) {
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
            console.log("Here is options array")
            console.dir(options);
            
            //Now get the votes for those options
            db.collection('fccvote-polls').aggregate([
                { $unwind: "$votes"},
                { $match: {_id: ObjectID(res.locals.chartID)}},
                { $group: {_id: "$votes.nOptionVoted", nVotes:{$sum: 1}}},
                { $sort:  {_id: 1}}
            ]).toArray(function(err, docs) { //NOT to be confused with 'doc', above
                console.log("About to dir docs, whose length is " + docs.length);
                console.dir(docs);
                //Response should be an **array** of objects
                var resArr = [];
                
                //Record numbers for recorded votes
                var nVotes = [];
                for (var i=0; i < docs.length; i++) {
                    console.log("At i=" + i);
                    if (docs[i]["nVotes"] !== null) {
                        nVotes[docs[i]["_id"]] = docs[i]["nVotes"];
                    }
                    else {
                        console.log("Else callsed at i:" + i);
                        nVotes[docs[i]["_id"]] = 0; //If we have no record, that means the option has 0 votes
                    }
                }
                
                //Record 0s for any votes with no records
                for (var i=0; i < options.length; i++) {
                    if (nVotes[i] == null) {
                        nVotes[i] = 0;
                    }
                }
                
                
                console.log("Here is the nVotes array");
                console.dir(nVotes);
                
                
                for (var i=0; i < options.length; i++) {
                    var obj2push = {};
                    obj2push["nOption"] = i;
                    obj2push["optionLabel"] = options[i];
                    obj2push["nVotes"] = nVotes[i];
                    resArr.push(obj2push);
                }

                //Sends the data to the client JS for charting
                res.send(resArr);
            });
        }
    );
}

exports.haveIVoted = function (req, res) {
    var pollID = res.locals.pollID;
    console.log("haveIVoted function called! PollID: " + pollID);
    console.log("Searching for Poll...");
    Poll.findOne({
        '_id': pollID
    }, function (err, poll) {
        if (poll) {
            //Poll found
            if (typeof req.user !== 'undefined') {
                console.log("User is signed in... Searching by User ID...");
                Poll.findOne({
                    '_id': req.body['poll-id']
                }, {
                    votes: {
                        $elemMatch: {
                            userId: req.user.id
                        }
                    }
                }, function (err, vote) {
                    if (err) {
                        console.error(err);
                        res.json({
                            error: "Unable to locate result"
                        });
                    }
                    if (vote._doc.votes.length === 0) {
                        res.json({
                            hasVoted: false
                        });
                    } else {
                        res.json({
                            hasVoted: true
                        });
                    }
                });
            } else {
                console.log("User is not signed in.  Searching by IP...");
                Poll.findOne({
                    '_id': req.body['poll-id']
                }, {
                    "votes.userIP": req.connection.remoteAddress
                }, function (err, doc) {
                    if (err) {
                        console.error(err);
                            res.json({
                                error: "Unable to locate result"
                            });
                    }
                    if (doc._doc.votes.length === 0) {
                        res.json({
                            hasVoted: false
                        });
                    } else {
                        res.json({
                            hasVoted: true
                        });
                    }
                });
            }
        } else {
            res.json({
                error: "Poll not found"
            });
        }
    });
}
