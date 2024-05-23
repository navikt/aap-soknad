/** @deprecated Backend sender fult navn som string */
export type Navn = {
  fornavn: string;
  mellomnavn: string;
  etternavn: string;
};

export type Adresse = {
  adressenavn?: string;
  husbokstav?: string;
  husnummer?: string;
  postnummer?: {
    postnr?: string;
    poststed?: string;
  };
};

/**
 * @deprecated - erstattet av Fastlege
 */
export interface OppslagBehandler {
  type: 'FASTLEGE' | 'SYKMELDER';
  navn: Navn;
  kategori: 'LEGE' | 'FYSIOTERAPEUT' | 'KIROPRAKTOR' | 'MANUELLTERAPEUT' | 'TANNLEGE';
  kontaktinformasjon: {
    behandlerRef: string;
    kontor: string;
    orgnummer: string;
    telefon: string;
    adresse: Adresse;
  };
}
