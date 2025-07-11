import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PythonRunnerComponent } from '../../python-runner/python-runner.component';

@Component({
  selector: 'app-rl-code-example',
  standalone: true,
  imports: [CommonModule, PythonRunnerComponent],
  templateUrl: './rl-code-example.html',
  styleUrl: './rl-code-example.css'
})
export class RlCodeExampleComponent {
  qlearningTitle = 'Q-Learning';
}