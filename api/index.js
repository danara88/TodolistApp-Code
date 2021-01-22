'use strict'

var moongose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');

var port = process.env.PORT || 3700;
var app = express();

/** Incluir rutas del api */
var user_routes = require('./routes/user');
var task_routes = require('./routes/task');

/** Incluir los sockets */
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(socket){
    console.log(' --- >> El sockect esta conectado y listo');

    // GUARDAR NUEVA TAREA 
    socket.on("save-task", function(task){
        io.emit("new-task", { task });
    });

    // NUEVAS ESTADISTICAS DEL USUARIO
    socket.on('save-stats', function(stats){
        io.emit('new-stats', {stats});
    });
});

/** Iniciar conexión a la base de datos y crear servidor */
moongose.Promise = global.Promise;
moongose.connect('mongodb+srv://Daniel:daniel1234@cluster0.pwc33.mongodb.net/app-enlistalo?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Conexión exitosa a la base de datos");
        server.listen(port, () => {
            console.log('Servidor corriendo por: http://localhost:3700');
        });
    })
    .catch((err) => {
        console.log(err);
    });

/** Middlewares */
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/** Cors */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

/** Middleware de rutas */
app.use('/api', user_routes);
app.use('/api', task_routes);

module.exports = app;