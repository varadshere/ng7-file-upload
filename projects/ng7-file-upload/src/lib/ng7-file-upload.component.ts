import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ng7-file-upload',
  template: `
    <!-- copied from original component and customized -->
<div [ngClass]="'ui-fileupload ui-widget'" [ngStyle]="style" [class]="styleClass" *ngIf="mode === 'advanced'">
  <div #content [ngClass]="{'ui-fileupload-content ui-widget-content p-0':true}" (dragenter)="onDragEnter($event)"
    (dragleave)="onDragLeave($event)" (drop)="onDrop($event)">
    <div class="text-center file-upload-box-padding" *ngIf="!hasFiles()">
      <div>
        <div class="d-inline-block w-25">
          <img alt="SVG" id="file_upload_icon" src="assets/icons/File_Upload.svg" />
        </div>
      </div>
      <h5 class="heading_5 margin-bottom-10 question-text drag-drop-text">Drag & drop your files here</h5>
      <p class="break-word text-center text-size-align max-total-attachment">
        Max total attachment size is 15 MB
      </p>
      <p class="break-word" *ngIf="showAccepts">
        We accept {{accept}} formats.
      </p>
    </div>
    <!-- <p-progressBar [value]="progress" [showValue]="false" *ngIf="hasFiles()"></p-progressBar> -->
    <!-- <p-messages [value]="msgs"></p-messages> -->
    <div class="ui-fileupload-files w-100" *ngIf="hasFiles()">
      <div *ngIf="!fileTemplate">
        <div class="ui-fileupload-row d-flex flex-row align-items-center mx-0 p-2 break-word" [ngClass]="{ 'bg-light': isOdd }"
          *ngFor="let file of files; let i = index; let isOdd = odd">
          <div class="d-flex flex-row flex-sm-row align-items-center row mx-0 p-0 w-100">
            <div class="p-2" class="width-adjust">
              <img [src]="file.objectURL" *ngIf="isImage(file)" [width]="previewWidth" />
            </div>
            <div class="p-2 text-center">{{file.name}}</div>
            <div class="p-2 ">{{formatSize(file.size)}}</div>
          </div>
          <div class="p-2">
            <button type="button" class="custom-close-btn" (click)="remove($event,i)">
              <img alt="SVG" class="svg" src="assets/icons/close-button.svg" />
            </button>
          </div>
        </div>
      </div>
      <div *ngIf="fileTemplate">
        <ng-template ngFor [ngForOf]="files" [ngForTemplate]="fileTemplate"></ng-template>
      </div>
    </div>
    <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
  </div>
  <div class="ui-fileupload-buttonbar">
    <span class="ui-fileupload-choose btn btn-outline-primary">
      {{chooseLabel}}
      <input #advancedfileinput type="file" (change)="onFileSelect($event)" [multiple]="multiple" [accept]="accept"
        [disabled]="disabled" (focus)="onFocus()" (blur)="onBlur()">
    </span>
    <button *ngIf="!auto&&showUploadButton" type="button" class="ui-fileupload-choose btn btn-outline-primary" (click)="upload()"
      [disabled]="!hasFiles()">
      {{uploadLabel}}
      <i class="fa fa-upload"></i>
    </button>
    <button *ngIf="!auto&&showCancelButton" type="button" class="ui-fileupload-choose btn btn-outline-primary" (click)="clear()"
      [disabled]="!hasFiles()">
      {{cancelLabel}}
      <i class="fa fa-close"></i>
    </button>
    <ng-container *ngTemplateOutlet="toolbarTemplate"></ng-container>
  </div>
</div>
<span class="ui-button ui-fileupload-choose ui-widget ui-state-default ui-corner-all ui-button-text-icon-left" *ngIf="mode === 'basic'"
  (mouseup)="onSimpleUploaderClick($event)" [ngClass]="{'ui-fileupload-choose-selected': hasFiles(),'ui-state-focus': focus}">
  <span class="ui-button-icon-left fa" [ngClass]="{'fa-plus': !hasFiles()||auto, 'fa-upload': hasFiles()&&!auto}"></span>
  <span class="ui-button-text ui-clickable">{{auto ? chooseLabel : hasFiles() ? files[0].name : chooseLabel}}</span>
  <input #basicfileinput type="file" [accept]="accept" [multiple]="multiple" [disabled]="disabled" (change)="onFileSelect($event)"
    *ngIf="!hasFiles()" (focus)="onFocus()" (blur)="onBlur()">
</span>
  `,
  styles: []
})
export class Ng7FileUploadComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
