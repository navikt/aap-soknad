import { useFeatureToggleIntl } from '../../../../hooks/useFeatureToggleIntl';
import SøknadFormWrapper from '../../../SoknadFormWrapper/SoknadFormWrapper';
import { setFocusOnErrorSummary } from '../../../schema/FormErrorSummary';
import { slettLagretSoknadState, updateSøknadData } from '../../../../context/soknadContextCommon';
import { Soknad } from '../../../../types/Soknad';
import {
  deleteOpplastedeVedlegg,
  useSoknadContextStandard,
} from '../../../../context/soknadContextStandard';
import { IntroduksjonTekst } from '../../../IntroduksjonTekst/IntroduksjonTekst';

interface Props {
  onNext: () => void;
}

export const Steg0 = ({ onNext }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();

  return (
    <SøknadFormWrapper
      onNext={onNext}
      onDelete={async () => {
        await deleteOpplastedeVedlegg(søknadState.søknad);
        await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
      }}
      nextButtonText={formatMessage('navigation.next')}
      backButtonText={formatMessage('navigation.back')}
      cancelButtonText={formatMessage('navigation.cancel')}
    >
      <IntroduksjonTekst navn={''} />
    </SøknadFormWrapper>
  );
};
