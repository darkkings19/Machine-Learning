import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DtDiagramComponent } from './dt-diagram/dt-diagram';
import { DtCodeExampleComponent } from './dt-code-example/dt-code-example';
import { DtTheoryComponent } from './dt-theory/dt-theory';

@Component({
  selector: 'app-decision-tree',
  standalone: true,
  imports: [CommonModule, DtDiagramComponent, DtCodeExampleComponent, DtTheoryComponent],
  templateUrl: './decision-tree.html',
  styleUrl: './decision-tree.css'
})
export class DecisionTreeComponent {
  activeTab: 'teoria' | 'diagrama' | 'ejemplo' = 'teoria';

  setActiveTab(tab: 'teoria' | 'diagrama' | 'ejemplo') {
    this.activeTab = tab;
  }
}
