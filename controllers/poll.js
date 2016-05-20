var pug = require('pug');
var mongoose = require('mongoose');
var Poll = require('../models/poll.js');

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
            console.log("Poll found!");
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
                    
                    console.dir(poll._doc.votes);
                    
                    /*
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
                        }
                        else {
                            res.json({result: "success"});
                        }
                    })
                    */
                }
            }
            else if (req.body["vote-selection"] == "addNew") {
                if (req.body["custom-vote"] == undefined || res.body["custom-vote"].length == 0) {
                    res.json({error: "Custom option undefined or blank"})
                }
            }
            //res.write(poll.toString());
            //res.end();
        }
        else {
            res.write("Poll not found");
        }
    });
    //console.log("About to log req");
    //console.dir(req);
}

