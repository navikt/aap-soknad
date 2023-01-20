import { isOUnderTotalFileSize, isValidAttachment, isValidFileType } from './FileInputValidations';
import { FormFieldVedlegg } from '../../pageComponents/standard/StartDato/MyComponent';

describe('isValidFileType', () => {
  it('skal returnere true dersom man ikke sender inn noen felt', () => {
    expect(isValidFileType([])).toBeTruthy();
  });

  it('skal returnere true dersom man ikke sender inn felter som er gyldig', () => {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'application/pdf' });
    const vedlegg: FormFieldVedlegg = {
      file: file,
      isValid: false,
      name: 'hellopello.pdf',
      size: 728,
    };
    const fields = [vedlegg];

    expect(isValidFileType(fields)).toBeTruthy();
  });

  it('skal returnere true dersom man ikke sender inn felter som er gyldig', () => {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'audio/*' });
    const vedlegg: FormFieldVedlegg = {
      file: file,
      isValid: false,
      name: 'hellopello.pdf',
      size: 728,
    };
    const fields = [vedlegg];

    expect(isValidFileType(fields)).toBeFalsy();
  });
});

describe('isValidAttachment', () => {
  it('skal returnere true dersom man ikke sender inn noen felt', () => {
    expect(isValidAttachment([])).toBeTruthy();
  });

  it('skal returnere true dersom alle feltene er gyldige ', () => {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'application/pdf' });
    const vedlegg: FormFieldVedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 728,
    };
    const fields = [vedlegg];

    expect(isValidAttachment(fields)).toBeTruthy();
  });

  it('skal returnere false dersom et av feltene ikke er gyldig', () => {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'audio/*' });
    const vedlegg: FormFieldVedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 728,
    };

    const vedlegg2 = { ...vedlegg, isValid: false };

    const fields = [vedlegg, vedlegg2];

    expect(isValidAttachment(fields)).toBeFalsy();
  });
});

describe('isUnderTotalFileSize', () => {
  it('skal returnere true dersom man ikke sender inn noen felt', () => {
    expect(isOUnderTotalFileSize([])).toBeTruthy();
  });

  it('skal returnere true dersom totale filstørrelsen ikke er over 50mb', () => {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'application/pdf' });
    const vedlegg: FormFieldVedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 728,
    };
    const fields = [vedlegg];

    expect(isOUnderTotalFileSize(fields)).toBeTruthy();
  });

  it('skal returnere true dersom totale filstørrelsen er over 50mb', () => {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'audio/*' });
    const vedlegg: FormFieldVedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 52428801,
    };

    const fields = [vedlegg];

    expect(isValidAttachment(fields)).toBeTruthy();
  });
});
