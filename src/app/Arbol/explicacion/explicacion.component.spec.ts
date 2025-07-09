import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplicacionComponent } from './explicacion.component';

describe('ExplicacionComponent', () => {
  let component: ExplicacionComponent;
  let fixture: ComponentFixture<ExplicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
