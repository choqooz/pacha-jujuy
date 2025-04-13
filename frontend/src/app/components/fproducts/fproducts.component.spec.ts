import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FproductsComponent } from './fproducts.component';

describe('FproductsComponent', () => {
  let component: FproductsComponent;
  let fixture: ComponentFixture<FproductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FproductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FproductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
