var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs'); //Password hashing
var Schema = mongoose.Schema;

/*  Properties we care about:
    id, token, name, screen_name, location, description
    All but ID are strings */

var userSchema = new Schema({
    provider    : String,
    id          : Number,
    token       : String,
    username    : String
    }
);

/*  We are allowed to write methods to Schemas
    http://mongoosejs.com/docs/guide.html#methods */

//Generates a hash - https://www.npmjs.com/package/bcrypt-nodejs
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

//Returns a bool if the passwords match
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
