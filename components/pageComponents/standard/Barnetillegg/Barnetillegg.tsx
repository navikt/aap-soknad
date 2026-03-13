'use client';
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
import { useTranslations } from 'next-intl';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { ManueltBarn } from './ManueltBarn';
import { Registerbarn } from './Registerbarn';
import { useSoknad } from 'hooks/SoknadHook';
import { addRequiredVedlegg, updateSøknadData } from 'context/soknadcontext/actions';

interface Props {
  onBackClick: () => void;
}

export const GRUNNBELØP = '118 620';

export const Barnetillegg = ({ onBackClick }: Props) => {
  const t = useTranslations();

  const { søknadState, søknadDispatch } = useSoknad();
  const { stepWizardDispatch } = useStepWizard();
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
          description: t(
            `søknad.vedlegg.andreBarn.description.${barn.relasjon}`,
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
          completeAndGoToNextStep(stepWizardDispatch);
        }}
        onBack={() => {
          updateSøknadData(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
      >
        <Heading size="large" level="2">
          {t('søknad.barnetillegg.title')}
        </Heading>
        <LucaGuidePanel>
          <BodyShort spacing>{t('søknad.barnetillegg.guide.text1')}</BodyShort>
          <BodyShort>{t('søknad.barnetillegg.guide.text2')}</BodyShort>
        </LucaGuidePanel>
        <div>
          <Heading size="small" level="3" spacing>
            {t('søknad.barnetillegg.registrerteBarn.title')}
          </Heading>
          {søknadState?.søknad?.barn?.length === 0 && (
            <BodyShort spacing>
              {t('søknad.barnetillegg.registrerteBarn.notfound')}
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
            {t('søknad.barnetillegg.manuelleBarn.title')}
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
            {t('søknad.barnetillegg.leggTilBarn.description')}
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
            {t('søknad.barnetillegg.leggTilBarn.buttonText')}
          </Button>
        </div>
        {(erForelderTilManueltBarn || erFosterforelderTilManueltBarn) && (
          <Alert variant="info">
            {t('søknad.barnetillegg.alert.leggeVedTekst')}
            <ul>
              {erForelderTilManueltBarn && (
                <li>
                  {t('søknad.barnetillegg.alert.bulletPointVedleggForelder')}
                </li>
              )}
              {erFosterforelderTilManueltBarn && (
                <li>
                  {t('søknad.barnetillegg.alert.bulletPointVedleggFosterforelder')}
                </li>
              )}
            </ul>
            {t('søknad.barnetillegg.alert.lasteOppVedleggTekst')}
          </Alert>
        )}
        {(harBarn || harManuelleBarn) && (
          <Alert variant="info">
            {t('søknad.barnetillegg.alert.barneTillegg.title')}
            <ul>
              <li>
                {t('søknad.barnetillegg.alert.barneTillegg.bulletpoint3')}
              </li>
              <li>
                {t('søknad.barnetillegg.alert.barneTillegg.bulletpoint4')}
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
