import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TproductsComponent } from './tproducts.component';

describe('TproductsComponent', () => {
  let component: TproductsComponent;
  let fixture: ComponentFixture<TproductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TproductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TproductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
