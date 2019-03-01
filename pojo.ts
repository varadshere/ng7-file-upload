export interface Message {
  severity?: string;
  summary?: string;
  detail?: string;
  id?: any;
  key?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  data?: any;
}

export class UploadDocument {
  AttachmentList: Array<
    {
      attachment: {
        fileName: string;
        mimeType: string;
        fileContent: string;
      },
      file: File | any
    }
  >;
}
