import { Label, BodyLong, BodyShort, Button, Heading, ReadMore } from '@navikt/ds-react';
import React, { useMemo, useState } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { FastlegeView } from '../../../context/sokerOppslagContext';
import { Add } from '@navikt/ds-icons';
import Soknad from '../../../types/Soknad';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { AddBehandlerModal } from './AddBehandlerModal';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import * as classes from './Behandlere.module.css';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
  fastlege?: FastlegeView;
}
const BEHANDLERE = 'behandlere';

export const Behandlere = ({ getText, onBackClick, søknad, fastlege }: Props) => {
  const schema = yup.object().shape({});
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [BEHANDLERE]: søknad?.behandlere,
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedBehandlerIndex, setSelectedBehandlerIndex] = useState<number | undefined>(
    undefined
  );

  const { fields, append, remove, update } = useFieldArray({
    name: BEHANDLERE,
    control,
  });
  const selectedBehandler = useMemo(() => {
    if (selectedBehandlerIndex === undefined) return undefined;
    return fields[selectedBehandlerIndex];
  }, [selectedBehandlerIndex, fields]);

  const editNyBehandler = (index: number) => {
    setSelectedBehandlerIndex(index);
    setShowModal(true);
  };
  const saveNyBehandler = (behandler) => {
    if (selectedBehandler === undefined) {
      append({
        ...behandler,
      });
    } else {
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
          updateSøknadData(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        })}
        onBack={() => onBackClick()}
        nextButtonText={'Neste steg'}
        backButtonText={'Forrige steg'}
        cancelButtonText={'Avbryt søknad'}
        errors={errors}
      >
        <Heading size="large" level="2">
          {getText('steps.fastlege.title')}
        </Heading>
        <LucaGuidePanel>
          <BodyLong>{getText('steps.fastlege.guide1')}</BodyLong>
          <BodyLong>{getText('steps.fastlege.guide2')}</BodyLong>
        </LucaGuidePanel>
        <div>
          <Heading size={'small'} level={'3'}>
            {getText('steps.fastlege.fastlege.heading')}
          </Heading>
          {!fastlege ? (
            <BodyLong>{getText('steps.fastlege.ingenFastlege.text')}</BodyLong>
          ) : (
            <>
              <dl className={classes?.fastLege}>
                <dt>
                  <Label>Navn</Label>
                </dt>
                <dl>{fastlege?.fulltNavn}</dl>
                <dt>
                  <Label>Legekontor</Label>
                </dt>
                <dl>{fastlege?.legekontor}</dl>
                <dt>
                  <Label>Adresse</Label>
                </dt>
                <dl>{fastlege?.adresse}</dl>
                <dt>
                  <Label>Telefon</Label>
                </dt>
                <dl>{fastlege?.telefon}</dl>
              </dl>
              <ReadMore header={getText('steps.fastlege.readMore.header')} type={'button'}>
                {getText('steps.fastlege.readMore.text')}
              </ReadMore>
            </>
          )}
        </div>
        <Heading size={'small'} level={'3'}>
          {getText('steps.fastlege.annenBehandler.heading')}
        </Heading>
        <BodyLong>{getText('steps.fastlege.annenBehandler.info')}</BodyLong>
        {fields.length > 0 && (
          <>
            <Heading size={'xsmall'} level={'4'}>
              {getText('steps.fastlege.andreBehandlere.heading')}
            </Heading>
            {fields.map((field, index) => (
              <div>
                <BodyShort>
                  {field?.firstname} {field?.lastname}
                </BodyShort>
                <BodyShort>{field?.legekontor}</BodyShort>
                <BodyShort>
                  {field?.gateadresse}, {field?.postnummer} {field?.poststed}
                </BodyShort>
                <BodyShort>{`Telefon: ${field?.telefon}`}</BodyShort>
                <Button type="button" variant="tertiary" onClick={() => editNyBehandler(index)}>
                  Endre lege / behandler
                </Button>
              </div>
            ))}
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
            <Add title={'Legg til'} />
            {getText('steps.fastlege.buttonAddNyBehandler')}
          </Button>
        </div>
      </SoknadFormWrapper>
      <AddBehandlerModal
        getText={getText}
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
