import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ReinforcementLearningComponent } from './components/reinforcement-learning/reinforcement-learning';
import { DecisionTreeComponent } from './components/decision-tree/decision-tree';
import { PythonRunnerComponent } from './components/python-runner/python-runner.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'arbol', component: DecisionTreeComponent},
    {path: 'AprendizajePorRefuerzo', component: ReinforcementLearningComponent},
    {path: 'python-runner', component: PythonRunnerComponent},
    {path: '**', redirectTo: '' }

];
