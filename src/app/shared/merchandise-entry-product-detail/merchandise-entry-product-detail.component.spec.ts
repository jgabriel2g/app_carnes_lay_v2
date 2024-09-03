import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MerchandiseEntryProductDetailComponent } from './merchandise-entry-product-detail.component';

describe('MerchandiseEntryProductDetailComponent', () => {
  let component: MerchandiseEntryProductDetailComponent;
  let fixture: ComponentFixture<MerchandiseEntryProductDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchandiseEntryProductDetailComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MerchandiseEntryProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
