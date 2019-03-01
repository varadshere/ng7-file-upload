import {
  Component,
  OnInit,
  OnChanges,
  Input,
  ViewChild,
  ElementRef,
  TemplateRef,
  EventEmitter,
  Output,
  NgZone,
  AfterViewInit,
} from '@angular/core';
import { DomHandler } from './DomHandler';
import { Message, UploadDocument } from './Interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Observable, Observer } from 'rxjs';
@Component({
  selector: 'crux-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnChanges, OnInit, AfterViewInit {
  public dragHighlight: boolean;
  focus: boolean;

  @ViewChild('content') content: ElementRef;

  @Input() formControl = new FormControl();

  @Input() chooseLabel: string;

  @Input() maxFiles: number = 15;

  @Input() totalFilesize: number;

  @Input() showAccepts: boolean;

  @Input() accept: string;

  @Input() uploadLabel: string = 'Upload';

  @Input() cancelLabel: string = 'Cancel';

  @Input() showUploadButton: boolean = false;

  @Input() showCancelButton: boolean = false;

  @Input() name: string;

  @Input() url: string;

  @Input() method: string = 'POST';

  @Input() multiple: boolean = true;

  @Input() autoUpload: boolean = false;

  @Input() withCredentials: boolean;

  @Input() maxFileSize: number;

  @Input() invalidFileSizeMessageSummary: string = '{0}: Invalid file size, ';

  @Input() invalidFileSizeMessageDetail: string = 'maximum upload size is {0}.';

  @Input() invalidFileTypeMessageSummary: string = '{0}: Invalid file type. ';

  @Input() invalidFileTypeMessageDetail: string = 'allowed file types: {0}.';

  @Input() maxFilesMessageDetail: string = 'Number of allowed files: {0}.';

  @Input() style: any;

  @Input() styleClass: string;

  @Input() previewWidth: number = 50;

  @Input() customUpload: boolean;

  @Output() onBeforeUpload: EventEmitter<any> = new EventEmitter();

  @Output() onBeforeSend: EventEmitter<any> = new EventEmitter();

  @Output() onUpload: EventEmitter<any> = new EventEmitter();

  @Output() onError: EventEmitter<any> = new EventEmitter();

  @Output() onClear: EventEmitter<any> = new EventEmitter();

  @Output() onRemove: EventEmitter<any> = new EventEmitter();

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  @Output() onProgress: EventEmitter<any> = new EventEmitter();

  @Output() uploadHandler: EventEmitter<any> = new EventEmitter();

  @ViewChild('advancedfileinput') advancedFileInput: ElementRef;

  @Input() files: File[] = [];

  @Input() base64Upload: Boolean = false;

  @Input() imagePreviewIcon: string = 'assets/icons/img-preview.svg';

  @Input() docPreviewIcon: string = 'assets/icons/attach.svg';

  @Input() closeBtnIcon: string = 'assets/icons/close-button.svg';

  @Input() uploadCompleteIcon: string = 'assets/icons/upload-completed.svg';

  @Input() progressBarColor: string = '#156090';

  public msgs: Message[];

  public progress: number = 0;

  public fileTemplate: TemplateRef<any>;

  public contentTemplate: TemplateRef<any>;

  public toolbarTemplate: TemplateRef<any>;

  duplicateIEEvent: boolean; // flag to recognize duplicate onchange event for file input

  constructor(
    public sanitizer: DomSanitizer,
    public zone: NgZone,
    private http: HttpClient
  ) { }

  ngOnInit() { }

  ngOnChanges(changes) { }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.content.nativeElement.addEventListener(
        'dragover',
        this.onDragOver.bind(this)
      );
    });
  }

  isIE11() {
    return !!window['MSInputMethodContext'] && !!document['documentMode'];
  }

  isFileSelected(file: File): boolean {
    for (let sFile of this.files) {
      if (
        sFile.name + sFile.type + sFile.size ===
        file.name + file.type + file.size
      ) {
        return true;
      }
    }

    return false;
  }

  isImage(file: File): boolean {
    return /^image\//.test(file.type);
  }

  onFileSelect(event) {
    if (event.type !== 'drop' && this.isIE11() && this.duplicateIEEvent) {
      this.duplicateIEEvent = false;
      return;
    }

    this.msgs = [];
    if (!this.multiple) {
      this.files = [];
    }

    let files: FileList = event.dataTransfer
      ? event.dataTransfer.files
      : event.target.files;

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      if (this.files.length < this.maxFiles) {
        if (!this.isFileSelected(file)) {
          if (this.validateFile(file)) {
            // if (this.isImage(file)) {
            //   file.objectURL = this.sanitizer.bypassSecurityTrustUrl(
            //     window.URL.createObjectURL(files[i])
            //   );
            // }
            this.files.push(files[i]);
          }
        }
      } else {
        this.msgs.push({
          severity: 'error',
          // summary: `Only ${this.maxFiles} files are allowed to select.`,
          // detail: 'Maximum allowed number of files exceeded.',
          summary: this.maxFilesMessageDetail.replace(
            '{0}',
            this.maxFiles.toString()
          ),
          detail: this.invalidFileTypeMessageDetail.replace(
            '{0}',
            this.maxFiles.toString()
          ),
        });
        break;
      }
    }

    this.onSelect.emit({ originalEvent: event, files: files });

    if (this.hasFiles() && this.autoUpload) {
      this.uploadDocument(Array.from(files));
    }

    if (event.type !== 'drop' && this.isIE11()) {
      this.clearIEInput();
    } else {
      this.clearInputElement();
    }
  }
  upload() {
    if (this.hasFiles()) {
      this.uploadDocument(this.files);
    }
  }
  validateFile(file: File): boolean {
    if (this.accept && !this.isFileTypeValid(file)) {
      this.msgs.push({
        severity: 'error',
        summary: this.invalidFileTypeMessageSummary.replace('{0}', file.name),
        detail: this.invalidFileTypeMessageDetail.replace('{0}', this.accept),
      });
      return false;
    }

    if (this.maxFileSize && file.size > this.maxFileSize) {
      this.msgs.push({
        severity: 'error',
        summary: this.invalidFileSizeMessageSummary.replace('{0}', file.name),
        detail: this.invalidFileSizeMessageDetail.replace(
          '{0}',
          this.formatSize(this.maxFileSize)
        ),
      });
      return false;
    }
    return true;
  }

  setFromControlError(msgs: Array<Message>) {
    this.formControl.setErrors({ error: msgs });
  }
  clearInputElement() {
    if (this.advancedFileInput && this.advancedFileInput.nativeElement) {
      this.advancedFileInput.nativeElement.value = '';
    }
  }

  clearIEInput() {
    if (this.advancedFileInput && this.advancedFileInput.nativeElement) {
      this.duplicateIEEvent = true; //IE11 fix to prevent onFileChange trigger again
      this.advancedFileInput.nativeElement.value = '';
    }
  }

  remove(event: Event, index: number) {
    this.clearInputElement();
    this.onRemove.emit({ originalEvent: event, file: this.files[index] });
    this.files.splice(index, 1);
  }

  clear() {
    this.files = [];
    this.onClear.emit();
    this.clearInputElement();
  }

  formatSize(bytes) {
    if (bytes == 0) {
      return '0 B';
    }
    let k = 1000,
      dm = 3,
      sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  private isFileTypeValid(file: File): boolean {
    let acceptableTypes = this.accept.split(',').map((type) => type.trim());
    for (let type of acceptableTypes) {
      let acceptable = this.isWildcard(type)
        ? this.getTypeClass(file.type) === this.getTypeClass(type)
        : file.type == type ||
        this.getFileExtension(file).toLowerCase() === type.toLowerCase();

      if (acceptable) {
        return true;
      }
    }

    return false;
  }

  getFileExtension(file: File): string {
    return '.' + file.name.split('.').pop();
  }

  getTypeClass(fileType: string): string {
    return fileType.substring(0, fileType.indexOf('/'));
  }

  isWildcard(fileType: string): boolean {
    return fileType.indexOf('*') !== -1;
  }

  hasFiles(): boolean {
    console.log('files length::', this.files.length);
    return this.files && this.files.length > 0;
  }

  onFocus() {
    this.focus = true;
  }

  onBlur() {
    this.focus = false;
  }

  onDragEnter(e) {
    if (!this.formControl.disabled) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  onDragOver(e) {
    if (!this.formControl.disabled) {
      DomHandler.addClass(
        this.content.nativeElement,
        'ui-fileupload-highlight'
      );
      this.dragHighlight = true;
      e.stopPropagation();
      e.preventDefault();
    }
  }

  onDragLeave(event) {
    if (!this.formControl.disabled) {
      DomHandler.removeClass(
        this.content.nativeElement,
        'ui-fileupload-highlight'
      );
    }
  }

  onDrop(event) {
    if (!this.formControl.disabled) {
      DomHandler.removeClass(
        this.content.nativeElement,
        'ui-fileupload-highlight'
      );
      event.stopPropagation();
      event.preventDefault();

      let files = event.dataTransfer
        ? event.dataTransfer.files
        : event.target.files;
      let allowDrop = this.multiple || (files && files.length === 1);

      if (allowDrop) {
        this.onFileSelect(event);
      }
    }
  }

  async uploadDocument(selectedFiles: File[]) {
    let filesObservables: Array<Observable<any>> = [];
    if (this.base64Upload) {
      const fileTransformationResult = await this.toBase64(selectedFiles);
      fileTransformationResult.AttachmentList.forEach((obj) => {
        console.log('file= ', obj.file);
        if (!obj.file.uploaded) {
          filesObservables.push(this.uploadFileBase64(obj.attachment, obj.file));
        }
      });
    } else {
      // const selectedfilesArray = Array.from(selectedFiles);
      selectedFiles.forEach((selectedFile: any) => {
        if (!selectedFile.uploaded) {
          filesObservables.push(this.uploadFileMultipart(selectedFile));
        }
      });

    }
    forkJoin(filesObservables).subscribe(
      () => {
        console.log("Fork Join Rsp");
      },
      (e) => {
        console.log("Fork Join Error", e);
      }
    );
  }

  toBase64(fileList: File[]): Promise<UploadDocument> {
    // const files = Array.from(fileList);
    let doc: UploadDocument = new UploadDocument();
    doc.AttachmentList = [];
    let filePromises: Array<Promise<any>> = [];
    fileList.forEach((file) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);

      let filePromise = new Promise((resolve, reject) => {
        reader.onload = (event: Event) => {
          if (!reader.result) resolve();

          let fileResults = reader.result.toString().split(';base64,');
          let arrayObj = {
            attachment: {
              fileName: file.name,
              mimeType: fileResults[0].replace('data:', ''),
              fileContent: fileResults[1]
            },
            file: file
          };
          doc.AttachmentList.push(arrayObj);
          resolve();
        };
      });

      filePromises.push(filePromise);
    });

    let allPromises = new Promise<UploadDocument>((resolve, reject) => {
      Promise.all(filePromises).then((results) => {
        resolve(doc);
      });
    });
    return allPromises;
  }

  docHeader = new HttpHeaders({
    'content-type': 'text/plain',
  });

  getUploadProgress(event: HttpEvent<any>, file) {
    switch (event.type) {
      case HttpEventType.Sent:
        this.onBeforeSend.emit({
          file: file,
        });
        break;
      case HttpEventType.Response:
        if (event['status'] >= 200 && event['status'] < 300) {
          this.onUpload.emit({ files: file });
        } else {
          this.onError.emit({ files: file });
        }
        break;
      case 1: {
        if (event['loaded']) {
          file.progress = Math.round(
            (event['loaded'] * 100) / event['total']
          );
          if (file.progress === 100) {
            file.uploaded = true;
          }
          console.log('Upload Progress::', file.progress);
        }

        this.onProgress.emit({
          originalEvent: event,
          progress: file.progress,
          file: file,
        });
        break;
      }
    }
  }
  uploadFileBase64(payload, file): Observable<any> {
    return Observable.create((observer: Observer<string>) => {
      this.http.post(
        this.url,
        {
          body: payload,
          headers: this.docHeader,
        },
        {
          reportProgress: true,
          observe: 'events',
        }
      ).subscribe(
        (event: HttpEvent<any>) => {
          this.getUploadProgress(event, file);
          if (event.type === HttpEventType.Sent) {
            observer.next('Done');
            observer.complete();
          }
        },
        (err) => {
          console.log(err);
          observer.error(err);
        }
      );
    });
  }
  uploadFileMultipart(file: File): Observable<any> {
    return Observable.create((observer: Observer<string>) => {
      let formData = new FormData();
      formData.append(file.name, file, file.name);
      this.http
        .post(this.url, formData, {
          reportProgress: true,
          observe: 'events',
        })
        .subscribe(
          (event: HttpEvent<any>) => {
            this.getUploadProgress(event, file);
            if (event.type === HttpEventType.Sent) {
              observer.next('Done');
              observer.complete();
            }
          },
          (err) => {
            console.log('ERROR', file);
            this.onError.emit({ files: this.files, error: err });
            observer.error(err);
          }
        );
    });
  }
}
