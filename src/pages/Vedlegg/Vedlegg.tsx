import { Control, useFieldArray } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { getLinks, GetText } from '../../hooks/useTexts';
import React from 'react';
import { Alert, BodyShort, GuidePanel, Heading, ReadMore } from '@navikt/ds-react';
import FileInput from '../../components/input/FileInput/FileInput';
import TextWithLink from '../../components/TextWithLink';

interface Props {
  control: Control<SoknadStandard>;
  getText: GetText;
}

const Vedlegg = ({ getText, control }: Props) => {
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
      <BodyShort>{'Dette er dokumentene du må legge ved søknaden'}</BodyShort>
      <ul>
        <li>{'Arbeidsgiver evt. kopi av inngått sluttpakke'}</li>
        <li>{'Omso'}</li>
      </ul>
      <ReadMore header={'Slik tar du et godt bilde av dokumentet'} type={'button'}>
        <Alert variant={'info'}>{'Gjør sånn her...'}</Alert>
      </ReadMore>
      <FileInput name={'vedlegg'} fields={fields} append={append} remove={remove} />
      <Alert variant={'info'}>{getText('steps.vedlegg.alertInfo')}</Alert>
    </>
  );
};
export default Vedlegg;
