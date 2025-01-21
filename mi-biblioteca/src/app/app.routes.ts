import { Routes } from '@angular/router';
import { BaseComponent } from './base/base.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { LibroComponent } from './components/libro/libro.component';
import { AutorComponent } from './components/autor/autor.component';
import { PrestamoComponent } from './components/prestamo/prestamo.component';

export const routes: Routes = [
    //{path:'',pathMatch:'full',redirectTo:'inicio'},
    {path:'inicio',component:BaseComponent},
    {path:'usuario',component:UsuarioComponent},
    {path:'libro',component:LibroComponent},
    {path:'autor',component:AutorComponent},
    {path:'prestamo',component:PrestamoComponent}
];
