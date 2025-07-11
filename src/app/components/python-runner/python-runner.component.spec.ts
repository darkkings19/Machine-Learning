import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PythonRunnerComponent } from './python-runner.component';

describe('PythonRunnerComponent', () => {
  let component: PythonRunnerComponent;
  let fixture: ComponentFixture<PythonRunnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PythonRunnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PythonRunnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with decision tree example code', () => {
    expect(component.userCode).toContain('class DecisionNode:');
    expect(component.userCode).toContain('Temperatura');
  });

  it('should handle empty code execution', async () => {
    component.userCode = '';
    await component.runPythonCode('');
    expect(component.output).toContain('Por favor, introduce código Python');
  });

  it('should clear output when clearOutput is called', () => {
    component.output = 'Some output';
    component.clearOutput();
    expect(component.output).toBe('');
  });
});
