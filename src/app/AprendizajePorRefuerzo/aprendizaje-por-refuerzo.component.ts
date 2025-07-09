import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplicacionComponent } from './explicacion/explicacion.component';
import { EntornoComponent } from './entorno/entorno.component';
import { FragmentoCodigoComponent } from './fragmento-codigo/fragmento-codigo.component';

@Component({
  selector: 'app-aprendizaje-por-refuerzo',
  standalone: true,
  imports: [CommonModule, ExplicacionComponent, EntornoComponent, FragmentoCodigoComponent],
  templateUrl: './aprendizaje-por-refuerzo.component.html',
  styleUrl: './aprendizaje-por-refuerzo.component.css'
})
export class AprendizajePorRefuerzoComponent {
  activeTab: 'teoria' | 'entorno' | 'codigo' = 'teoria';

  setActiveTab(tab: 'teoria' | 'entorno' | 'codigo') {
    this.activeTab = tab;
  }
}
