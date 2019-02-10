import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ng7FileUploadComponent } from './ng7-file-upload.component';

describe('Ng7FileUploadComponent', () => {
  let component: Ng7FileUploadComponent;
  let fixture: ComponentFixture<Ng7FileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ng7FileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ng7FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
