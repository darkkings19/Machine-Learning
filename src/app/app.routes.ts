import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AprendizajePorRefuerzoComponent } from './AprendizajePorRefuerzo/aprendizaje-por-refuerzo.component';
import { ArbolComponent } from './Arbol/arbol.component';
export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'arbol', component: ArbolComponent},
    {path: 'AprendizajePorRefuerzo', component: AprendizajePorRefuerzoComponent},
    {path: '**', redirectTo: '' }

];
