import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailsComponent } from './emails.component';

describe('EmailsComponent', () => {
  let component: EmailsComponent;
  let fixture: ComponentFixture<EmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
