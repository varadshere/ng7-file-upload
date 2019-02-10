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
} from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { sum, map } from 'lodash-es';
import { DomHandler } from './DomHandler';
import { Message } from './Message';
import { DomSanitizer } from '@angular/platform-browser';
export function createFileValidator(validators) {
  return function validateFiles(c: FormControl) {
    if (!c.value) return null;

    let errors: {
      [key: string]: any;
    } = {};

    if (validators.msgs && validators.msgs.length)
      errors.msgs = validators.msgs;

    if (validators.maxFiles && c.value.length > +validators.maxFiles)
      errors.maxFiles = `A maximum of ${
        validators.maxFiles
      } files may be uploaded at the same time.`;

    if (
      validators.totalFilesize &&
      sum(map(c.value, 'size')) > validators.totalFilesize
    )
      errors.totalFilesize = `A total of ${validators.totalFilesize /
        (1024 * 1024)}MB may be uploaded at the same time.`;

    if (this.msgs) {
      this.msgs.map((err) => (errors.msgs = err.summary + err.detail));
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };
}

@Component({
  selector: 'crux-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnChanges {
  // constructor() {
  //   super();
  // }

  private changed = (_: any) => {};
  private touched = () => {};
  private validateFn: Function = () => {};
  public dragHighlight: boolean;
  focus: boolean;
  @ViewChild('content') content: ElementRef;

  @Input() name: string;

  @Input() url: string;

  @Input() method: string = 'POST';

  @Input() multiple: boolean = true;

  @Input() disabled: boolean;

  @Input() auto: boolean = false;

  @Input() withCredentials: boolean;

  @Input() maxFileSize: number;

  @Input() invalidFileSizeMessageSummary: string = '{0}: Invalid file size, ';

  @Input() invalidFileSizeMessageDetail: string = 'maximum upload size is {0}.';

  @Input() invalidFileTypeMessageSummary: string = '{0}: Invalid file type, ';

  @Input() invalidFileTypeMessageDetail: string = 'allowed file types: {0}.';

  @Input() style: any;

  @Input() styleClass: string;

  @Input() previewWidth: number = 50;

  @Input() uploadLabel: string = 'Upload';

  @Input() cancelLabel: string = 'Cancel';

  @Input() showUploadButton: boolean = true;

  @Input() showCancelButton: boolean = true;

  @Input() mode: string = 'advanced';

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

  @ViewChild('basicfileinput') basicFileInput: ElementRef;

  @Input() files: File[] = [];

  public msgs: Message[];

  public progress: number = 0;

  public fileTemplate: TemplateRef<any>;

  public contentTemplate: TemplateRef<any>;

  public toolbarTemplate: TemplateRef<any>;

  uploading: boolean;

  duplicateIEEvent: boolean; // flag to recognize duplicate onchange event for file input

  @Input() chooseLabel: string = 'Browse for file';
  @Input() maxFiles: number;
  @Input() totalFilesize: number;
  @Input() showAccepts: boolean = false;
  @Input()
  accept: string =
    '.pdf,.doc,.docx,.xls,.xlsx,.csv,.mdb,.htm,.html,.mht,.jnt,.dds,image/*';

  constructor(public sanitizer: DomSanitizer) {}
  ngOnChanges(changes) {
    if (changes.msgs || changes.maxFiles || changes.totalFilesize) {
      this.validateFn = createFileValidator({
        msgs: this.msgs,
        maxFiles: this.maxFiles,
        totalFilesize: this.totalFilesize,
      });
    }
  }

  writeValue(value: Array<File>) {
    this.files = value || [];
  }

  registerOnChange(fn) {
    this.changed = fn;
  }

  registerOnTouched(fn) {
    this.touched = fn;
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

    let files = event.dataTransfer
      ? event.dataTransfer.files
      : event.target.files;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      if (!this.isFileSelected(file)) {
        if (this.validate(file)) {
          if (this.isImage(file)) {
            file.objectURL = this.sanitizer.bypassSecurityTrustUrl(
              window.URL.createObjectURL(files[i])
            );
          }

          this.files.push(files[i]);
        }
      }
    }

    this.onSelect.emit({ originalEvent: event, files: files });

    if (this.hasFiles() && this.auto) {
      // this.upload();
    }

    if (event.type !== 'drop' && this.isIE11()) {
      this.clearIEInput();
    } else {
      this.clearInputElement();
    }
  }

  validate(file: File): boolean {
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

  clearInputElement() {
    if (this.advancedFileInput && this.advancedFileInput.nativeElement) {
      this.advancedFileInput.nativeElement.value = '';
    }

    if (this.basicFileInput && this.basicFileInput.nativeElement) {
      this.basicFileInput.nativeElement.value = '';
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
    return this.files && this.files.length > 0;
  }
  onFocus() {
    this.focus = true;
  }
  onBlur() {
    this.focus = false;
  }
  onDragEnter(e) {
    if (!this.disabled) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  onDragOver(e) {
    if (!this.disabled) {
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
    if (!this.disabled) {
      DomHandler.removeClass(
        this.content.nativeElement,
        'ui-fileupload-highlight'
      );
    }
  }
}
