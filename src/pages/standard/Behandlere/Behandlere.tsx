import { Label, BodyLong, BodyShort, Button, Heading, ReadMore } from '@navikt/ds-react';
import React, { useMemo, useState } from 'react';
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
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';

interface Props {
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
  fastlege?: FastlegeView;
}
const BEHANDLERE = 'behandlere';

export const Behandlere = ({ onBackClick, søknad, fastlege }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

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
          {!fastlege ? (
            <BodyLong>
              {formatMessage('søknad.helseopplysninger.registrertFastlege.ingenFastlege')}
            </BodyLong>
          ) : (
            <>
              <dl className={classes?.fastLege}>
                <dt>
                  <Label>{formatMessage('søknad.helseopplysninger.registrertFastlege.navn')}</Label>
                </dt>
                <dl>{fastlege?.fulltNavn}</dl>
                <dt>
                  <Label>
                    {formatMessage('søknad.helseopplysninger.registrertFastlege.legekontor')}
                  </Label>
                </dt>
                <dl>{fastlege?.legekontor}</dl>
                <dt>
                  <Label>
                    {formatMessage('søknad.helseopplysninger.registrertFastlege.adresse')}
                  </Label>
                </dt>
                <dl>{fastlege?.adresse}</dl>
                <dt>
                  <Label>
                    {formatMessage('søknad.helseopplysninger.registrertFastlege.telefon')}
                  </Label>
                </dt>
                <dl>{fastlege?.telefon}</dl>
              </dl>
              <ReadMore
                header={formatMessage('søknad.helseopplysninger.registrertFastlege.readMore.title')}
                type={'button'}
              >
                {formatMessage('søknad.helseopplysninger.registrertFastlege.readMore.text')}
              </ReadMore>
            </>
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
                    'søknad.helseopplysninger.dineBehandlere.editButton'
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
