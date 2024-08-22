import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OpenMerchEntryAlertComponent } from './open-merch-entry-alert.component';

describe('OpenMerchEntryAlertComponent', () => {
  let component: OpenMerchEntryAlertComponent;
  let fixture: ComponentFixture<OpenMerchEntryAlertComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenMerchEntryAlertComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OpenMerchEntryAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
