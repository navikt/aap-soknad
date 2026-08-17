import { describe, it, expect } from 'vitest';
import { erGyldigFødselsnummer } from './fnr';

describe('Test validering av fnr - med kontrollsiffer', () => {
  it('Sjekk diverse syntetiske fnr', () => {
    expect(erGyldigFødselsnummer('03432287806')).toBeTruthy();
    expect(erGyldigFødselsnummer('03509044227')).toBeTruthy();
    expect(erGyldigFødselsnummer('23906799537')).toBeTruthy();
    expect(erGyldigFødselsnummer('09417806234')).toBeTruthy();
    expect(erGyldigFødselsnummer('10438303079')).toBeTruthy();
    expect(erGyldigFødselsnummer('08427832180')).toBeTruthy();
    expect(erGyldigFødselsnummer('16528049234')).toBeTruthy();
    expect(erGyldigFødselsnummer('02419349502')).toBeTruthy();
    expect(erGyldigFødselsnummer('23457448058')).toBeTruthy();
  });

  it('Sjekk diverse ugyldige numeriske verdier', () => {
    expect(erGyldigFødselsnummer('1234')).toBeFalsy();

    expect(erGyldigFødselsnummer('15048900000')).toBeFalsy();
    expect(erGyldigFødselsnummer('00000000000')).toBeFalsy();
    expect(erGyldigFødselsnummer('11111111111')).toBeFalsy();
    expect(erGyldigFødselsnummer('22222222222')).toBeFalsy();
    expect(erGyldigFødselsnummer('33333333333')).toBeFalsy();
    expect(erGyldigFødselsnummer('44444444444')).toBeFalsy();
    expect(erGyldigFødselsnummer('55555555555')).toBeFalsy();
    expect(erGyldigFødselsnummer('66666666666')).toBeFalsy();
    expect(erGyldigFødselsnummer('77777777777')).toBeFalsy();
    expect(erGyldigFødselsnummer('88888888888')).toBeFalsy();
    expect(erGyldigFødselsnummer('99999999999')).toBeFalsy();

    expect(erGyldigFødselsnummer('36117512737')).toBeFalsy();
    expect(erGyldigFødselsnummer('12345678901')).toBeFalsy();
    expect(erGyldigFødselsnummer('00000000001')).toBeFalsy();
    expect(erGyldigFødselsnummer('10000000000')).toBeFalsy();
  });

  it('Sjekk diverse ugyldige tekst verdier', () => {
    expect(erGyldigFødselsnummer(undefined)).toBeFalsy();
    expect(erGyldigFødselsnummer('')).toBeFalsy();
    expect(erGyldigFødselsnummer('     ')).toBeFalsy();
    expect(erGyldigFødselsnummer('hei')).toBeFalsy();
    expect(erGyldigFødselsnummer('gyldigfnrmedtekst03432287806')).toBeFalsy();
  });
});
