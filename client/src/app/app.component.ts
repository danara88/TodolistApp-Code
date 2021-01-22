import { Component, OnInit, DoCheck } from '@angular/core';
import { UserService } from './services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Global } from './services/global';
import * as io from 'socket.io-client';

declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ UserService ]
})
export class AppComponent implements OnInit, DoCheck{
  public title: string;
  public identity: any;
  public token: string;
  public totalTasks: any;
  public finishedTasks: any;
  public unfinishedTasks: any;
  public socket: any;
  public io: any;
  public showConfig: boolean;
  public url: string;
  constructor(
    private _userService: UserService,
    private _router: Router, 
    private _route: ActivatedRoute
  ){
    this.title = 'Enlistalo';
    this.socket = io('http://localhost:3700/');
    this.url = Global.url;
  }

  ngOnInit(){
    this.updateStatsSocket();
    this.effectBiggerFont();
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.getStats();
  }

  ngDoCheck(){
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  // CERRAR SESIÓN
  logout(){
    localStorage.clear();
    this.identity = null;
    this.token = null;
    this._router.navigate(['/iniciar-sesion']);
  }

  effectBiggerFont(){
    $(document).ready(function(){
        var btn = $('#btnPublicity');
        
        btn.hover(bigger, smaller);
        btn.click(clickSmaller);
          function bigger(){
            $(this).animate({fontSize: '21px'}, 70);
          }
          function smaller(){
            $(this).animate({fontSize: '16px'}, 70);
          }
          function clickSmaller(){
            $(this).animate({fontSize: '16px'}, 70);
          }
    });
  }

  // OBETENER DATOS POR SOCKET
  updateStatsSocket(){
    this.socket.on('new-stats', function(data){
      var userId = data.stats.user;
      if(userId == this.identity._id){
        // Actulizar las estadisticas del usuario
        this.unfinishedTasks = data.stats.unfinishedTasks;
        this.finishedTasks = data.stats.finishedTasks;
        this.totalTasks = data.stats.totalTasks;
      } else {
        this.getStats();
      }
    }.bind(this));
  }

  // OBTENER LAS ESTADISTICAS DEL USUARIO IDENTIFICADO
  getStats(){
    this._userService.getStats().subscribe(
      response => {
        this.totalTasks = response.totalTasks;
        this.finishedTasks = response.finishedTasks;
        this.unfinishedTasks = response.unfinishedTasks;
      },
      error => {
        let err = <any>error;
        if(err != null){
          console.log(err);
        }
      }
    );
  }

  selectConfig(){
    this.showConfig = true;
}
  hideConfig(){
    this.showConfig = null;
  }

 
}
