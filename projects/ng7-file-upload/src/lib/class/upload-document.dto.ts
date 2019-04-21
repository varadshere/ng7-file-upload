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
