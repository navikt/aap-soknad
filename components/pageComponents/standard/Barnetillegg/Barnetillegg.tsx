import { Alert, BodyShort, Button, Heading } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import { ManuelleBarn, Soknad } from 'types/Soknad';
import * as classes from './Barnetillegg.module.css';
import { Add } from '@navikt/ds-icons';
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { AddBarnModal, CreateOrUpdateManuelleBarn, Relasjon } from './AddBarnModal';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { useIntl } from 'react-intl';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { logSkjemastegFullførtEvent } from 'utils/amplitude';
import { ManueltBarn } from './ManueltBarn';
import { Registerbarn } from './Registerbarn';
import { useSoknad } from 'hooks/SoknadHook';
import { addRequiredVedlegg, updateSøknadData } from 'context/soknadcontext/actions';

interface Props {
  onBackClick: () => void;
}

export const GRUNNBELØP = '118 620';

export const Barnetillegg = ({ onBackClick }: Props) => {
  const { formatMessage } = useIntl();

  const { søknadState, søknadDispatch } = useSoknad();
  const { currentStepIndex, stepWizardDispatch } = useStepWizard();
  const { stepList } = useStepWizard();
  const [selectedBarn, setSelectedBarn] = useState<CreateOrUpdateManuelleBarn>({});
  const [showModal, setShowModal] = useState<boolean>(false);

  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.barn, søknadState.søknad?.manuelleBarn]);

  const erForelderTilManueltBarn =
    søknadState?.søknad?.manuelleBarn &&
    søknadState?.søknad?.manuelleBarn.filter((barn) => barn.relasjon === Relasjon.FORELDER).length >
      0;

  const erFosterforelderTilManueltBarn =
    søknadState?.søknad?.manuelleBarn &&
    søknadState?.søknad?.manuelleBarn.filter((barn) => barn.relasjon === Relasjon.FOSTERFORELDER)
      .length > 0;

  const harManuelleBarn =
    søknadState?.søknad?.manuelleBarn && søknadState.søknad.manuelleBarn.length > 0;
  const harBarn = søknadState?.søknad?.barn && søknadState.søknad.barn.length > 0;

  const appendManuelleBarn = (barn: ManuelleBarn) => {
    updateSøknadData(søknadDispatch, {
      manuelleBarn: [...(søknadState.søknad?.manuelleBarn || []), barn],
    });
    addRequiredVedlegg(
      [
        {
          filterType: barn.relasjon,
          type: barn.internId,
          description: formatMessage(
            { id: `søknad.vedlegg.andreBarn.description.${barn.relasjon}` },
            {
              navn: `${barn?.navn?.fornavn} ${barn?.navn?.etternavn}`,
            },
          ),
        },
      ],
      søknadDispatch,
    );
  };

  const updateManuelleBarn = (updatedBarn: ManuelleBarn) => {
    updateSøknadData(søknadDispatch, {
      manuelleBarn: søknadState.søknad?.manuelleBarn?.map((barn) => {
        if (barn.internId === updatedBarn.internId) {
          return updatedBarn;
        } else {
          return barn;
        }
      }),
    });
  };

  return (
    <>
      <SoknadFormWrapperNew
        onNext={() => {
          logSkjemastegFullførtEvent(currentStepIndex ?? 0);
          completeAndGoToNextStep(stepWizardDispatch);
        }}
        onBack={() => {
          updateSøknadData(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
      >
        <Heading size="large" level="2">
          {formatMessage({ id: 'søknad.barnetillegg.title' })}
        </Heading>
        <LucaGuidePanel>
          <BodyShort spacing>{formatMessage({ id: 'søknad.barnetillegg.guide.text1' })}</BodyShort>
          <BodyShort>{formatMessage({ id: 'søknad.barnetillegg.guide.text2' })}</BodyShort>
        </LucaGuidePanel>
        <div>
          <Heading size="small" level="3" spacing>
            {formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.title' })}
          </Heading>
          {søknadState?.søknad?.barn?.length === 0 && (
            <BodyShort spacing>
              {formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.notfound' })}
            </BodyShort>
          )}
          {søknadState?.søknad?.barn && søknadState?.søknad?.barn?.length > 0 && (
            <ul className={classes.barnList}>
              {søknadState?.søknad?.barn.map((barn, index) => (
                <Registerbarn barn={barn} key={index} />
              ))}
            </ul>
          )}
        </div>
        <div>
          <Heading size="small" level="3" spacing>
            {formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.title' })}
          </Heading>
          {søknadState?.søknad?.manuelleBarn && søknadState?.søknad?.manuelleBarn.length > 0 && (
            <ul className={classes.barnList}>
              {søknadState.søknad.manuelleBarn.map((barn) => (
                <ManueltBarn
                  key={barn.internId}
                  barn={barn}
                  setSelectedBarn={setSelectedBarn}
                  setShowModal={setShowModal}
                />
              ))}
            </ul>
          )}
          <BodyShort spacing>
            {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.description' })}
          </BodyShort>
          <Button
            variant="tertiary"
            type="button"
            icon={<Add title={'Legg til'} />}
            iconPosition={'left'}
            onClick={() => {
              setSelectedBarn({});
              setShowModal(true);
            }}
          >
            {formatMessage({ id: 'søknad.barnetillegg.leggTilBarn.buttonText' })}
          </Button>
        </div>
        {(erForelderTilManueltBarn || erFosterforelderTilManueltBarn) && (
          <Alert variant="info">
            {formatMessage({ id: 'søknad.barnetillegg.alert.leggeVedTekst' })}
            <ul>
              {erForelderTilManueltBarn && (
                <li>
                  {formatMessage({ id: 'søknad.barnetillegg.alert.bulletPointVedleggForelder' })}
                </li>
              )}
              {erFosterforelderTilManueltBarn && (
                <li>
                  {formatMessage({
                    id: 'søknad.barnetillegg.alert.bulletPointVedleggFosterforelder',
                  })}
                </li>
              )}
            </ul>
            {formatMessage({ id: 'søknad.barnetillegg.alert.lasteOppVedleggTekst' })}
          </Alert>
        )}
        {(harBarn || harManuelleBarn) && (
          <Alert variant="info">
            {formatMessage({ id: 'søknad.barnetillegg.alert.barneTillegg.title' })}
            <ul>
              <li>
                {formatMessage({ id: 'søknad.barnetillegg.alert.barneTillegg.bulletpoint3' })}
              </li>
              <li>
                {formatMessage({ id: 'søknad.barnetillegg.alert.barneTillegg.bulletpoint4' })}
              </li>
            </ul>
          </Alert>
        )}
      </SoknadFormWrapperNew>
      <AddBarnModal
        onCloseClick={() => {
          setShowModal(false);
          setSelectedBarn({});
        }}
        appendManuelleBarn={appendManuelleBarn}
        updateManuelleBarn={updateManuelleBarn}
        showModal={showModal}
        barn={selectedBarn}
        setBarn={setSelectedBarn}
      />
    </>
  );
};
