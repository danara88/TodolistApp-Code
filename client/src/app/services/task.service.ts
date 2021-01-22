import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Global } from './global';
import { Task } from '../models/task';
import { Observable } from 'rxjs/observable';

@Injectable()

export class TaskService {
    public url: string;
    constructor( private _http: HttpClient ){
        this.url = Global.url;
    }

    // GUARDAR TAREAS
    saveTask(task: Task, token: string): Observable<any>{
        let params = JSON.stringify(task);
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
            .set('Authorization', token);
        return this._http.post(this.url + 'save-task', params, {headers: headers});
    }

    // OBTENER TODAS LAS TAREAS
    getTasks(token: string): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
            .set('Authorization', token);
        return this._http.get(this.url + 'tasks', {headers: headers});
    }

    // ELIMINAR UNA TAREA
    deleteTask(token: string, id:string): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
            .set('Authorization', token);
        return this._http.delete(this.url + 'delete-task/' + id, {headers: headers});
    }

    // MARCAR TAREAS FINALIZADAS
    finishedTask(token: string, id: string): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
            .set('Authorization', token);
        return this._http.put(this.url + 'finished-task/' + id, {}, {headers: headers});
    }

    // MARCAR COMO TAREA NO FINALIZADA
    unfinishedTask(token: string, id: string): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
            .set('Authorization', token);
        return this._http.put(this.url + 'unfinished-task/' + id, {}, {headers: headers});
    }
}