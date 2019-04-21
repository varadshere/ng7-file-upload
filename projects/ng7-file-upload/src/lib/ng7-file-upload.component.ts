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
import { UploadDocument } from './class/upload-document.dto';
import { Message } from './interface/message.interface';
@Component({
  selector: 'ng7-file-upload',
  templateUrl: './ng7-file-upload.component.html',
  styleUrls: ['./ng7-file-upload.component.scss'],
})
export class Ng7FileUploadComponent implements OnChanges, OnInit, AfterViewInit {
  public dragHighlight: boolean;
  focus: boolean;

  @ViewChild('content') content: ElementRef;

  @Input() formControl = new FormControl();

  @Input() chooseLabel: string;

  @Input() maxFiles: number = 15;

  @Input() showAccepts: boolean;

  @Input() accept: string;

  @Input() uploadBtnLabel: string = 'Upload';

  @Input() cancelBtnLabel: string = 'Cancel';

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

  @Input() uploadIcon = 'data:image/png;base64,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';

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

  @Input() imagePreviewIcon: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADhAAAA4QBAwW54QAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAqySURBVHja7Z17cFTVHcdRaetoR6fttE47Q4fqOGpty9SpbRW1BcViFahYqMpDA5ViQXTUAWEAEYoUKgEJIEgDBBLeISHvmIRNsnnsgzw2+8hudpNNNu/3k3baKr/+TnrTSeLm3s3uvXfv3fv74zOTZCa5957v557f3XPOPZkCAFMI7UKNQAJQI5AABAlAkAAECUCQAAQJQISHptbWryAzkZeR1cjTyC0kQGSH/kPkTSQVGURgHO3IqyRA5AT+XWQZEoc0+wl8InaSAOoM/OvIs8g+xDaJwP3xUxJA+YHfgjyCbEEKkX+HGPpoEkkAZYZ+H7IGSUb6RAx8PP9EbiUBwh/4d5CXkOOIT8LA/TGHBJA/8NuQ3yAfIZXIDZlDH80eEkD6wG9GHkY2IVeRf4Ux8PFUkADShH4PN/hyCemRI0xfSyvk2T2QYHJAPOL0NQXye6z3+TYJEHrg30IWI58iXrnuYENNPRwstMCrF/Tw45gMmL435f/cuy8VdueVB/J3XiQBJh/4rchTyG6kTK46bq9vhDiDHd5ILoVHjmSPCXwiApAglgQQDvwm5CFkA5LDfYSSPPDapma4XO6ETRkmmHM8F34QQODjefBAOjgaGvmO4yMB/Ic+HXkNOY90yVXHc2we+DC3HBbG5w9349ODCH08x4qtQse+T/MCYCN8A3kB+QTxyFfHvRCDdfwVP3VcLFYlFgudx1rNCYAX/VVkFpsYQUzIF3IEbsM6fhLr+Fqs4788kiVJ4ON56FCm0HldiXgBuDo+A3kHyUKuyxG4p7EZErGOv4d1/Kkg67gYFFTX8p3nADI14gTAi5qGRCFnuLlwGep4C3yGdXxnbhk8H68TrY6Hyke6CqFzn6l6AfAi7kQWIAcRp1x1vJSr48uxjv8oJl0RgY/nD2cKhK5jm+oE4JY9PY5sR0qQz+UI3Or1DdfxNckl8PNPshQZ+Hju/zgNvM0tfNdVrAoB8EQfRN5C0iZY9iRdHU83wZOx4avjoZJS6eK7zv8gdyhOADyp7yHLkVNIi1x1PNvqhp05ZfC708qp46GyJcssdO0Lwi4At+zpOWQ/Yperjpe4vHCgwALLzmMdP6DMOh4qc0/kCbXDQdkFYB8/kEeRrYhe5GVPE1KFdfxEqQ3+nKSeOh4qd0enCA0Lu2QRAA90Pxt9YgMQSL9cdfximRM2pBuxjudoInB/nDbahdrq+6ILgH/0Lu4FhRNIYyCBNSOtHR3Q0dUFnd3dk4b9ns3XAll2L8Qaq2HnVQvsyCMSKz287dbT23tpcHDwPQHWIDOR2ycUAEO8l1v2ZJnsdGl7ZycMDAwAHoBQNn3I0jECcHPlp4MdW2cWUsOqjh3DAnDj7eeCrdOt7e3UmOrkc+QXTIBFoTyodff2UmOql7NTuKf6oAXo7++nhlQv7inBzLhZ6nwQW2KD1ZdLYIAaUc3cYALUBhI6m5Q4rK/60udxakR1M4WbkeMNvx7DX5SQ73eQItAD9fR2QIPPAHU1yVBbkygqbncmlHUMaZ5yxNU9BJ39kxNgl5AAu3LLJxylCuQg9Q1F0GF8HXpLl0tCm3EtnK6/TnCcabgOFShDoALMFhKAbxhW6ADNrXboMURJFj6j27CSgveDo2soIAG+hvyDTwC+iRfBu9/yN0nDHyHeO0ihj+OS77qwANxIYBafAGxKMlgB2o1rJA+/w7iaAp8AoeeBEQHe5ROAraoJVgA57n6feQOFPQFNvYEJMINPALa0SskC1JTvorBDFOAmvgEhNi8/0RIrJQhgtRyisEMRgJPgDF8vwN57U6oAJfYrFLYIAkQFMxagBAEue7wUtggCTOMTINfuUaQAjeb1FLQYAnASOPleg/6Jnzdhwy3AtaoEClpEAWL4eoGoi0WKEyDF7aSgRRRgPp8AbDZQSQI4KvZRyCILcAf3upFfAczuesUIwOYXkmrrKGQxBeAkKObrBWYezVaEAJWWv1PAEgmwjU+At1IMYReATf9eqGujgCUS4DE+AdimhuEUoMuwAlLdNgpXQgGmctuP+BXA2dAEd0enhk0AXfVVClZKATgJUvh6gd+ezAuLAGZrPIUqkwDr+AR4P/uarAL0lL4CJbZkClRGAR7gEyDNUiObAJ2GVZDtMlKYcgrASdDEt0qY7V8jtQAN5o2Q5PFQkGES4CRfL/DS2QLJBGg1vokPe3kQXz9EIYZRgCV8AkTrKkUXoNW0DkptSZDg7aPwFCDAXXwC6J11ogjA1vOZrWchtcaBJ0x3vGIE4CSo4pPgZ4czBQXIr86FYvsVDDkBTBh0oSMTclwlw4FfqGulkBQuwF4+AdjLoUICUAjqFmAunwCxpTYSIMIFuI3vP2axbdtIgAgWgJNAx9cLkACRL8AmEkDbAjxMAmhbgJv5/pEiCRDhAnASXCIBtC3An0gAbQtwDwmgYQE4CepIAG0LcJQE0LYAi0gAbQvwTX+7iZMAwXGirh8+re2Gg+522O9qht3OBtjp8MD7NidsQ9jXe/Bn+2ua4ZCnA47V9kJcEBthiSYAJ4GZBAiMOO8QxNS0ww67G96uKIcVJh0sLsmEhUUp8Jz+MjxbmBgU8/XJ8PviNHi5NBteM+thvaUSPnTUwmGUxN96CrEF2EUC+L+bo52NsMXqgDfKjLDUkAPz9ElBhxwsC4quwHJDHqwrN8FWWzVEu5rA1zMgqgCzSYD/EYuhs7t71TV9WMIOFEdnl6gCfGlTSS0JcBxD326vwa63EOYVKjd0yQTgJMjWkgDswWs4dFOBakKXWoB3tSDASe/AcE1nD1xqC11qAWZEsgAs+M1WG7yg8uClFGDMppKRIgB7kt9UhcEXpUZE8JIJMH5TyUAEYI17xN0FHztbYI/DCzuqamBzhQ02llXC1goH/AW/Zz/f72yGw+6O4YctOcNnNX5hcUpEBS+1AFGBCvCrtDh4PPX4pHkm6xwsLciCdUYDfGBxwiFXG5wS+6ne2w+vXyuJyOClFmBaoAIEE/5EzMlIgFXFBbDLVhvUsOho2BArG5mL5PAlE2D0ppJyCjBWhnj4Y5FuWIbJBM96kY1VVpgXwnAsCTBqU8lwCTCa53OTYHuVS7BEHKvrhRWmfE0EL4cA85UiwAgLchLhg8pqvyKwodslpZ9pKnypBRjeVFJJAozwoi4Njnq6xny2jzLqNBe+pAKMbCqpRAGGnxEyE/DjpRtOeYdglVmvyfDlEGCbUgUYYbE+Q7PhyyHAY0oWYE7OGU2HL4cAU5UqwK8z4jQfvuQCMJQqwNyr50kArQowK5Pufk0LMFdHd79mBZiddYqC17IAc3UXKHitCvBE2kkKXWkCsFk7uQR4MjueQh8FewGlqa8vvAKsKMySTYCnc89R8KNYasgWnKyTXIA8XwN2zSfo6T8MnK2rDb8AjGMOK8xKPyW5AM/kX6TgEfb+wt5qKwSSjSwCMGwdbXDIVgnrjYXwjrFAEpYVZ8CS4nRBVmLXuLnKFHFssZjgsMsB5rY2CDQX2QQglIkYAtyghlQtN8QQwE0NqVpcYghwnhpStcSLIQBbFPIFNabqYJk9GrIAnAR7qEFVx19ZdqIIwEkQhfRRwyqefmTlSG6iCcBJcDvyBPI2so1QFCyT2cidozMTVQBCfVAjkADUCCQAQQIQJABBAhAkAKEp/gvRlyRAjK8gmAAAAABJRU5ErkJggg==';

