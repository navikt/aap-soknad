import { Alert, BodyLong, BodyShort, Button, Heading, Label, Radio } from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Add, Delete } from '@navikt/ds-icons';
import { Behandler, Soknad } from 'types/Soknad';
import * as yup from 'yup';
import { useStepWizard } from 'context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { AddBehandlerModal } from './AddBehandlerModal';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import * as classes from './Behandlere.module.css';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { JaEllerNei } from 'types/Generic';
import { formatFullAdresse, formatNavn, formatTelefonnummer } from 'utils/StringFormatters';
import { useIntl } from 'react-intl';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}
const REGISTRERTE_BEHANDLERE = 'registrerteBehandlere';
const ANDRE_BEHANDLERE = 'andreBehandlere';
const RIKTIG_FASTLEGE = 'erRegistrertFastlegeRiktig';

export const getBehandlerSchema = (formatMessage: any) =>
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
  const { stepList } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getBehandlerSchema(formatMessage)),
    defaultValues: {
      [REGISTRERTE_BEHANDLERE]: defaultValues?.søknad?.registrerteBehandlere,
      [ANDRE_BEHANDLERE]: defaultValues?.søknad?.andreBehandlere,
    },
  });

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });

  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBehandlerIndex, setSelectedBehandlerIndex] = useState<number | undefined>(
    undefined
  );

  const { fields: registrertBehandlerFields } = useFieldArray({
    name: REGISTRERTE_BEHANDLERE,
    control,
  });

  const { fields, append, remove, update } = useFieldArray({
    name: ANDRE_BEHANDLERE,
    control,
  });
  const selectedBehandler = useMemo(() => {
    if (selectedBehandlerIndex === undefined) return undefined;
    return fields[selectedBehandlerIndex];
  }, [selectedBehandlerIndex, fields]);

  const watchFieldArray = useWatch({ control, name: REGISTRERTE_BEHANDLERE });
  const controlledFields = registrertBehandlerFields.map((field, index) => {
    return {
      ...field,
      /* @ts-ignore-line */
      ...watchFieldArray[index],
    };
  });

  const editNyBehandler = (index: number) => {
    setSelectedBehandlerIndex(index);
    setShowModal(true);
  };
  const saveNyBehandler = (behandler: Behandler) => {
    if (selectedBehandler === undefined) {
      append({
        ...behandler,
      });
    } else {
      if (selectedBehandlerIndex !== undefined)
        update(selectedBehandlerIndex, {
          ...behandler,
        });
    }
  };
  const slettBehandler = (index: number) => {
    remove(index);
    setSelectedBehandlerIndex(undefined);
    setShowModal(false);
  };
  return (
    <>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          onNext(data);
        })}
        onBack={() => {
          updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
        onDelete={async () => {
          await deleteOpplastedeVedlegg(søknadState.søknad);
          await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
        }}
        nextButtonText={formatMessage({ id: 'navigation.next' })}
        backButtonText={formatMessage({ id: 'navigation.back' })}
        cancelButtonText={formatMessage({ id: 'navigation.cancel' })}
        errors={errors}
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
          {controlledFields.length === 0 && (
            <BodyLong>
              {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.ingenFastlege' })}
            </BodyLong>
          )}
          {controlledFields.map((field, index) => (
            <div key={field.id}>
              <dl className={classes?.fastLege}>
                <dt>
                  <Label as={'span'}>
                    {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.navn' })}
                  </Label>
                </dt>
                {/* @ts-ignore-line */}
                <dd>{formatNavn(field.navn)}</dd>
                <dt>
                  <Label as={'span'}>
                    {formatMessage({
                      id: 'søknad.helseopplysninger.registrertFastlege.legekontor',
                    })}
                  </Label>
                </dt>
                {/* @ts-ignore-line */}
                <dd>{field.kontaktinformasjon.kontor}</dd>
                <dt>
                  <Label as={'span'}>
                    {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.adresse' })}
                  </Label>
                </dt>
                {/* @ts-ignore-line */}
                <dd>{formatFullAdresse(field.kontaktinformasjon.adresse)}</dd>
                <dt>
                  <Label as={'span'}>
                    {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.telefon' })}
                  </Label>
                </dt>
                {/* @ts-ignore-line */}
                <dd>{formatTelefonnummer(field.kontaktinformasjon.telefon)}</dd>
              </dl>
              <RadioGroupWrapper
                name={`${REGISTRERTE_BEHANDLERE}.${index}.${RIKTIG_FASTLEGE}`}
                legend={formatMessage({
                  id: `søknad.helseopplysninger.erRegistrertFastlegeRiktig.label`,
                })}
                control={control}
              >
                <Radio value={JaEllerNei.JA}>
                  <BodyShort>{JaEllerNei.JA}</BodyShort>
                </Radio>
                <Radio value={JaEllerNei.NEI}>
                  <BodyShort>{JaEllerNei.NEI}</BodyShort>
                </Radio>
              </RadioGroupWrapper>
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
          {fields.length > 0 && (
            <>
              <Heading size={'xsmall'} level={'4'} spacing>
                {formatMessage({ id: 'søknad.helseopplysninger.dineBehandlere.title' })}
              </Heading>
              <ul className={classes?.legeList}>
                {fields.map((field, index) => (
                  <li key={field.id}>
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
                          <dd>{`${field?.firstname} ${field?.lastname}`}</dd>
                        </div>
                        {field?.legekontor && (
                          <div className={classes?.oneLineDetail}>
                            <dt>
                              <Label as={'span'}>
                                {formatMessage({
                                  id: 'søknad.helseopplysninger.dineBehandlere.legekontor',
                                })}
                                :
                              </Label>
                            </dt>
                            <dd>{field?.legekontor}</dd>
                          </div>
                        )}
                        {field?.gateadresse && (
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
                                adressenavn: field.gateadresse,
                                postnummer: { postnr: field.postnummer, poststed: field.poststed },
                              })}
                            </dd>
                          </div>
                        )}
                        {field?.telefon && (
                          <div className={classes?.oneLineDetail}>
                            <dt>
                              <Label as={'span'}>
                                {formatMessage({
                                  id: 'søknad.helseopplysninger.dineBehandlere.telefon',
                                })}
                                :
                              </Label>
                            </dt>
                            <dd>{formatTelefonnummer(field?.telefon)}</dd>
                          </div>
                        )}
                      </dl>
                      <div className={classes?.cardButtonWrapper}>
                        <Button
                          type="button"
                          variant="tertiary"
                          onClick={() => editNyBehandler(index)}
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
                            slettBehandler(index);
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
              setSelectedBehandlerIndex(undefined);
              setShowModal(true);
            }}
          >
            {formatMessage({ id: 'søknad.helseopplysninger.annenBehandler.addBehandlerButton' })}
          </Button>
        </div>
      </SoknadFormWrapper>
      <AddBehandlerModal
        onCloseClick={() => setShowModal(false)}
        onSaveClick={saveNyBehandler}
        showModal={showModal}
        behandler={selectedBehandler}
      />
    </>
  );
};
