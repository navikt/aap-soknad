import { v4 as uuidV4 } from 'uuid';
import React, { ReactElement, useState } from 'react';
import { FileInput, FileInputProps, Vedlegg } from './FileInput';
import { render } from 'setupTests';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import fetchMock from "jest-fetch-mock";

import userEvent from '@testing-library/user-event';

const fileOneName = 'filEn.pdf';
const fileTwoName = 'filTo.pdf';
const fileOne: File = new File(['fil en'], fileOneName, { type: 'application/pdf' });
const fileTwo: File = new File(['fil to'], fileTwoName, { type: 'application/pdf' });
const heading = 'Last opp fil';

fetchMock.enableMocks();

describe('FileInput', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  const user = userEvent.setup();

  it('Skal ha overskrift', () => {
    render(<FileInputWithState />);
    expect(screen.getByText(heading)).toBeVisible();
  });

  it('Skal ha ingress hvis ingress har en verdi', () => {
    const ingress = 'Last opp minst tre filer';
    render(<FileInputWithState ingress={ingress} />);
    expect(screen.getByText(ingress)).toBeVisible();
  });

  it('Skal ha heading i tittelen på opplastningsknapp', () => {
    render(<FileInputWithState />);
    expect(screen.getByText(`Velg dine filer for ${heading.toLowerCase()}`)).toBeVisible();
  });

  it('Skal gå an å laste opp en fil', async () => {
    mockUploadFile();

    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, fileOne);
    expect(await screen.findByText(fileOneName)).toBeVisible();
  });

  it('Skal gå an å laste opp flere filer av gangen', async () => {
    mockUploadFile();
    mockUploadFile();

    render(<FileInputWithState name={'dokumenter'} />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, [fileOne, fileTwo]);
    expect(await screen.findByText(fileOneName)).toBeVisible();
    expect(await screen.findByText(fileTwoName)).toBeVisible();
  });

  it('Skal gå an å laste opp en fil ved drag & drop', async () => {
    mockUploadFile();

    render(<FileInputWithState name={'dokumenter'} />);
    const dropZone = screen.getByTestId('dropzone');
    fireEvent.drop(dropZone, { dataTransfer: { files: [fileOne] } });
    expect(await screen.findByText(fileOneName)).toBeVisible();
  });

  it('Skal gå an å laste opp flere filer ved drag & drop', async () => {
    mockUploadFile();
    mockUploadFile();

    render(<FileInputWithState name={'dokumenter'} />);
    const dropZone = screen.getByTestId('dropzone');
    fireEvent.drop(dropZone, { dataTransfer: { files: [fileOne, fileTwo] } });
    expect(await screen.findByText(fileOneName)).toBeVisible();
    expect(await screen.findByText(fileTwoName)).toBeVisible();
  });

  it('Skal akseptere pdf', async () => {
    mockUploadFile();

    const pdfFile: File = new File(['fil en'], fileOneName, { type: 'application/pdf' });
    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, pdfFile);
    expect(await screen.findByText(fileOneName)).toBeVisible();
  });

  it('Skal akseptere jpeg', async () => {
    mockUploadFile();

    const pdfFile: File = new File(['fil en'], fileOneName, { type: 'image/jpeg' });
    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, pdfFile);
    expect(await screen.findByText(fileOneName)).toBeVisible();
  });

  it('Skal akseptere jpg', async () => {
    mockUploadFile();

    const pdfFile: File = new File(['fil en'], fileOneName, { type: 'image/jpg' });
    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, pdfFile);
    expect(await screen.findByText(fileOneName)).toBeVisible();
  });

  it('Skal akseptere png', async () => {
    mockUploadFile();

    const pdfFile: File = new File(['fil en'], fileOneName, { type: 'image/png' });
    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, pdfFile);
    expect(await screen.findByText(fileOneName)).toBeVisible();
  });

  it('Skal ikke akseptere JSON', async () => {
    const pdfFile: File = new File(['fil en'], fileOneName, { type: 'application/json' });
    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, pdfFile);
    expect(
      await screen.findByText(
        'Filtypen kan ikke lastes opp. Last opp dokumentet i et annet format (PDF, PNG, JPG eller heic).'
      )
    ).toBeVisible();
  });

  it('Skal ikke akseptere filer når total fil størrelse er nådd ', async () => {
    mockUploadFile();

    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    const fileThree: File = new File(['fil tre'], 'filTre.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileThree, 'size', { value: (1024 * 1024 + 1) * 50 });
    await user.upload(input, fileThree);

    expect(
      await screen.findByText(
        'Filen(e) du lastet opp er for stor. Last opp fil(er) med maksimal samlet størrelse 50 MB.'
      )
    ).toBeVisible();
  });

  it('Skal være mulig å fjerne en fil', async () => {
    mockUploadFile();

    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, fileOne);

    expect(await screen.findByText(fileOneName)).toBeVisible();

    const slettKnapp = await screen.findByTestId('slett-knapp');
    await waitFor(() => slettKnapp.click());

    expect(await screen.queryByText(fileOneName)).not.toBeInTheDocument();
  });

  it('Skal vise feilmelding dersom respons fra backend er passordbeskyttet', async () => {
    mockUploadFile({ status: 422, substatus: 'PASSWORD_PROTECTED' });

    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, fileOne);
    expect(
      await screen.findByText(
        'Filen er passord-beskyttet og vil ikke kunne leses av en saksbehandler, fjern beskyttelsen og prøv igjen'
      )
    ).toBeVisible();
  });

  it('Skal vise feilmelding dersom respons fra backend er virus', async () => {
    mockUploadFile({ status: 422, substatus: 'VIRUS' });

    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, fileOne);
    expect(
      await screen.findByText('Det er oppdaget virus på filen du prøver å laste opp. Velg en annen fil å laste opp.')
    ).toBeVisible();
  });

  it('Skal vise feilmelding dersom respons fra backend er for stor filstørrelse', async () => {
    mockUploadFile({ status: 422, substatus: 'SIZE' });

    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, fileOne);
    expect(
      await screen.findByText(/maksimal samlet størrelse på vedlegg per bruker \(50mb\) er oversteget\./i)
    ).toBeVisible();
  });

  it('Skal vise feilmelding dersom noe går galt i kallet mot backend', async () => {
    fetchMock.mockAbortOnce();

    render(<FileInputWithState />);
    const input = screen.getByTestId('fileinput');
    await user.upload(input, fileOne);
    expect(await screen.findByText('Opplastingen feilet. Prøv på nytt')).toBeVisible();
  });

  it('Skal ha korrekt url i success panel link', async () => {
    fetchMock.mockResponseOnce(JSON.stringify('12345'), { status: 200 });

    render(<FileInputWithState name={'dokumenter'} />);
    const dropZone = screen.getByTestId('dropzone');
    fireEvent.drop(dropZone, { dataTransfer: { files: [fileOne] } });

    expect(await screen.findByText(fileOneName)).toBeVisible();

    const hello = screen.getByRole('link', {
      name: /filen\.pdf/i,
    });

    expect(hello).toHaveAttribute('href', '/read/12345');
  });
});

export function FileInputWithState(
  props: Omit<
    FileInputProps,
    'onChange' | 'uploadUrl' | 'heading' | 'id' | 'deleteUrl' | 'onUpload' | 'onDelete' | 'files' | 'readAttachmentUrl'
  >
): ReactElement {
  const [files, setFiles] = useState<Vedlegg[]>([]);

  return (
    <FileInput
      {...props}
      heading={heading}
      id={'filopplasting'}
      uploadUrl={'/upload'}
      deleteUrl={'/delete'}
      readAttachmentUrl={'/read/'}
      onUpload={(attachments) => setFiles([...files, ...attachments])}
      onDelete={(attachment) => setFiles(files.filter((file) => file.vedleggId !== attachment.vedleggId))}
      files={files}
    />
  );
}

interface ErrorInterface {
  status: number;
  substatus: 'PASSWORD_PROTECTED' | 'VIRUS' | 'SIZE';
}

function mockUploadFile(error?: ErrorInterface) {
  fetchMock.mockResponseOnce(JSON.stringify(error ? error : uuidV4()), { status: error ? error.status : 200 });
}
