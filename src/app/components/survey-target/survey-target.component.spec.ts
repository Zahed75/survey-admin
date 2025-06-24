import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyTargetComponent } from './survey-target.component';

describe('SurveyTargetComponent', () => {
  let component: SurveyTargetComponent;
  let fixture: ComponentFixture<SurveyTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyTargetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
