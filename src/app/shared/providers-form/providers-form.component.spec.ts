import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProvidersFormComponent } from './providers-form.component';

describe('ProvidersFormComponent', () => {
  let component: ProvidersFormComponent;
  let fixture: ComponentFixture<ProvidersFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProvidersFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProvidersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
