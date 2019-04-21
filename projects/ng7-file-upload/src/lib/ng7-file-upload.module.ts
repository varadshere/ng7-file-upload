import { NgModule } from '@angular/core';
import { Ng7FileUploadComponent } from './ng7-file-upload.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [Ng7FileUploadComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [Ng7FileUploadComponent]
})
export class Ng7FileUploadModule { }
