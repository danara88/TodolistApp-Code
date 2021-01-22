'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = '09112000';

exports.auth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(404).send({ message: 'Sin cabecera de autorización' });
    }
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        var payload = jwt.decode(token, secret);
        if(payload.exp <= moment().unix()) return res.status(401).send({ message: 'El token ha expirado' });
    } catch(ex) {
        return res.status(404).send({ message: 'Token no valido' });
    }

    req.user = payload;
    next();
}