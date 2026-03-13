'use client';
import * as classes from './Behandlere.module.css';
import { Alert, BodyShort, Label, Radio, RadioGroup } from '@navikt/ds-react';
import { formatTelefonnummer } from 'utils/StringFormatters';
import { JaEllerNei } from 'types/Generic';
import React from 'react';
import { useTranslations } from 'next-intl';
import { RegistrertFastlege } from 'types/Soknad';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';

interface Props {
  fastlege: RegistrertFastlege;
  index: number;
  clearErrors: () => void;
  errorMessage?: string;
}
export const RegistrertBehandler = ({ fastlege, index, clearErrors, errorMessage }: Props) => {
  const t = useTranslations();
  const { søknadState, søknadDispatch } = useSoknad();

  return (
    <div>
      <dl className={classes?.fastLege}>
        <dt>
          <Label as={'span'}>
            {t('søknad.helseopplysninger.registrertFastlege.navn')}
          </Label>
        </dt>
        <dd>{fastlege.navn}</dd>
        <dt>
          <Label as={'span'}>
            {t('søknad.helseopplysninger.registrertFastlege.legekontor')}
          </Label>
        </dt>

        <dd>{fastlege.kontaktinformasjon.kontor}</dd>
        <dt>
          <Label as={'span'}>
            {t('søknad.helseopplysninger.registrertFastlege.adresse')}
          </Label>
        </dt>

        <dd>{fastlege.kontaktinformasjon.adresse}</dd>
        <dt>
          <Label as={'span'}>
            {t('søknad.helseopplysninger.registrertFastlege.telefon')}
          </Label>
        </dt>

        <dd>{formatTelefonnummer(fastlege.kontaktinformasjon.telefon)}</dd>
      </dl>
      <RadioGroup
        name={`fastlege[${index}].erRegistrertFastlegeRiktig`}
        id={`fastlege[${index}].erRegistrertFastlegeRiktig`}
        legend={t(`søknad.helseopplysninger.erRegistrertFastlegeRiktig.label`)}
        value={fastlege.erRegistrertFastlegeRiktig || ''}
        onChange={(value) => {
          clearErrors();
          updateSøknadData(søknadDispatch, {
            fastlege: søknadState.søknad?.fastlege?.map((behandler) => {
              if (behandler.behandlerRef === fastlege.behandlerRef) {
                return { ...behandler, erRegistrertFastlegeRiktig: value };
              } else {
                return behandler;
              }
            }),
          });
        }}
        error={errorMessage}
      >
        <Radio value={JaEllerNei.JA}>
          <BodyShort>{JaEllerNei.JA}</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>{JaEllerNei.NEI}</BodyShort>
        </Radio>
      </RadioGroup>
      {fastlege.erRegistrertFastlegeRiktig === JaEllerNei.NEI && (
        <Alert variant={'info'}>
          {t('søknad.helseopplysninger.erRegistrertFastlegeRiktig.alertInfo')}
        </Alert>
      )}
    </div>
  );
};
