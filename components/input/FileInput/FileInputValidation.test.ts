import {
  hasVirus,
  isPasswordProtected,
  isUnderTotalFileSize,
  isValidAttachment,
  isValidFileType,
} from './FileInputValidations';
import { Vedlegg } from '../../../types/Soknad';

describe('isValidFileType', () => {
  it('skal returnere true dersom man ikke sender inn noen felt', () => {
    expect(isValidFileType([])).toBeTruthy();
  });

  it('skal returnere true dersom man ikke sender inn felter som er gyldig', () => {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'application/pdf' });
    const vedlegg: Vedlegg = {
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
    const vedlegg: Vedlegg = {
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
    const vedlegg: Vedlegg = {
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
    const vedlegg: Vedlegg = {
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
    expect(isUnderTotalFileSize([])).toBeTruthy();
  });

  it('skal returnere true dersom totale filstørrelsen ikke er over 50mb', () => {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'application/pdf' });
    const vedlegg: Vedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 728,
    };
    const fields = [vedlegg];

    expect(isUnderTotalFileSize(fields)).toBeTruthy();
  });

  it('skal returnere true dersom totale filstørrelsen er over 50mb', () => {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'audio/*' });
    const vedlegg: Vedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 52428801,
    };

    const fields = [vedlegg];

    expect(isValidAttachment(fields)).toBeTruthy();
  });
});

describe('hasVirus', () => {
  it('skal returnere false dersom den ikke inneholder virus', function () {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'audio/*' });
    const vedlegg: Vedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 52428801,
    };

    const fields = [vedlegg];

    expect(hasVirus(fields)).toBeFalsy();
  });

  it('skal returnere true dersom den inneholder virus', function () {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'audio/*' });
    const vedlegg: Vedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 52428801,
      substatus: 'VIRUS',
      status: 422,
    };

    const fields = [vedlegg];

    expect(hasVirus(fields)).toBeTruthy();
  });

  it('skal returnere false dersom det ikke blir sendt inn noen felt', function () {
    expect(hasVirus([])).toBeFalsy();
  });
});

describe('isPasswordProtected', () => {
  it('skal returnere false dersom den ikke inneholder substatus passordbeskyttet', function () {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'audio/*' });
    const vedlegg: Vedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 52428801,
    };

    const fields = [vedlegg];

    expect(isPasswordProtected(fields)).toBeFalsy();
  });

  it('skal returnere true dersom den inneholder substatus passordbeskyttet', function () {
    const file = new File(['(⌐□_□)'], 'hellopello.pdf', { type: 'audio/*' });
    const vedlegg: Vedlegg = {
      file: file,
      isValid: true,
      name: 'hellopello.pdf',
      size: 52428801,
      substatus: 'PASSWORD_PROTECTED',
      status: 422,
    };

    const fields = [vedlegg];

    expect(isPasswordProtected(fields)).toBeTruthy();
  });

  it('skal returnere false dersom det ikke blir sendt inn noen felt', function () {
    expect(isPasswordProtected([])).toBeFalsy();
  });
});
