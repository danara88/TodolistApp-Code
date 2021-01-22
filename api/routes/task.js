'use strict'

var TaskController = require('../controllers/task');
var express = require('express');
var api = express.Router();
var md_auth = require('../middlewares/jwt');

api.post('/save-task', md_auth.auth, TaskController.createTask);
api.get('/tasks', md_auth.auth, TaskController.getTasks);
api.get('/tasks-paginate/:page?', md_auth.auth, TaskController.getTasksPaginated);
api.put('/finished-task/:id', md_auth.auth,  TaskController.finishedTask);
api.put('/unfinished-task/:id', md_auth.auth,  TaskController.unfinishedTask);
api.delete('/delete-task/:id', md_auth.auth, TaskController.delteTask);
api.post('/search-task', md_auth.auth, TaskController.searchTask);

module.exports = api;