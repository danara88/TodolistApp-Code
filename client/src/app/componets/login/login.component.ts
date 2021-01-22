import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    providers: [UserService]
})

export class LoginComponent implements OnInit{
    public user: User;
    public loading: boolean;
    public status: string;
    public errorMessage: string;
    public identity: User;
    constructor(private _userService: UserService, private _router: Router, private _route: ActivatedRoute){
        this.user = new User('','','','','','',null);
        this.loading = false;
    }

    ngOnInit(){
        this.effectBiggerFont();
    }

    onSubmit(form){
        this.loading = true;
        this._userService.login(this.user).subscribe(
            response => {
                if(response.user){
                    let identity = response.user;
                    if(identity._id){
                        this.identity = response.user;
                        localStorage.setItem('identity', JSON.stringify(this.identity));
                        this.getToken();
                    }
                }
            },
            error => {
                let err = <any>error;
                if(err != null){
                    this.status = 'error';
                    this.errorMessage = error.error.message;
                }
                this.loading = false;
            }
        );
    }

    getToken(){
        this._userService.login(this.user, "true").subscribe(
            response => {
                if(response.token){
                    let token = response.token;
                    if(token.length <= 0){
                        this.status = 'error';
                    } else {
                        localStorage.setItem('token', token);
                        this.status = 'success';
                        this.loading = true;
                        this._router.navigate(['/']);
                    }
                }
            },
            error => {
                let err = <any>error;
                if(err != null){
                    this.status = 'error';
                }
                this.loading = false;
            }
        );
    }

    effectBiggerFont(){
        $(document).ready(function(){
            var inputs = $('#formRegister').find('input');
            inputs.each(function(){
              $(this).focus(function(){
                $(this).animate({fontSize: '21px'}, 70);
              });
              $(this).blur(function(){
                $(this).animate({fontSize: '18px'}, 70);
              });
            });
        });
    }

    closeAlert(){
        this.status = null;
    }

}