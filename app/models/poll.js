var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*  Poll owner schema will be used as a Mongo sub-doc
    inside of the poll doc */
var pollOwnerSchema = new Schema({
    userProvider    : String,
    userId          : Number
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
    }
    return true;
}

var pollSchema = new Schema({
    dateCreated : function() { return Date.now(); },
    pollOwner   : [pollOwnerSchema],
    question    : String,
    options     : Array,
    votes       : Array  //Create a validator for this
});

/*  We are allowed to write methods to Schemas
    http://mongoosejs.com/docs/guide.html#methods */

//Generates a hash - https://www.npmjs.com/package/bcrypt-nodejs
pollSchema.methods.createPoll = function() {
    return false;
};

module.exports = mongoose.model('User', userSchema);
