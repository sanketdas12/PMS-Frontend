import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bulk } from './bulk';

describe('Bulk', () => {
  let component: Bulk;
  let fixture: ComponentFixture<Bulk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bulk],
    }).compileComponents();

    fixture = TestBed.createComponent(Bulk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
