import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FragmentoCodigoComponent } from './rl-code-example';

describe('FragmentoCodigoComponent', () => {
  let component: FragmentoCodigoComponent;
  let fixture: ComponentFixture<FragmentoCodigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FragmentoCodigoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FragmentoCodigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
