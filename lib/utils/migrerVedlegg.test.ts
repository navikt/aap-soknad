import { RequiredVedlegg } from '../../types/SoknadContext';
import { migrerVedlegg } from './migrerVedlegg';

const ikkeMigrertRequiredVedlegg: RequiredVedlegg[] = [
  { type: 'LØNN_OG_ANDRE_GODER', description: 'Vedlegg for å motta lønn eller andre goder' },
  { type: 'LÅN', description: 'Vedlegg for lån' },
  { type: 'SYKESTIPEND', description: 'Vedlegg for sykestipend' },
  { type: 'ANNET', description: 'Vedlegg for annet' },
  { type: 'UTLANDSSTØNAD', description: 'Vedlegg for utenland' },
  { type: 'OMSORGSSTØNAD', description: 'Vedlegg for omsorg' },
  { type: 'avbruttStudie', description: 'Vedlegg for avbrutt studie' },
  { type: 'barn-c3c21f06-52ef-4ee8-aee9-23b537e388af', description: 'Vedlegg for Iren Panikk' },
  {
    type: 'barn-f3ct1f06-55ef-4te8-aee9-74h917e388af',
    description: 'Vedlegg for Kjell T Ringen',
  },
];

const migrertRequiredVedlegg: RequiredVedlegg[] = [
  { type: 'LØNN_OG_ANDRE_GODER', description: 'Vedlegg for å motta lønn eller andre goder' },
  { type: 'LÅN', description: 'Vedlegg for lån' },
  { type: 'SYKESTIPEND', description: 'Vedlegg for sykestipend' },
  { type: 'ANNET', description: 'Vedlegg for annet' },
  { type: 'UTLANDSSTØNAD', description: 'Vedlegg for utenland' },
  { type: 'OMSORGSSTØNAD', description: 'Vedlegg for omsorg' },
  { type: 'AVBRUTT_STUDIE', description: 'Vedlegg for avbrutt studie' },
  { type: 'c3c21f06-52ef-4ee8-aee9-23b537e388af', description: 'Vedlegg for Iren Panikk' },
  {
    type: 'f3ct1f06-55ef-4te8-aee9-74h917e388af',
    description: 'Vedlegg for Kjell T Ringen',
  },
];

describe('migrering av påkrevde vedlegg', () => {
  it('Skal returnere korrekt type på avbrutt studie ', function () {
    expect(
      migrerVedlegg([{ type: 'avbruttStudie', description: 'Vedlegg for avbrutt studie' }])
    ).toEqual([{ type: 'AVBRUTT_STUDIE', description: 'Vedlegg for avbrutt studie' }]);
  });

  it('Skal returnere korrekt type på manuelle barn', function () {
    expect(
      migrerVedlegg([
        {
          type: 'barn-c3c21f06-52ef-4ee8-aee9-23b537e388af',
          description: 'Vedlegg for Iren Panikk',
        },
      ])
    ).toEqual([
      { type: 'c3c21f06-52ef-4ee8-aee9-23b537e388af', description: 'Vedlegg for Iren Panikk' },
    ]);
  });

  it('Skal returnere korrekt type på resterende felter', function () {
    expect(migrerVedlegg(ikkeMigrertRequiredVedlegg)).toEqual(migrertRequiredVedlegg);
  });
});
