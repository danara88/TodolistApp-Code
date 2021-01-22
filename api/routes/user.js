'use strict'

var UserController = require('../controllers/user');
var express = require('express');
var api = express.Router();
var md_auth = require('../middlewares/jwt');
var multipart = require('connect-multiparty');
var md_dir = multipart({ uploadDir: './uploads/users' });

api.post('/register', UserController.register);
api.post('/login', UserController.login);
api.put('/update-user', md_auth.auth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.auth, md_dir], UserController.uploadImage);
api.get('/get-stats', md_auth.auth, UserController.getStats);
api.get('/get-image-user/:fileName', UserController.getImage);
api.get('/user', md_auth.auth, UserController.getUser);

module.exports = api;