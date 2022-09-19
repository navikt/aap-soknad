import { SøknadApiType } from 'pages/api/oppslag/soeknader';

export const mockSøknader: SøknadApiType[] = [
  {
    innsendtDato: '2022-08-26T11:08:30.077Z',
    søknadId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    innsendteVedlegg: [{ vedleggType: 'UTLAND', innsendtDato: '2022-08-26T11:08:30.077Z' }],
    manglendeVedlegg: ['ARBEIDSGIVER'],
  },
];
