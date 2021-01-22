'use strict'

var moongose = require('mongoose');
var Schema = moongose.Schema;

var UserSchema = Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String,
});

module.exports = moongose.model('User', UserSchema);
