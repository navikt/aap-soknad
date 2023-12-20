import * as classes from './Behandlere.module.css';
import { Alert, BodyShort, Label, Radio, RadioGroup } from '@navikt/ds-react';
import { formatFullAdresse, formatNavn, formatTelefonnummer } from 'utils/StringFormatters';
import { JaEllerNei } from 'types/Generic';
import React from 'react';
import { useIntl } from 'react-intl';
import { RegistrertBehandler as RegistrertBehandlerType } from 'types/Soknad';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';

interface Props {
  registrertBehandler: RegistrertBehandlerType;
  index: number;
  clearErrors: () => void;
  errorMessage?: string;
}
export const RegistrertBehandler = ({
  registrertBehandler,
  index,
  clearErrors,
  errorMessage,
}: Props) => {
  const { formatMessage } = useIntl();
  const { søknadState, søknadDispatch } = useSoknad();

  return (
    <div>
      <dl className={classes?.fastLege}>
        <dt>
          <Label as={'span'}>
            {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.navn' })}
          </Label>
        </dt>
        <dd>{formatNavn(registrertBehandler.navn)}</dd>
        <dt>
          <Label as={'span'}>
            {formatMessage({
              id: 'søknad.helseopplysninger.registrertFastlege.legekontor',
            })}
          </Label>
        </dt>

        <dd>{registrertBehandler.kontaktinformasjon.kontor}</dd>
        <dt>
          <Label as={'span'}>
            {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.adresse' })}
          </Label>
        </dt>

        <dd>{formatFullAdresse(registrertBehandler.kontaktinformasjon.adresse)}</dd>
        <dt>
          <Label as={'span'}>
            {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.telefon' })}
          </Label>
        </dt>

        <dd>{formatTelefonnummer(registrertBehandler.kontaktinformasjon.telefon)}</dd>
      </dl>
      <RadioGroup
        name={`registrerteBehandlere[${index}].erRegistrertFastlegeRiktig`}
        id={`registrerteBehandlere[${index}].erRegistrertFastlegeRiktig`}
        legend={formatMessage({
          id: `søknad.helseopplysninger.erRegistrertFastlegeRiktig.label`,
        })}
        value={registrertBehandler.erRegistrertFastlegeRiktig || ''}
        onChange={(value) => {
          clearErrors();
          updateSøknadData(søknadDispatch, {
            registrerteBehandlere: søknadState.søknad?.registrerteBehandlere?.map((behandler) => {
              if (
                behandler.kontaktinformasjon.behandlerRef ===
                registrertBehandler.kontaktinformasjon.behandlerRef
              ) {
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
      {registrertBehandler.erRegistrertFastlegeRiktig === JaEllerNei.NEI && (
        <Alert variant={'info'}>
          {formatMessage({
            id: 'søknad.helseopplysninger.erRegistrertFastlegeRiktig.alertInfo',
          })}
        </Alert>
      )}
    </div>
  );
};