  @Input() docPreviewIcon: string = 'data:image/png;base64,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';

  @Input() closeBtnIcon: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfjBBUFHAFZ+G3BAAADLElEQVRIx53V30/VdRgH8Nc550sQELDBAddczK1kNVIXOC3dyBJrc8w1yRKcP+oiK1vedNu88Q/oNjcbF4YWM7S5Nu2mNXCWbkHFsqYDtObhxwCDw69Dpws8x3Pg+KPel8/zed7f9/d5ns/7E7IcIVGbbVPvCWUYN+hH53UZllx+OBuBegdsFdetx4hhRFVY53mFvnXcFYl7E9TaZ5Pfderxt1kLFhARUaDYWq95yvfa9OUiCNnmLQlfu2RIfJnYkEKVNmoSdtyFVD6STrfYq98JXW6Zlwvzxt1w0+Mahf2aTfCKvX7WrteU+2FWzJ8qbDHm2l2CWof1a9d3j29nImHUiGoN+gwTRmCfhDOuZvf3PhRXnZG0T7AY2OiiN5U+VHEKpXbrtoGIkI9N+FwsnaywSsTkkpIVqiXF072Ie1atc2GVXvaVWMbYqmzXrCqrvEqz7VmxmE5bVYRtFteTZoZRU7ZrFk1HyjVrEjeacSruJ9M2RRx2wzdZBJMGBFrwhxmU2aVVpy/dylKVp8YqLnvPY8uaVO4dvQ4qVuRtvQ5l6EmhxCE/BKqNWFiWHHVSwhEJ84446pSxHOMcVs2sBvk5R1Vkv2nT9ivKmc+3xUzY4jL9P4QITIimb0Qmyux0xAfmHFWQ8xcioiYCAzkJyjV731EnJeX5UOCU4SVnAlH9Ec9Z4busMVJplz3atLtt3nXTWoUNLNnOEnsMRjxir9MmMhIrNGty2hd3FmdWP5oEBjMoQqp85NNAl0JrDWX4QLki53RkSB7VIaRQecYqFVmrQHdE3DPWuGw8nUr6y5WMywVTBt0Uy/jVlQ76TQdscNHu/3ydW3RZv+hIMU9a76bYQxoKBeq06nVCMoyENmE71KQc5gEI1NghpM1CyhOH3daowoiJB6oo8LSdVjvmEndd+bqIF1WbNG7unsUhpeq8YbUOZxdDd3fwF2Ma1PvHlLkcOkKKrfSSViWOObv0YYFr+qzyujXmzcgTiAgL5HtUiSoveNeren2yKD7Fu7RBdQ5oNO2iHkN3HtdK62xU4ILPXMl2jxA5xFbYZJt61cokTeh32XndRpY/7/8CrNj8Jg8NJxQAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTktMDQtMjFUMDM6Mjg6MDErMDI6MDC9IUd/AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE5LTA0LTIxVDAzOjI4OjAxKzAyOjAwzHz/wwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=';

  @Input() uploadCompleteIcon: string = 'assets/icons/upload-completed.svg';

  @Input() progressBarColor: string = '#4ACFD9'; //#4ACFD9

  @Input() progressBarErrColor: string = '#E66565';

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
      dm = 2,
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
          file['uploaded'] = false;
          file['error'] = true;
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
            file['uploaded'] = false;
            file['error'] = true;
            console.log('ERROR', file);
            this.onError.emit({ files: this.files, error: err });
            observer.error(err);
          }
        );
    });
  }
}
