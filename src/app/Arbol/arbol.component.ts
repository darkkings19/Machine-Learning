import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplicacionArbolComponent } from './explicacion/explicacion.component';
import { DiagramaArbolComponent } from './diagrama/diagrama.component';
import { EjemploArbolComponent } from './ejemplo/ejemplo.component';

@Component({
  selector: 'app-arbol',
  standalone: true,
  imports: [CommonModule, ExplicacionArbolComponent, DiagramaArbolComponent, EjemploArbolComponent],
  templateUrl: './arbol.component.html',
  styleUrl: './arbol.component.css'
})
export class ArbolComponent {
  activeTab: 'teoria' | 'diagrama' | 'ejemplo' = 'teoria';

  setActiveTab(tab: 'teoria' | 'diagrama' | 'ejemplo') {
    this.activeTab = tab;
  }
}
