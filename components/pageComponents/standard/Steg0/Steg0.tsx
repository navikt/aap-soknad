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
import { SokerOppslagState } from '../../../../context/sokerOppslagContext';
import { getFulltNavn } from '../../../../lib/søker';
import * as classes from './Steg0.module.css';

interface Props {
  onNext: () => void;
  søker: SokerOppslagState;
}

export const Steg0 = ({ onNext, søker }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();

  return (
    <SøknadFormWrapper
      className={classes?.paddingTop}
      onNext={onNext}
      onDelete={async () => {
        await deleteOpplastedeVedlegg(søknadState.søknad);
        await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
      }}
      nextButtonText={formatMessage('navigation.next')}
      backButtonText={formatMessage('navigation.back')}
      cancelButtonText={formatMessage('navigation.cancel')}
    >
      <IntroduksjonTekst navn={getFulltNavn(søker.søker)} />
    </SøknadFormWrapper>
  );
};
