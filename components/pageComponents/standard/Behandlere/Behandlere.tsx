import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Heading,
  Label,
  Radio,
  RadioGroup,
} from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import { Add, Delete } from '@navikt/ds-icons';
import { Behandler, Soknad } from 'types/Soknad';
import * as yup from 'yup';
import { useStepWizard } from 'context/stepWizardContextV2';
import { AddBehandlerModal } from './AddBehandlerModal';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import * as classes from './Behandlere.module.css';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { updateSøknadData } from 'context/soknadContextCommon';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { JaEllerNei } from 'types/Generic';
import { formatFullAdresse, formatNavn, formatTelefonnummer } from 'utils/StringFormatters';
import { IntlFormatters, useIntl } from 'react-intl';
import SoknadFormWrapperNew from '../../../SoknadFormWrapper/SoknadFormWrapperNew';
import { SøknadValidationError } from '../../../schema/FormErrorSummaryNew';
import { v4 as uuid4 } from 'uuid';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}
const REGISTRERTE_BEHANDLERE = 'registrerteBehandlere';
const ANDRE_BEHANDLERE = 'andreBehandlere';
const RIKTIG_FASTLEGE = 'erRegistrertFastlegeRiktig';

export const getBehandlerSchema = (formatMessage: IntlFormatters['formatMessage']) =>
  yup.object().shape({
    [REGISTRERTE_BEHANDLERE]: yup.array().of(
      yup.object().shape({
        [RIKTIG_FASTLEGE]: yup
          .string()
          .required(
            formatMessage({ id: `søknad.helseopplysninger.erRegistrertFastlegeRiktig.required` })
          )
          .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
          .nullable(),
      })
    ),
    [ANDRE_BEHANDLERE]: yup.array(),
  });
