import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprendizajePorRefuerzoComponent } from './reinforcement-learning';

describe('AprendizajePorRefuerzoComponent', () => {
  let component: AprendizajePorRefuerzoComponent;
  let fixture: ComponentFixture<AprendizajePorRefuerzoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprendizajePorRefuerzoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprendizajePorRefuerzoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
