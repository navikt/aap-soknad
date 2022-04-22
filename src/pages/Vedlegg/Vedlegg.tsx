import { Control, useFieldArray } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { GetText } from '../../hooks/useTexts';
import React from 'react';
import { Alert, BodyShort, GuidePanel, Heading, Label, ReadMore } from '@navikt/ds-react';
import FileInput from '../../components/input/FileInput/FileInput';
import { useVedleggContext } from '../../context/vedleggContext';
import ScanningGuide from '../../components/ScanningGuide/ScanningGuide';

interface Props {
  control: Control<SoknadStandard>;
  getText: GetText;
}

const Vedlegg = ({ getText, control }: Props) => {
  const { vedleggState } = useVedleggContext();
  const { fields, append, remove } = useFieldArray({
    name: 'vedlegg',
    control,
  });
  return (
    <>
      <Heading size="large" level="2">
        {getText('steps.vedlegg.title')}
      </Heading>
      <GuidePanel>
        <BodyShort>{getText(`steps.vedlegg.guide`)}</BodyShort>
      </GuidePanel>
      <BodyShort>
        {vedleggState?.requiredVedlegg?.length > 0 ? (
          <Label>{getText('steps.vedlegg.attachmentListDescription')}</Label>
        ) : (
          <Label>Ut fra dine svar har vi ikke registrert noen vedlegg som må lastes opp</Label>
        )}
        <ReadMore header={'Kan jeg laste opp andre vedlegg?'} type={'button'}>
          {'Hvis du har noe annet du også ønsker å legge ved, kan du også laste opp dette her.'}
        </ReadMore>
        <ul>
          {vedleggState?.requiredVedlegg?.map((vedlegg, index) => (
            <li key={index}>{vedlegg?.description}</li>
          ))}
        </ul>
      </BodyShort>
      <BodyShort>{getText('steps.vedlegg.taBildeInfo')}</BodyShort>
      <ReadMore header={getText('steps.vedlegg.taBildeReadMore')} type={'button'}>
        <ScanningGuide getText={getText} />
      </ReadMore>
      <FileInput name={'vedlegg'} fields={fields} append={append} remove={remove} />
      <Alert variant={'info'}>{getText('steps.vedlegg.alertInfo')}</Alert>
    </>
  );
};
export default Vedlegg;
