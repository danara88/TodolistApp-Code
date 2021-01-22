import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Global } from './global';
import { User } from '../models/user';

@Injectable()

export class UserService {
    public url: string;
    public token: string;
    public identity: any;
    constructor( private _http: HttpClient ){
        this.url = Global.url;
    }
    // OBTENER EL TOKEN
    getToken(){
        let token = localStorage.getItem('token');
        if(token == 'undefined'){
            this.token = null;
        } else {
            this.token = token;
        }
        return this.token;
    }

    // OBTENER LA INDETIDAD DEL USUARIO
    getIdentity(){
        let identity = JSON.parse(localStorage.getItem('identity'));
        if(identity == 'undefined'){
            this.identity = null;
        } else {
            this.identity = identity;
        }
        return this.identity;
    }

    // REGISTRAR AL USUARIO
    register(user: User): Observable<any>{
        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.post(this.url + 'register', params, {headers: headers});
    }

    // INICIO DE SESIÓN DEL USUARIO
    login(user, hash = null): Observable<any>{
        if(hash != null){
            user.hash = hash;
        }
        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.post(this.url + 'login', params, {headers: headers});
    }

    // OBTENER LAS ESTADISTICAS DEL USUARIO
    getStats(): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
            .set('Authorization', this.getToken());
        return this._http.get(this.url + 'get-stats', {headers: headers});
    }

    // OBTENER AL USUARIO
    getUser(): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
            .set('Authorization', this.getToken());
        return this._http.get(this.url + 'user', {headers: headers});
    }

    // ACTUALIZAR INFORMACIÓN DEL USAURIO
    updateUser(user: User, token: string): Observable<any>{
        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
            .set('Authorization', this.getToken());
        return this._http.put(this.url + 'update-user', params, {headers: headers});
    }

}