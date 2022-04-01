import { Control, useFieldArray } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { getLinks, GetText } from '../../hooks/useTexts';
import React from 'react';
import { Alert, BodyShort, GuidePanel, Heading, ReadMore } from '@navikt/ds-react';
import FileInput from '../../components/input/FileInput/FileInput';
import TextWithLink from '../../components/TextWithLink';
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
      <GuidePanel>
        <TextWithLink text={getText(`steps.vedlegg.guide`)}>
          {getLinks(`steps.vedlegg.guideLinks`, getText)}
        </TextWithLink>
      </GuidePanel>
      <Heading size="large" level="2">
        {getText('steps.vedlegg.title')}
      </Heading>
      <BodyShort>
        {getText('steps.vedlegg.attachmentListDescription')}
        <ul>
          {vedleggState?.requiredVedlegg?.map((vedlegg, index) => (
            <li key={index}>{vedlegg?.description}</li>
          ))}
        </ul>
      </BodyShort>
      <ReadMore header={getText('steps.vedlegg.taBildeReadMore')} type={'button'}>
        <ScanningGuide getText={getText} />
      </ReadMore>
      <FileInput name={'vedlegg'} fields={fields} append={append} remove={remove} />
      <Alert variant={'info'}>{getText('steps.vedlegg.alertInfo')}</Alert>
    </>
  );
};
export default Vedlegg;
