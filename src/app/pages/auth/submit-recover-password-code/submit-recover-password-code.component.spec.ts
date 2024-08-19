import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SubmitRecoverPasswordCodeComponent } from './submit-recover-password-code.component';

describe('SubmitRecoverPasswordCodeComponent', () => {
  let component: SubmitRecoverPasswordCodeComponent;
  let fixture: ComponentFixture<SubmitRecoverPasswordCodeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitRecoverPasswordCodeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitRecoverPasswordCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
