import { FileInput, FileInputInnsending, Vedlegg } from '@navikt/aap-felles-react';

export const FileInputWrapper = ({
  locale,
  heading,
  ingress,
  id,
  files,
  readAttachmentUrl,
  deleteUrl,
  uploadUrl,
  onUpload,
  onDelete,
}: {
  locale: string;
  heading: string;
  ingress?: string;
  id: string;
  files: Vedlegg[];
  readAttachmentUrl: string;
  deleteUrl: string;
  uploadUrl: string;
  onUpload: (vedlegg: Vedlegg[]) => void;
  onDelete: (vedlegg: Vedlegg) => void;
}) => {
  if (process.env.NEXT_PUBLIC_NY_INNSENDING === 'enabled') {
    return (
      <FileInputInnsending
        locale={locale}
        id={id}
        heading={heading}
        ingress={ingress}
        onUpload={(vedlegg) => onUpload(vedlegg)}
        onDelete={(vedlegg) => onDelete(vedlegg)}
        deleteUrl={deleteUrl}
        uploadUrl={uploadUrl}
        readAttachmentUrl={readAttachmentUrl}
        files={files}
      />
    );
  }
  return (
    <FileInput
      locale={locale}
      id={id}
      heading={heading}
      ingress={ingress}
      onUpload={(vedlegg) => onUpload(vedlegg)}
      onDelete={(vedlegg) => onDelete(vedlegg)}
      deleteUrl={deleteUrl}
      uploadUrl={uploadUrl}
      readAttachmentUrl={readAttachmentUrl}
      files={files}
    />
  );
};
