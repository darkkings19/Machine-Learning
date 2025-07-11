import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RlTheoryComponent } from './rl-theory/rl-theory';
import { RlDiagramComponent } from './rl-diagram/rl-diagram';
import { RlCodeExampleComponent } from './rl-code-example/rl-code-example';

@Component({
  selector: 'app-reinforcement-learning',
  standalone: true,
  imports: [CommonModule, RlTheoryComponent, RlDiagramComponent, RlCodeExampleComponent],
  templateUrl: './reinforcement-learning.html',
  styleUrl: './reinforcement-learning.css'
})
export class ReinforcementLearningComponent {
  activeTab: 'teoria' | 'entorno' | 'codigo' = 'teoria';

  setActiveTab(tab: 'teoria' | 'entorno' | 'codigo') {
    this.activeTab = tab;
  }
}
