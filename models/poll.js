var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*  Poll owner schema will be used as a Mongo sub-doc
    inside of the poll doc */
var pollOwnerSchema = new Schema({
    userProvider    : String,
    userId          : Number,
    userName        : String
    }
);

/**
 * Valides the votes sub-Document is correctly formatted 
 * @param   {Array} arr Array to be inserted
 * @returns {boolean}  True, if correctly formatted.  Otherwise, false.
 */
var votesValidator = function(arr) {
    if (Array.isArray(arr) !== true) {
        return false;
    }
    for (var i=0; i<arr.length; i++) {
        if (!arr[i].hasOwnProperty('userProvider')) { return false; }
        if (!arr[i].hasOwnProperty('userName')) { return false; }
        if (!arr[i].hasOwnProperty('userId')) { return false; }
        if (!arr[i].hasOwnProperty('nOptionVoted')) { return false; }
        if (!arr[i].hasOwnProperty('userIP')) { return false; }
    }
    return true;
}

var pollSchema = new Schema({
    dateCreated : { type: Date, default: Date.now },
    pollOwner   : [pollOwnerSchema],
    question    : String,
    options     : Array,
    votes       : {type: Array, validate: [votesValidator, 'The votes document did not pass validation']}
    }, 
    {collection: 'fccvote-polls'} //The collection will be created if it does not exist
);

module.exports = mongoose.model('Poll', pollSchema);
