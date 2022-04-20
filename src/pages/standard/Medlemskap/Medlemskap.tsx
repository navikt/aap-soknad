import {
  BodyShort,
  Radio,
  Button,
  Table,
  BodyLong,
  GuidePanel,
  Heading,
  ReadMore,
} from '@navikt/ds-react';
import React, { useState, useEffect, useMemo } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { JaEllerNei, JaNeiVetIkke } from '../../../types/Generic';
import { Add, Delete } from '@navikt/ds-icons';
import UtenlandsPeriodeVelger from '..//UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { formatDate } from '../../../utils/date';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import Soknad from '../../../types/Soknad';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { setSøknadData, useSoknadContext } from '../../../context/soknadContext';

interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}
const UTENLANDSOPPHOLD = 'utenlandsOpphold';
const BODD_I_NORGE = 'harBoddINorgeSiste5År';
const ARBEID_UTENFOR_NORGE_FØR_SYKDOM = 'arbeidetUtenforNorgeFørSykdom';
const ARBEID_I_NORGE = 'harArbeidetINorgeSiste5År';
const MEDLEMSKAP = 'medlemskap';
const validateArbeidINorge = (boddINorge: JaEllerNei) => boddINorge === JaEllerNei.NEI;
const validateArbeidUtenforNorgeFørSykdom = (boddINorge: JaEllerNei, arbeidINorge: JaEllerNei) =>
  boddINorge === JaEllerNei.JA || arbeidINorge === JaEllerNei.JA;
const validateUtenlandsPeriode = (arbeidINorge: JaEllerNei, arbeidUtenforNorge: JaEllerNei) => {
  return arbeidUtenforNorge === JaEllerNei.JA || arbeidINorge === JaEllerNei.NEI;
};

