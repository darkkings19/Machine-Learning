import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramaArbolComponent } from './dt-diagram';

describe('DiagramaArbolComponent', () => {
  let component: DiagramaArbolComponent;
  let fixture: ComponentFixture<DiagramaArbolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagramaArbolComponent]  // Componente standalone se importa así
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagramaArbolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

