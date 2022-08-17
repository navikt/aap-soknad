import { Alert, Label, BodyLong, BodyShort, Button, Heading, Radio } from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { FastlegeView, getFullAdresse, getFulltNavn } from 'context/sokerOppslagContext';
import { Add } from '@navikt/ds-icons';
import { Soknad, Behandler, RegistrertBehandler } from 'types/Soknad';
import * as yup from 'yup';
import { useStepWizard } from 'context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { AddBehandlerModal } from './AddBehandlerModal';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import * as classes from './Behandlere.module.css';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { deleteOpplastedeVedlegg, useSoknadContextStandard } from 'context/soknadContextStandard';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import { JaEllerNei } from 'types/Generic';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
  fastlege?: FastlegeView;
}
const REGISTRERTE_BEHANDLERE = 'registrerteBehandlere';
const ANDRE_BEHANDLERE = 'andreBehandlere';
const RIKTIG_FASTLEGE = 'erRegistrertFastlegeRiktig';

export const Behandlere = ({ onBackClick, onNext, defaultValues, fastlege }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({});
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    [REGISTRERTE_BEHANDLERE]: Array<RegistrertBehandler>;
    [ANDRE_BEHANDLERE]: Array<Behandler>;
  }>({
    resolver: yupResolver(schema),
    defaultValues: {
      [REGISTRERTE_BEHANDLERE]: defaultValues?.søknad?.registrerteBehandlere,
      [ANDRE_BEHANDLERE]: defaultValues?.søknad?.andreBehandlere,
    },
  });

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = watch();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBehandlerIndex, setSelectedBehandlerIndex] = useState<number | undefined>(
    undefined
  );

  const { fields: registrertBehandlerFields, update: registrertBehandlerUpdate } = useFieldArray({
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

  const watchFieldArray = watch(REGISTRERTE_BEHANDLERE);
  const controlledFields = registrertBehandlerFields.map((field, index) => {
    return {
      ...field,
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
      if (selectedBehandlerIndex)
        update(selectedBehandlerIndex, {
          ...behandler,
        });
    }
    setShowModal(false);
  };
  const slettSelectedBehandler = () => {
    remove(selectedBehandlerIndex);
    setSelectedBehandlerIndex(undefined);
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
        nextButtonText={formatMessage('navigation.next')}
        backButtonText={formatMessage('navigation.back')}
        cancelButtonText={formatMessage('navigation.cancel')}
        errors={errors}
      >
        <Heading size="large" level="2">
          {formatMessage('søknad.helseopplysninger.title')}
        </Heading>
        <LucaGuidePanel>
          <BodyLong>{formatMessage('søknad.helseopplysninger.guide.text1')}</BodyLong>
          <BodyLong>{formatMessage('søknad.helseopplysninger.guide.text2')}</BodyLong>
        </LucaGuidePanel>
        <div>
          <Heading size={'small'} level={'3'}>
            {formatMessage('søknad.helseopplysninger.registrertFastlege.title')}
          </Heading>
          {controlledFields.length === 0 && (
            <BodyLong>
              {formatMessage('søknad.helseopplysninger.registrertFastlege.ingenFastlege')}
            </BodyLong>
          )}
          {controlledFields.map((field, index) => (
            <div key={field.id}>
              <dl className={classes?.fastLege}>
                <dt>
                  <Label>{formatMessage('søknad.helseopplysninger.registrertFastlege.navn')}</Label>
                </dt>
                <dl>{getFulltNavn(field.navn)}</dl>
                <dt>
                  <Label>
                    {formatMessage('søknad.helseopplysninger.registrertFastlege.legekontor')}
                  </Label>
                </dt>
                <dl>{field.kontaktinformasjon.kontor}</dl>
                <dt>
                  <Label>
                    {formatMessage('søknad.helseopplysninger.registrertFastlege.adresse')}
                  </Label>
                </dt>
                <dl>{getFullAdresse(field.kontaktinformasjon.adresse)}</dl>
                <dt>
                  <Label>
                    {formatMessage('søknad.helseopplysninger.registrertFastlege.telefon')}
                  </Label>
                </dt>
                <dl>{field.kontaktinformasjon.telefon}</dl>
              </dl>
              <RadioGroupWrapper
                name={`${REGISTRERTE_BEHANDLERE}.${index}.${RIKTIG_FASTLEGE}`}
                legend={formatMessage(`søknad.helseopplysninger.erRegistrertFastlegeRiktig.label`)}
                control={control}
                error={errors?.[REGISTRERTE_BEHANDLERE]?.[index]?.[RIKTIG_FASTLEGE]?.message}
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
                  {formatMessage('søknad.helseopplysninger.erRegistrertFastlegeRiktig.alertInfo')}
                </Alert>
              )}
            </div>
          ))}

          {!fastlege ? (
            <BodyLong>
              {formatMessage('søknad.helseopplysninger.registrertFastlege.ingenFastlege')}
            </BodyLong>
          ) : (
            <></>
          )}
        </div>
        <Heading size={'small'} level={'3'}>
          {formatMessage('søknad.helseopplysninger.annenBehandler.title')}
        </Heading>
        <BodyLong>{formatMessage('søknad.helseopplysninger.annenBehandler.description')}</BodyLong>
        {fields.length > 0 && (
          <>
            <Heading size={'xsmall'} level={'4'}>
              {formatMessage('søknad.helseopplysninger.dineBehandlere.title')}
            </Heading>
            <ul className={classes?.legeList}>
              {fields.map((field, index) => (
                <li>
                  <BodyShort>
                    {field?.firstname} {field?.lastname}
                  </BodyShort>
                  <BodyShort>{field?.legekontor}</BodyShort>
                  <BodyShort>
                    {field?.gateadresse}, {field?.postnummer} {field?.poststed}
                  </BodyShort>
                  <BodyShort>{`${formatMessage(
                    'søknad.helseopplysninger.dineBehandlere.telefon'
                  )}: ${field?.telefon}`}</BodyShort>
                  <Button type="button" variant="tertiary" onClick={() => editNyBehandler(index)}>
                    {formatMessage('søknad.helseopplysninger.dineBehandlere.editButton')}
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div>
          <Button
            variant="tertiary"
            type="button"
            onClick={() => {
              setSelectedBehandlerIndex(undefined);
              setShowModal(true);
            }}
          >
            <Add
              title={formatMessage('søknad.helseopplysninger.annenBehandler.accessibleButtonTitle')}
            />
            {formatMessage('søknad.helseopplysninger.annenBehandler.addBehandlerButton')}
          </Button>
        </div>
      </SoknadFormWrapper>
      <AddBehandlerModal
        onCloseClick={() => setShowModal(false)}
        onSaveClick={saveNyBehandler}
        onDeleteClick={() => {
          slettSelectedBehandler();
          setShowModal(false);
        }}
        showModal={showModal}
        behandler={selectedBehandler}
      />
    </>
  );
};
