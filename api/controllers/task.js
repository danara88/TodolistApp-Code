'use strict'

var Task = require('../models/task');
var moment = require('moment');
var pagination = require('mongoose-pagination');

var controller = {

    /** CREAR UNA TAREA NUEVA */
    createTask: function(req, res){
        var task = new Task();
        var params = req.body;
        task.title = params.title;
        task.user = req.user.sub;
        task.content = params.content;
        task.status = 'false';
        task.created_at = moment().unix();

        if(task.title != null  && task.user != null){
            if(task.title.length >= 8 && task.title.length <= 30){
               
                    task.save((err, TasKSaved) => {
                        if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
                        if(!TasKSaved) return res.status(404).send({ message: 'No se guardó la tarea' });
                        return res.status(200).send({ task: TasKSaved });
                    });
        
            } else {
                return res.status(200).send({message: 'El titulo deber tener 8 cacteres minimo y máximo 20'});
            }
        } else {
            return res.status(200).send({ message: 'Ingresa los datos' });
        }
    },

    /** OBTENER LAS TAREAS DEL USUARIO  */
    getTasks: function(req, res){
        var userId = req.user.sub;
        Task.find({ user: userId }).populate(' user ','name surname').sort('created_at').exec((err, tasks) => {
            if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
            if(!tasks) return res.status(404).send({ message: 'No se obtuvieron los datos' });
            return res.status(200).send({ tasks });
        });
    },

     /** OBTENER LAS TAREAS DEL USUARIO PAGINADO  */
     getTasksPaginated: function(req, res){
        var userId = req.user.sub;
        var page = 1;
        var itemsPerPage = 10;

        if(!page){
            page = req.params.page;
        }

        Task.find({ user:  userId }).sort('created_at').paginate(page, itemsPerPage, (err, tasks) => {
            if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
            if(!tasks) return res.status(404).send({ message: 'No se obtuvieron los datos' });
            return res.status(200).send({ tasks, itemsPerPage, page });
        });


     },

     /** TAREA COMPLETADA */
     finishedTask: function(req, res){
        var taskId = req.params.id;
        var userId = req.user.sub;

        Task.findById(taskId, (err, task) => {
            if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
            if(task.user != userId){
                return res.status(404).send({message: 'No tienes permiso para realizar esta acción' });
            } else {
                Task.findByIdAndUpdate(taskId, { status: 'true' }, {new: true}, (err, UpdatedTask) => {
                    if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
                    if(!UpdatedTask) return res.status(404).send({ message: 'Dato no encontrado o no existente' });
                    UpdatedTask.title = undefined;
                    UpdatedTask.user = undefined;
                    UpdatedTask.created_at = undefined;
                    UpdatedTask.__v = undefined;
                    return res.status(200).send({ UpdatedTask });
                });
            }
        });

     },

     /** TAREA NO FINALIZADA */
     unfinishedTask: function(req, res){
        var taskId = req.params.id;
        var userId = req.user.sub;

        Task.findById(taskId, (err, task) => {
            if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
            if(task.user != userId){
                return res.status(404).send({message: 'No tienes permiso para realizar esta acción' });
            } else {
                Task.findByIdAndUpdate(taskId, { status: 'false' }, {new: true}, (err, UpdatedTask) => {
                    if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
                    if(!UpdatedTask) return res.status(404).send({ message: 'Dato no encontrado o no existente' });
                    UpdatedTask.title = undefined;
                    UpdatedTask.user = undefined;
                    UpdatedTask.created_at = undefined;
                    UpdatedTask.__v = undefined;
                    return res.status(200).send({ UpdatedTask });
                });
            }
        });
     },

     /** ELIMINAR UNA TAREA */
     delteTask: function(req, res){
        var userId = req.user.sub;
        var taskId = req.params.id;
        Task.findById(taskId, (err, task) => {
            if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
            if(!task) return res.status(404).send({ message: 'Dato no encontrado o no existente' });
            if(task.user._id != userId){
                return res.status(403).send({ message: 'Permiso denegado' });
            } else {
                Task.findByIdAndDelete(taskId, (err, TaskDeleted) => {
                    if(err) return res.status(500).send({ message: 'Se produjo un error en el servidor' });
                    if(!TaskDeleted) return res.status(404).send({ message: 'Dato no encontrado o no existente' });
                    return res.status(200).send({ task: TaskDeleted});
                });
            }

        });
     },

     /** BUSCADOR DE TAREAS */
     searchTask: function(req, res){
         var params = req.body;
         var search = params.title;

         Task.find({ title: {"$regex": ".*" + search + ".*"} }).sort('-created_at').exec((err, tasks) => {
            if(err) return errorServer(err, res, 'Se produjo un error');
            if(!tasks) return errorNotfound(err, res, 'No obtuvieron los datos');
            var tasks_clean = [];
            tasks.forEach((task) => {
               if(task.user == req.user.sub) tasks_clean.push(task);
            });
            console.log(tasks_clean)
            if(tasks_clean.length == 0){
                return res.status(200).send({ message: 'Sin resultados de ' + search });
            } else {
                return res.status(200).send({ 
                    tasks: tasks_clean,
                    message: 'Resultados de ' + search
                });
            }
           
         });
     }


};

function errorServer(err, res, message){
    res.status(500).send({message: message});
}

function errorNotfound(err, res, message){
    res.status(404).send({message: message});
}

module.exports = controller;

