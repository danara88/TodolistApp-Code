import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserGuard } from './services/user.guard';

/** COMPONENTES */
import { RegisterComponent } from './componets/register/register.component'
import { LoginComponent } from './componets/login/login.component';
import { HomeComponent } from './componets/home/home.component';

/** CREAR SISTEMA DE RUTAS */
const appRoutes: Routes = [
    {path: '', component: HomeComponent, canActivate:[UserGuard]},
    {path: 'iniciar-sesion', component: LoginComponent},
    {path: 'registro', component: RegisterComponent},
    {path: '**', component: HomeComponent, canActivate:[UserGuard]}
];


/** EXPORTAR CONSTANTES */
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);