export const Medlemskap = ({ getText, onBackClick, onCancelClick, søknad }: Props) => {
  const schema = yup.object().shape({
    [MEDLEMSKAP]: yup.object().shape({
      [BODD_I_NORGE]: yup
        .string()
        .required(getText('form.medlemskap.boddINorge.required'))
        .oneOf([JaNeiVetIkke.JA, JaNeiVetIkke.NEI], getText('form.medlemskap.boddINorge.required'))
        .typeError(getText('form.medlemskap.boddINorge.required')),
      [ARBEID_I_NORGE]: yup.string().when(BODD_I_NORGE, {
        is: validateArbeidINorge,
        then: (yupSchema) =>
          yupSchema
            .required(getText('form.medlemskap.arbeidINorge.required'))
            .oneOf(
              [JaNeiVetIkke.JA, JaNeiVetIkke.NEI],
              getText('form.medlemskap.arbeidINorge.required')
            ),
        otherwise: (yupSchema) => yupSchema.notRequired(),
      }),
      [ARBEID_UTENFOR_NORGE_FØR_SYKDOM]: yup.string().when([BODD_I_NORGE, ARBEID_I_NORGE], {
        is: validateArbeidUtenforNorgeFørSykdom,
        then: (yupSchema) =>
          yupSchema
            .required()
            .oneOf(
              [JaNeiVetIkke.JA, JaNeiVetIkke.NEI],
              getText('form.medlemskap.arbeidUtenforNorge.required')
            ),
        otherwise: (yupSchema) => yupSchema.notRequired(),
      }),
      // [UTENLANDSOPPHOLD]: yup
      //   .array()
      //   .notRequired()
      //   .when(ARBEID_I_NORGE, {
      //     is: validateUtenlandsPeriode,
      //     then: (yupSchema) => yupSchema.min(1, 'Legg til utenlandsopphold'),
      //     otherwise: (yupSchema) => yupSchema.notRequired(),
      //   }),
    }),
  });
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [`${MEDLEMSKAP}.${UTENLANDSOPPHOLD}`]: søknad?.medlemskap?.utenlandsOpphold || [],
    },
  });
  const [showUtenlandsPeriodeModal, setShowUtenlandsPeriodeModal] = useState<boolean>(false);
  const { fields, append, remove } = useFieldArray({
    name: `${MEDLEMSKAP}.${UTENLANDSOPPHOLD}`,
    control,
  });
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const boddINorge = watch(`${MEDLEMSKAP}.${BODD_I_NORGE}`);
  const arbeidINorge = watch(`${MEDLEMSKAP}.${ARBEID_I_NORGE}`);
  const arbeidUtenforNorge = watch(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`);
  const showArbeidINorge = useMemo(() => validateArbeidINorge(boddINorge), [boddINorge]);
  const showArbeidUtenforNorgeFørSykdom = useMemo(
    () => validateArbeidUtenforNorgeFørSykdom(boddINorge, arbeidINorge),
    [boddINorge, arbeidINorge]
  );
  const showLeggTilUtenlandsPeriode = useMemo(
    () => validateUtenlandsPeriode(arbeidINorge, arbeidUtenforNorge),
    [arbeidINorge, arbeidUtenforNorge]
  );
  const hideArbeidInUtenlandsPeriode = useMemo(() => {
    if (boddINorge === JaEllerNei.NEI && arbeidINorge === JaEllerNei.NEI) {
      return false;
    }
    return true;
  }, [boddINorge, arbeidINorge]);
  useEffect(() => {
    setValue(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`, undefined);
    setValue(`${MEDLEMSKAP}.${ARBEID_I_NORGE}`, undefined);
    remove();
  }, [boddINorge]);
  useEffect(() => {
    setValue(`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`, undefined);
    remove();
  }, [arbeidINorge]);
  useEffect(() => {
    if (arbeidUtenforNorge) remove();
  }, [arbeidUtenforNorge]);
  const utenlandsPeriodeInfo = useMemo(
    () =>
      arbeidUtenforNorge === JaEllerNei.JA
        ? getText('steps.medlemskap.utenlandsPeriode.infoJaJa')
        : getText('steps.medlemskap.utenlandsPeriode.info'),
    [arbeidUtenforNorge]
  );
  return (
    <>
      <SoknadFormWrapper
        onNext={handleSubmit((data) => {
          setSøknadData(søknadDispatch, data);
          completeAndGoToNextStep(stepWizardDispatch);
        })}
        onBack={() => onBackClick()}
        onCancel={() => onCancelClick()}
        nextButtonText={'Neste steg'}
        backButtonText={'Forrige steg'}
        cancelButtonText={'Avbryt søknad'}
        errors={errors}
      >
        <Heading size="large" level="2">
          {getText('steps.medlemskap.title')}
        </Heading>
        <GuidePanel>
          {getText(`steps.medlemskap.guide`)}
          <ul>
            <li>{getText('steps.medlemskap.guideBullet1')}</li>
            <li>{getText('steps.medlemskap.guideBullet2')}</li>
          </ul>
        </GuidePanel>
        <RadioGroupWrapper
          name={`${MEDLEMSKAP}.${BODD_I_NORGE}`}
          legend={getText('form.medlemskap.boddINorge.legend')}
          control={control}
          error={errors?.[MEDLEMSKAP]?.[BODD_I_NORGE]?.message}
        >
          <ReadMore header={getText('steps.medlemskap.boddINorgeReadMore.title')} type={'button'}>
            {getText('steps.medlemskap.boddINorgeReadMore.text')}
            <ul>
              <li>{getText('steps.medlemskap.boddINorgeReadMore.bullet1')}</li>
              <li>{getText('steps.medlemskap.boddINorgeReadMore.bullet2')}</li>
            </ul>
          </ReadMore>
          <Radio value={JaEllerNei.JA}>
            <BodyShort>Ja</BodyShort>
          </Radio>
          <Radio value={JaEllerNei.NEI}>
            <BodyShort>Nei</BodyShort>
          </Radio>
        </RadioGroupWrapper>
        {showArbeidINorge && (
          <RadioGroupWrapper
            name={`${MEDLEMSKAP}.${ARBEID_I_NORGE}`}
            legend={getText('form.medlemskap.arbeidINorge.legend')}
            control={control}
            error={errors?.[MEDLEMSKAP]?.[ARBEID_I_NORGE]?.message}
          >
            <ReadMore
              header={getText('steps.medlemskap.andreYtelserReadMore.title')}
              type={'button'}
            >
              <BodyLong>{getText('steps.medlemskap.andreYtelserReadMore.text')}</BodyLong>
            </ReadMore>
            <Radio value={JaEllerNei.JA}>
              <BodyShort>Ja</BodyShort>
            </Radio>
            <Radio value={JaEllerNei.NEI}>
              <BodyShort>Nei</BodyShort>
            </Radio>
          </RadioGroupWrapper>
        )}
        {showArbeidUtenforNorgeFørSykdom && (
          <RadioGroupWrapper
            name={`${MEDLEMSKAP}.${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`}
            legend={getText('form.medlemskap.arbeidUtenforNorge.legend')}
            control={control}
            error={errors?.[MEDLEMSKAP]?.[ARBEID_UTENFOR_NORGE_FØR_SYKDOM]?.message}
          >
            <ReadMore
              header={getText('form.medlemskap.arbeidUtenforNorge.readMore.header')}
              type={'button'}
            >
              <BodyLong>{getText('form.medlemskap.arbeidUtenforNorge.readMore.text')}</BodyLong>
            </ReadMore>
            <Radio value={JaEllerNei.JA}>
              <BodyShort>Ja</BodyShort>
            </Radio>
            <Radio value={JaEllerNei.NEI}>
              <BodyShort>Nei</BodyShort>
            </Radio>
          </RadioGroupWrapper>
        )}

        {showLeggTilUtenlandsPeriode && <BodyLong>{utenlandsPeriodeInfo}</BodyLong>}
        {fields?.length > 0 && (
          <Heading size="xsmall" level="3">
            {getText('steps.medlemskap.perioderHeading')}
          </Heading>
        )}
        {fields?.map((field, index) => (
          <Table.Row key={field.id}>
            <Table.DataCell>{`${field?.land?.split(':')?.[1]} ${formatDate(
              field?.fraDato,
              'dd.MM.yyyy'
            )} - ${formatDate(field?.tilDato, 'dd.MM.yyyy')}${
              field?.iArbeid ? ' (Jobb)' : ''
            }`}</Table.DataCell>
            <Table.DataCell>{<Delete onClick={() => remove(index)} />}</Table.DataCell>
          </Table.Row>
        ))}
        {showLeggTilUtenlandsPeriode && (
          <Button
            variant="tertiary"
            type="button"
            onClick={() => setShowUtenlandsPeriodeModal(true)}
          >
            <Add />
            Legg til utenlandsopphold
          </Button>
        )}
        {errors?.[MEDLEMSKAP]?.[UTENLANDSOPPHOLD]?.message && (
          <div className={'navds-error-message navds-error-message--medium navds-label'}>
            {errors?.[MEDLEMSKAP]?.[UTENLANDSOPPHOLD]?.message}
          </div>
        )}
      </SoknadFormWrapper>
      <UtenlandsPeriodeVelger
        open={showUtenlandsPeriodeModal}
        onSave={(data) => {
          append({ ...data });
          setShowUtenlandsPeriodeModal(false);
        }}
        hideIArbeid={hideArbeidInUtenlandsPeriode}
        onCancel={() => setShowUtenlandsPeriodeModal(false)}
        onClose={() => setShowUtenlandsPeriodeModal(false)}
        getText={getText}
        heading={getText('steps.medlemskap.utenlandsPeriode.title')}
        ingress={utenlandsPeriodeInfo}
      />
    </>
  );
};
