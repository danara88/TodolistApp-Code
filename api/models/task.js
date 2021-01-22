'use strict'
var moongose = require('mongoose');
var Schema = moongose.Schema;

var TaskSchema = Schema({
    user: { type: Schema.ObjectId, ref: "User" },
    title: String,
    content: String,
    status: String,
    created_at: String,
});

module.exports = moongose.model('Task', TaskSchema);