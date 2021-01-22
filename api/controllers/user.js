'use strict'

var User = require('../models/user');
var Task = require('../models/task');
var bcrypt =require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var path = require('path');
var fs = require('fs');

var controller = {

    /** REGISTRO DEL USUARIO */
    register: function(req, res){
        var user = new User();
        var params = req.body;

        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.password = params.password;
        user.image = null;
        user.role = 'ROLE_USER';

        if(user.name != null && user.surname != null && user.email != null && user.password != null){
            // Comprobación de longitud de la contraseña
            if(user.password.length < 5) return res.status(404).send({ message: 'La contraseña tiene que tener un minimo de 5 caracteres' });
            // Verificar que no haya otra cuenta
            User.find({ email: user.email }, (err, users) => {
                if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor.' });
                if(!users) return res.status(404).send({ message: 'Fallo al encontrar usuarios duplicados' });
                if(users.length != 0){
                    return res.status(404).send({ message: 'Esta cuenta ya esta registrada' });
                } else {
                // Encriptar la contraseña
                bcrypt.hash(user.password, null, null, (err,hash) => {
                    user.password = hash;
                    // Guardar en la base de datos
                    user.save((err, UserSaved) => {
                        if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor.' });
                        if(!UserSaved) return res.status(404).send({ message: 'Fallo en el registro' });
                        return res.status(200).send({ user: UserSaved });
                    });
                });
            }
            });
        } else {
            return res.status(404).send({ message: 'Ingresa todos los datos' });
        }
    },

    /** INICIO DE SESION */
    login: function(req, res){
        var params = req.body;
        var email = params.email;
        var password = params.password;
        User.findOne({ email: email }, (err, user) => {
            if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor.' });
            if(!user) return res.status(404).send({ message: 'Correo o contraseña incorrectos.' });
            bcrypt.compare( password, user.password, (err, check) => {
                if(check){
                    if(params.hash){
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }
                } else {
                    return res.status(404).send({ message: 'Correo o contraseña incorrectos.' });
                }
            });
        });
    },

    /** ACTUALIZAR CUENTA DEL USUARIO */
    updateUser: function(req, res){
        var userId = req.user.sub;
        var update = req.body;
        delete update.password;
        User.find({ email: update.email }, (err, users) => {
            if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor.' });
            if(users.length > 1){
                return res.status(404).send({ message: 'Esta cuenta ya se encuneta en uso' });
            } else {
                User.findByIdAndUpdate(userId, update, {new: true}, (err, UserUpdated) =>  {
                    if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor.' });
                    if(!UserUpdated) return res.status(404).send({ message: 'Actualización de datos fallida.' });
                    UserUpdated.password = undefined;
                    return res.status(200).send({ user: UserUpdated });
                });
            }
        });
        
    },

    /** Subir una foto de perfile */
    uploadImage: function(req, res){
        var userId = req.params.id;
        if(req.files){
            var path = req.files.image.path;
            var path_split = path.split('/');
            var name = path_split[2];

            var path_ext = path.split('\.');
            var ext = path_ext[1];
            if(userId != req.user.sub){
                return removeFromUploads(path, 'Extensión no aceptada', res);
            }
            if(userId != req.user.sub) removeFromUploads(path, 'No tienes permiso para realizar esta acción', res);
            if(ext == 'png' || ext =='jpg' || ext == 'gif' || ext == 'jpeg'){
                User.findByIdAndUpdate(userId, {image: name}, {new: true}, (err, UploadUser) => {
                    if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
                    if(!UploadUser) return res.status(404).send({ message: 'Foto de perfil no actualizada' });
                    UploadUser.password = undefined;
                    return res.status(200).send({ user: UploadUser });
                });
            } else {
                return removeFromUploads(path, 'Extensión no aceptada', res);
            }
    
        } else {
            return res.status(404).send({ message: 'No se detectó una imagen' });
        }
    },

    /** OBTENER LAS IMAGEM */
    getImage: function(req, res){
        var fileName = req.params.fileName;
        var file_path = './uploads/users/' + fileName;
        fs.exists(file_path, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(file_path));
            } else {
                return res.status(404).send({ message: 'Imagen no existente' });
            }
        });
    },

    /** SACAR LAS ESTADISTICAS */
    getStats: function(req, res){
        var userId = req.user.sub;
        getStats(userId, req, res).then((value) => {
            return res.status(200).send({
                totalTasks: value.totalTasks,
                finishedTasks: value.finishedTasks,
                unfinishedTasks: value.unfinishedTasks
            });
        })

    },

    /** INFORMACIÓN DEL USUARIO */
    getUser: function(req, res){
        var userId = req.user.sub;
        if(userId != req.user.sub) return res.status(403).send({ message: 'Permiso denegado' });
        User.findById(userId, (err, user) => {
            if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor.' });
            if(!user) return res.status(404).send({ message: 'No existe el usuario' });
            return res.status(200).send({ user });
        });
    }
};

function removeFromUploads(path, message, res){
    fs.unlink(path, (err) => {
        return res.status(404).send({ message: message });
    });
}

async function getStats(userId, req, res){
    /** SACAR LAS TAREAS QUE YA HE TERMINADO */
    var getFinishedTasks = await Task.find({ user: userId, status: 'true' }).exec().then((tasks) => {
        return tasks.length;
    })
    .catch((err) => {
        return handleError(err);
    });

    /** SACAR LAS TAREAS QUE NO HE ACABADO */
    var getUnfinishedTasks = await Task.find({ user: userId, status: 'false' }).exec().then((tasks) =>{
        return tasks.length;
    }).catch((err) => {
        return handleError(err);
    });

    /** SACAR TOTAL DE TAREAS */
    var getTotalTasks = await Task.find({ user: userId }).exec().then((tasks) => {
        return tasks.length;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        finishedTasks: getFinishedTasks,
        unfinishedTasks: getUnfinishedTasks,
        totalTasks: getTotalTasks
    };
}

module.exports = controller;