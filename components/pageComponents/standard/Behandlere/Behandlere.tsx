'use client';
import { BodyLong, BodyShort, Button, Heading } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import { Add } from '@navikt/ds-icons';
import { Behandler, Soknad } from 'types/Soknad';
import * as yup from 'yup';
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { EndreEllerLeggTilBehandlerModal } from './EndreEllerLeggTilBehandlerModal';
import * as classes from './Behandlere.module.css';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { JaEllerNei } from 'types/Generic';
import { useTranslations } from 'next-intl';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { setFocusOnErrorSummary, SøknadValidationError } from 'components/schema/FormErrorSummary';
import { validate } from 'lib/utils/validationUtils';
import { RegistrertBehandler } from 'components/pageComponents/standard/Behandlere/RegistrertBehandler';
import { AnnenBehandler } from 'components/pageComponents/standard/Behandlere/AnnenBehandler';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';
import { LucaGuidePanel } from 'components/LucaGuidePanel';

interface Props {
  onBackClick: () => void;
}

export const getBehandlerSchema = (t: (id: string, values?: Record<string, any>) => string) =>
  yup.object().shape({
    fastlege: yup.array().of(
      yup.object().shape({
        erRegistrertFastlegeRiktig: yup
          .string()
          .required(
            t(`søknad.helseopplysninger.erRegistrertFastlegeRiktig.required`),
          )
          .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
          .nullable(),
      }),
    ),
  });
export const Behandlere = ({ onBackClick }: Props) => {
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [selectedBehandler, setSelectedBehandler] = useState<Behandler>({});

  const t = useTranslations();
  const { søknadState, søknadDispatch } = useSoknad();
  const { stepWizardDispatch } = useStepWizard();
  const { stepList } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.andreBehandlere, søknadState.søknad?.fastlege]);

  function clearErrors() {
    setErrors(undefined);
  }
  const findError = (path: string) => errors?.find((error) => error.path === path)?.message;

  const append = (behandler: Behandler) => {
    updateSøknadData(søknadDispatch, {
      andreBehandlere: [...(søknadState.søknad?.andreBehandlere || []), behandler],
    });
  };

  const update = (updatedBehandler: Behandler) => {
    updateSøknadData(søknadDispatch, {
      andreBehandlere: søknadState.søknad?.andreBehandlere?.map((behandler) => {
        if (behandler.id === updatedBehandler.id) {
          return updatedBehandler;
        } else {
          return behandler;
        }
      }),
    });
  };

  return (
    <>
      <SoknadFormWrapperNew
        onNext={async () => {
          const errors = await validate(getBehandlerSchema(t), søknadState.søknad);

          if (errors) {
            setErrors(errors);
            setFocusOnErrorSummary();
          } else {
            completeAndGoToNextStep(stepWizardDispatch);
          }
        }}
        onBack={() => {
          updateSøknadData(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
        errors={errors}
      >
        <Heading size="large" level="2">
          {t('søknad.helseopplysninger.title')}
        </Heading>
        <LucaGuidePanel>
          <BodyShort spacing>
            {t('søknad.helseopplysninger.guide.text1')}
          </BodyShort>
          <BodyShort spacing>
            {t('søknad.helseopplysninger.guide.text2')}
          </BodyShort>
        </LucaGuidePanel>
        <div>
          <Heading size={'small'} level={'3'}>
            {t('søknad.helseopplysninger.registrertFastlege.title')}
          </Heading>
          {søknadState?.søknad?.fastlege?.length === 0 && (
            <BodyLong>
              {t('søknad.helseopplysninger.registrertFastlege.ingenFastlege')}
            </BodyLong>
          )}
          {søknadState?.søknad?.fastlege?.map((fastlege, index) => (
            <RegistrertBehandler
              key={fastlege.behandlerRef}
              index={index}
              fastlege={fastlege}
              clearErrors={clearErrors}
              errorMessage={findError(`fastlege[${index}].erRegistrertFastlegeRiktig`)}
            />
          ))}
        </div>
        <div>
          <Heading size={'small'} level={'3'} spacing>
            {t('søknad.helseopplysninger.annenBehandler.title')}
          </Heading>
          <BodyShort spacing>
            {t('søknad.helseopplysninger.annenBehandler.description')}
          </BodyShort>
          {søknadState?.søknad?.andreBehandlere &&
            søknadState?.søknad?.andreBehandlere?.length > 0 && (
              <>
                <Heading size={'xsmall'} level={'4'} spacing>
                  {t('søknad.helseopplysninger.dineBehandlere.title')}
                </Heading>
                <ul className={classes?.legeList}>
                  {søknadState.søknad.andreBehandlere.map((behandler) => (
                    <AnnenBehandler
                      key={behandler.id}
                      behandler={behandler}
                      setSelectedBehandler={setSelectedBehandler}
                      setShowModal={setShowModal}
                    />
                  ))}
                </ul>
              </>
            )}

          <Button
            variant="tertiary"
            type="button"
            icon={
              <Add
                title={t('søknad.helseopplysninger.annenBehandler.accessibleButtonTitle')}
              />
            }
            iconPosition={'left'}
            onClick={() => {
              setSelectedBehandler({});
              setShowModal(true);
            }}
          >
            {t('søknad.helseopplysninger.annenBehandler.addBehandlerButton')}
          </Button>
        </div>
      </SoknadFormWrapperNew>
      <EndreEllerLeggTilBehandlerModal
        onCloseClick={() => {
          setShowModal(false);
          setSelectedBehandler({});
        }}
        onSaveClick={(behandler) => {
          if (behandler.id === undefined) {
            append({
              ...behandler,
              id: crypto.randomUUID(),
            });
          } else {
            update(behandler);
          }
        }}
        showModal={showModal}
        behandler={selectedBehandler}
        setBehandler={setSelectedBehandler}
      />
    </>
  );
};