export const Behandlere = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useIntl();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();

  const { stepList } = useStepWizard();

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.andreBehandlere, søknadState.søknad?.registrerteBehandlere]);

  const [showModal, setShowModal] = useState(false);
  const [selectedBehandler, setSelectedBehandler] = useState<Behandler>({});

  const editNyBehandler = (behandler: Behandler) => {
    setSelectedBehandler(behandler);
    setShowModal(true);
  };

  function clearErrors() {
    setErrors(undefined);
  }

  const append = (behandler: Behandler) => {};
  const update = (behandler: Behandler) => {};
  const saveNyBehandler = (behandler: Behandler) => {
    if (behandler.id === undefined) {
      append({
        ...behandler,
        id: uuid4(),
      });
    } else {
      update(behandler);
    }
  };

  const slettBehandler = (behandlerId?: string) => {
    updateSøknadData(søknadDispatch, {
      andreBehandlere: søknadState.søknad?.andreBehandlere?.filter(
        (behandler) => behandlerId !== behandler.id
      ),
    });
  };

  return (
    <>
      <SoknadFormWrapperNew
        onNext={async () => {}}
        onBack={() => {
          updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
      >
        <Heading size="large" level="2">
          {formatMessage({ id: 'søknad.helseopplysninger.title' })}
        </Heading>
        <LucaGuidePanel>
          <BodyShort spacing>
            {formatMessage({ id: 'søknad.helseopplysninger.guide.text1' })}
          </BodyShort>
          <BodyShort spacing>
            {formatMessage({ id: 'søknad.helseopplysninger.guide.text2' })}
          </BodyShort>
        </LucaGuidePanel>
        <div>
          <Heading size={'small'} level={'3'}>
            {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.title' })}
          </Heading>
          {søknadState.søknad?.registrerteBehandlere?.length === 0 && (
            <BodyLong>
              {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.ingenFastlege' })}
            </BodyLong>
          )}
          {søknadState.søknad?.registrerteBehandlere?.map((field, index) => (
            <div key={field.kontaktinformasjon.behandlerRef}>
              <dl className={classes?.fastLege}>
                <dt>
                  <Label as={'span'}>
                    {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.navn' })}
                  </Label>
                </dt>
                <dd>{formatNavn(field.navn)}</dd>
                <dt>
                  <Label as={'span'}>
                    {formatMessage({
                      id: 'søknad.helseopplysninger.registrertFastlege.legekontor',
                    })}
                  </Label>
                </dt>

                <dd>{field.kontaktinformasjon.kontor}</dd>
                <dt>
                  <Label as={'span'}>
                    {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.adresse' })}
                  </Label>
                </dt>

                <dd>{formatFullAdresse(field.kontaktinformasjon.adresse)}</dd>
                <dt>
                  <Label as={'span'}>
                    {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.telefon' })}
                  </Label>
                </dt>

                <dd>{formatTelefonnummer(field.kontaktinformasjon.telefon)}</dd>
              </dl>
              <RadioGroup
                name={`${REGISTRERTE_BEHANDLERE}.${index}.${RIKTIG_FASTLEGE}`}
                legend={formatMessage({
                  id: `søknad.helseopplysninger.erRegistrertFastlegeRiktig.label`,
                })}
                id={`${REGISTRERTE_BEHANDLERE}.${index}.${RIKTIG_FASTLEGE}`}
                value={field.erRegistrertFastlegeRiktig || ''}
                onChange={(value) => {
                  clearErrors();
                  updateSøknadData(søknadDispatch, {
                    registrerteBehandlere: søknadState.søknad?.registrerteBehandlere?.map(
                      (behandler) => {
                        if (
                          behandler.kontaktinformasjon.behandlerRef ===
                          field.kontaktinformasjon.behandlerRef
                        ) {
                          return { ...behandler, erRegistrertFastlegeRiktig: value };
                        } else {
                          return behandler;
                        }
                      }
                    ),
                  });
                }}
              >
                <Radio value={JaEllerNei.JA}>
                  <BodyShort>{JaEllerNei.JA}</BodyShort>
                </Radio>
                <Radio value={JaEllerNei.NEI}>
                  <BodyShort>{JaEllerNei.NEI}</BodyShort>
                </Radio>
              </RadioGroup>
              {field.erRegistrertFastlegeRiktig === JaEllerNei.NEI && (
                <Alert variant={'info'}>
                  {formatMessage({
                    id: 'søknad.helseopplysninger.erRegistrertFastlegeRiktig.alertInfo',
                  })}
                </Alert>
              )}
            </div>
          ))}
        </div>
        <div>
          <Heading size={'small'} level={'3'} spacing>
            {formatMessage({ id: 'søknad.helseopplysninger.annenBehandler.title' })}
          </Heading>
          <BodyShort spacing>
            {formatMessage({ id: 'søknad.helseopplysninger.annenBehandler.description' })}
          </BodyShort>
          {søknadState.søknad?.andreBehandlere &&
            søknadState.søknad?.andreBehandlere?.length > 0 && (
              <>
                <Heading size={'xsmall'} level={'4'} spacing>
                  {formatMessage({ id: 'søknad.helseopplysninger.dineBehandlere.title' })}
                </Heading>
                <ul className={classes?.legeList}>
                  {søknadState.søknad.andreBehandlere.map((behandler, index) => (
                    <li key={behandler.id}>
                      <article className={classes?.legeKort}>
                        <dl>
                          <div className={classes?.oneLineDetail}>
                            <dt>
                              <Label as={'span'}>
                                {formatMessage({
                                  id: 'søknad.helseopplysninger.dineBehandlere.navn',
                                })}
                                :
                              </Label>
                            </dt>
                            <dd>{`${behandler?.firstname} ${behandler?.lastname}`}</dd>
                          </div>
                          {behandler?.legekontor && (
                            <div className={classes?.oneLineDetail}>
                              <dt>
                                <Label as={'span'}>
                                  {formatMessage({
                                    id: 'søknad.helseopplysninger.dineBehandlere.legekontor',
                                  })}
                                  :
                                </Label>
                              </dt>
                              <dd>{behandler?.legekontor}</dd>
                            </div>
                          )}
                          {behandler?.gateadresse && (
                            <div className={classes?.oneLineDetail}>
                              <dt>
                                <Label as={'span'}>
                                  {formatMessage({
                                    id: 'søknad.helseopplysninger.dineBehandlere.adresse',
                                  })}
                                  :
                                </Label>
                              </dt>
                              <dd>
                                {formatFullAdresse({
                                  adressenavn: behandler.gateadresse,
                                  postnummer: {
                                    postnr: behandler.postnummer,
                                    poststed: behandler.poststed,
                                  },
                                })}
                              </dd>
                            </div>
                          )}
                          {behandler?.telefon && (
                            <div className={classes?.oneLineDetail}>
                              <dt>
                                <Label as={'span'}>
                                  {formatMessage({
                                    id: 'søknad.helseopplysninger.dineBehandlere.telefon',
                                  })}
                                  :
                                </Label>
                              </dt>
                              <dd>{formatTelefonnummer(behandler?.telefon)}</dd>
                            </div>
                          )}
                        </dl>
                        <div className={classes?.cardButtonWrapper}>
                          <Button
                            type="button"
                            variant="tertiary"
                            onClick={() => editNyBehandler(behandler)}
                          >
                            {formatMessage({
                              id: 'søknad.helseopplysninger.dineBehandlere.editButton',
                            })}
                          </Button>
                          <Button
                            variant="tertiary"
                            type="button"
                            icon={<Delete title={'Slett'} />}
                            iconPosition={'left'}
                            onClick={() => {
                              slettBehandler(behandler.id);
                            }}
                          >
                            {formatMessage({
                              id: 'søknad.helseopplysninger.dineBehandlere.slettButton',
                            })}
                          </Button>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </>
            )}

          <Button
            variant="tertiary"
            type="button"
            icon={
              <Add
                title={formatMessage({
                  id: 'søknad.helseopplysninger.annenBehandler.accessibleButtonTitle',
                })}
              />
            }
            iconPosition={'left'}
            onClick={() => {
              setSelectedBehandler({});
              setShowModal(true);
            }}
          >
            {formatMessage({ id: 'søknad.helseopplysninger.annenBehandler.addBehandlerButton' })}
          </Button>
        </div>
      </SoknadFormWrapperNew>
      <AddBehandlerModal
        onCloseClick={() => setShowModal(false)}
        onSaveClick={saveNyBehandler}
        showModal={showModal}
        behandler={selectedBehandler}
      />
    </>
  );
};
