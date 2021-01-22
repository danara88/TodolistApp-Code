import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {  TaskService} from '../../services/task.service';
import { Task } from '../../models/task';
import * as io from 'socket.io-client';
declare var $:any;

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    providers: [UserService, TaskService]
})

export class HomeComponent implements OnInit {
    public title: string;
    public identity: any;
    public loading: boolean;
    public task: Task;
    public tasks: Task[];
    public token: string;
    public submitedTask: boolean;
    public errorMessage: string;
    public status: string;
    public totalTasks: any;
    public finishedTasks: any;
    public unfinishedTasks: any;
    public alertMessage: string;

    public socket;
    public io;
    constructor(
        private _userService: UserService,
        private _taskService: TaskService
    ){
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.task = new Task('',this.identity._id,'','','','');
        this.submitedTask = false;
        this.loading = false;
        this.socket = io('https://app-enlistalo.herokuapp.com/');
    }

    ngOnInit(){
        this.getTaskFromSocket();
        this.effectBiggerFont();
        this.effectBtnCheck();
        this.getTasks();
    }

    effectBiggerFont(){
        $(document).ready(function(){
            var btn = $('#addTask');
            
            btn.hover(bigger, smaller);
            btn.click(clickSmaller);
              function bigger(){
                $(this).animate({fontSize: '19px'}, 90);
              }
              function smaller(){
                $(this).animate({fontSize: '16px'}, 90);
              }
              function clickSmaller(){
                $(this).animate({fontSize: '16px'}, 90);
              }
        });
    }

    effectBtnCheck(){
        $(document).ready(function(){
            var btn = $('.btnCheck');
            btn.click(function(){
                $(this).animate({fontSize: '25px'}, 100)
                        .animate({fontSize: '20px'}, 100);
            });
        });
    }

    effectTrashSmaller(){
        $(document).ready(function(){
            var trash = $('.trashBtn');
            trash.hover(above, out);
            function above(){
                $(this).animate({fontSize: '12px'}, 'fast');
            }
            function out(){
                $(this).animate({fontSize: '16px'}, 'fast');
            }
        });
    }


    onSubmit(form){
        this.submitedTask = true;
        this.loading = true;
        this._taskService.saveTask(this.task, this.token).subscribe(
            response => {
                if(response.task){
                    this.task = response.task;
                    this.loading = false;
                    this.submitedTask = true;
                    this.status = 'success';
                    this.alertMessage = 'Tarea creada con éxito';
                    this.task = new Task('',this.identity._id,'','','','');
                    this.socket.emit("save-task", response.task);
                    this.scrollDown(300);
                    this.getStats();
                } else {
                    this.submitedTask = true;
                    this.status = 'noResults';
                    this.errorMessage = response.message;
                    this.loading = false;
                    this.task = new Task('',this.identity._id,'','','','');
                }
            },
            error => {
                var err = <any>error;
                if(!err != null){
                    this.status = 'error';
                    this.submitedTask = true;
                    this.errorMessage = error.error.message;
                }
            }
        );
    }

    removeMessage(){
        this.submitedTask = false;
    }

    getTasks(){
        this.loading = true;
        this._taskService.getTasks(this.token).subscribe(
            response => {
                if(response.tasks){
                    this.tasks = response.tasks;
                    this.loading = false;
                }
            },
            error => {
                var err = <any>error;
                if(!err != null){
                    this.status = 'error';
                }
                this.loading = false;
            }
        );
    }

    getTaskFromSocket(){
        this.socket.on("new-task", function(data){
           if(this.identity._id == data.task.user){
                const newTask = {
                    _id: data.task._id,
                    user: data.task.user,
                    title: data.task.title,
                    content: data.task.content,
                    status: data.task.status,
                    created_at: data.task.created_at
                };
                this.tasks.push(newTask);
           }
        }.bind(this));
    }

    // Bajar el scroll en los mensajes 
    scrollDown(time){
        // Scroll down
        $(document).ready(function(){
            $("html, body").animate({ scrollTop: $("body").prop("scrollHeight")}, time);
        });
    }

    closeModal(){
        if(this.submitedTask){
            this.scrollDown(300);
        }
    }

    getStats(){
        this._userService.getStats().subscribe(
          response => {
            this.totalTasks = response.totalTasks;
            this.finishedTasks = response.finishedTasks;
            this.unfinishedTasks = response.unfinishedTasks;
            console.log(this.unfinishedTasks);
            this.socket.emit('save-stats', { totalTasks: this.totalTasks, finishedTasks: this.finishedTasks, unfinishedTasks: this.unfinishedTasks, user: this.task.user });
          },
          error => {
            let err = <any>error;
            if(err != null){
              console.log(err);
            }
          }
        );
    }

    // Eliminar una tarea
    deleteTask(id){
        this._taskService.deleteTask(this.token, id).subscribe(
            response => {
                if(response.task){
                    this.status = 'success';
                    this.getTasks();
                    this.getStats(); // Emitir el socket
                }
            },
            error => {
                let err = <any>error;
                if(err != null){
                    this.status = 'error';
                }
            }
        );
    }

    // Marcar una tarea como finalizada
    updateTask(id){
        this._taskService.finishedTask(this.token, id).subscribe(
            response => {
                console.log(response);
                this.getStats();
                this.getTasks();
            }
        );
    }

    // Marcar tarea como no finalizada
    unfinishedTask(id){
        this._taskService.unfinishedTask(this.token, id).subscribe(
            response => {
                console.log(response);
                this.getStats();
                this.getTasks();
            }
        );
    }

    backToForm(){
        this.submitedTask = null;
    }

    public modalEdit: any;
    showModal(id){
        this.modalEdit = id;
    }




}