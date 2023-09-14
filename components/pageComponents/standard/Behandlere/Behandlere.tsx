import { BodyLong, BodyShort, Button, Heading } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import { Add } from '@navikt/ds-icons';
import { Behandler, Soknad } from 'types/Soknad';
import * as yup from 'yup';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import { EndreEllerLeggTilBehandlerModal } from './EndreEllerLeggTilBehandlerModal';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import * as classes from './Behandlere.module.css';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { updateSøknadData } from 'context/soknadContextCommon';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { JaEllerNei } from 'types/Generic';
import { IntlFormatters, useIntl } from 'react-intl';
import SoknadFormWrapperNew from '../../../SoknadFormWrapper/SoknadFormWrapperNew';
import { SøknadValidationError } from '../../../schema/FormErrorSummaryNew';
import { v4 as uuid4 } from 'uuid';
import { logSkjemastegFullførtEvent } from '../../../../utils/amplitude';
import { validate } from '../../../../lib/utils/validationUtils';
import { setFocusOnErrorSummary } from '../../../schema/FormErrorSummary';
import { RegistrertBehandler } from './RegistrertBehandler';
import { AnnenBehandler } from './AnnenBehandler';

interface Props {
  onBackClick: () => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

export const getBehandlerSchema = (formatMessage: IntlFormatters['formatMessage']) =>
  yup.object().shape({
    registrerteBehandlere: yup.array().of(
      yup.object().shape({
        erRegistrertFastlegeRiktig: yup
          .string()
          .required(
            formatMessage({ id: `søknad.helseopplysninger.erRegistrertFastlegeRiktig.required` })
          )
          .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
          .nullable(),
      })
    ),
  });
export const Behandlere = ({ onBackClick, defaultValues }: Props) => {
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [selectedBehandler, setSelectedBehandler] = useState<Behandler>({});

  const { formatMessage } = useIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { currentStepIndex, stepWizardDispatch } = useStepWizard();
  const { stepList } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.andreBehandlere, søknadState.søknad?.registrerteBehandlere]);

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
          const errors = await validate(getBehandlerSchema(formatMessage), søknadState.søknad);

          if (errors) {
            setErrors(errors);
            setFocusOnErrorSummary();
          } else {
            logSkjemastegFullførtEvent(currentStepIndex ?? 0);
            completeAndGoToNextStep(stepWizardDispatch);
          }
        }}
        onBack={() => {
          updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
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
          {defaultValues?.søknad?.registrerteBehandlere?.length === 0 && (
            <BodyLong>
              {formatMessage({ id: 'søknad.helseopplysninger.registrertFastlege.ingenFastlege' })}
            </BodyLong>
          )}
          {defaultValues?.søknad?.registrerteBehandlere?.map((registrertBehandler, index) => (
            <RegistrertBehandler
              key={registrertBehandler.kontaktinformasjon.behandlerRef}
              index={index}
              registrertBehandler={registrertBehandler}
              clearErrors={clearErrors}
              errorMessage={findError(`registrerteBehandlere[${index}].erRegistrertFastlegeRiktig`)}
            />
          ))}
        </div>
        <div>
          <Heading size={'small'} level={'3'} spacing>
            {formatMessage({ id: 'søknad.helseopplysninger.annenBehandler.title' })}
          </Heading>
          <BodyShort spacing>
            {formatMessage({ id: 'søknad.helseopplysninger.annenBehandler.description' })}
          </BodyShort>
          {defaultValues?.søknad?.andreBehandlere &&
            defaultValues?.søknad?.andreBehandlere?.length > 0 && (
              <>
                <Heading size={'xsmall'} level={'4'} spacing>
                  {formatMessage({ id: 'søknad.helseopplysninger.dineBehandlere.title' })}
                </Heading>
                <ul className={classes?.legeList}>
                  {defaultValues.søknad.andreBehandlere.map((behandler) => (
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
      <EndreEllerLeggTilBehandlerModal
        onCloseClick={() => {
          setShowModal(false);
          setSelectedBehandler({});
        }}
        onSaveClick={(behandler) => {
          if (behandler.id === undefined) {
            append({
              ...behandler,
              id: uuid4(),
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
