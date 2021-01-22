import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
declare var $: any;

@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    providers: [ UserService ]
})

export class RegisterComponent implements OnInit{
    public user: User;
    public loading: boolean;
    public status: string;
    public errorMessage: string;
    constructor( 
        private _userService: UserService
    ){
        this.user = new User('','','','','','', null);
        this.loading = false;
    }
    ngOnInit(){
        this.effectBiggerFont();
    }

    onSubmit(form){
        this.loading = true;
        this._userService.register(this.user).subscribe(
            response => {
                if(response.user){
                    this.user = response.user;
                    this.status = 'success';
                    this.loading = false;
                    this.user = new User('','','','','','', null);
                    form.reset();
                }
            },
            error => {
                let err = <any>error;
                if(err != null){
                    this.status = 'error';
                    this.errorMessage = error.error.message;
                    this.user.password = '';
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
