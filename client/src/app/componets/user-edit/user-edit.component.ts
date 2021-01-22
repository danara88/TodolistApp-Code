import { Component, OnInit, DoCheck } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';
import { Global } from '../../services/global';

@Component({
    selector: 'user-edit',
    templateUrl: './user-edit.component.html',
    providers: [ UserService, UploadService ]
})

export class UserEditComponent implements OnInit, DoCheck {
    public title: string;
    public user: User;
    public identity: any;
    public token: string;
    public loading: boolean;
    public status: string;
    public url: string;
    constructor(
        private _userService: UserService,
        private _uploadService: UploadService
    ){
        this.title = 'Editar información';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.loading = false;
        this.user = this.identity;
        this.url = Global.url;
    }
    ngOnInit(){
    }

    ngDoCheck(){
        this.token = this._userService.getToken();
    }

    onSubmit(){
        this.loading = true;
        this._userService.updateUser(this.user, this.token).subscribe(
            response => {
                if(response.user){
                    this.status = 'success';
                    this.user = response.user;
                    this.loading = false;
                    localStorage.setItem('identity', JSON.stringify(this.user));
                    console.log(this.token);
                    if(this.filesToUpload){
                        this._uploadService.makeFileRequest(this.url + 'upload-image-user/' + this.identity._id, [],this.filesToUpload, this.token, 'image')
                            .then((result: any) => {
                                this.user.image = result.user.image;
                                localStorage.setItem('identity', JSON.stringify(this.user));
                                var image = document.getElementById('imageUser');
                               // image.setAttribute("src", this.url + 'get-image-user/' + this.identity.image);
                        });
                    } else {
                        
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

    public filesToUpload: Array<File>;
    fileChange(fileInput: any){
        this.filesToUpload = <Array<File>>fileInput.target.files;
    }
}