import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntornoComponent } from './entorno.component';

describe('EntornoComponent', () => {
  let component: EntornoComponent;
  let fixture: ComponentFixture<EntornoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntornoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntornoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
