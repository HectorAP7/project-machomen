import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pasarela } from './pasarela';

describe('Pasarela', () => {
  let component: Pasarela;
  let fixture: ComponentFixture<Pasarela>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pasarela]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pasarela);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
