import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EjemploComponent } from './dt-code-example';

describe('EjemploComponent', () => {
  let component: EjemploComponent;
  let fixture: ComponentFixture<EjemploComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EjemploComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EjemploComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
