import { Soker } from '../context/sokerOppslagContext';

export const getFulltNavn = (søker: Soker) => {
  return `${søker.navn.fornavn ?? ''} ${søker.navn.mellomnavn ?? ''} ${søker.navn.etternavn ?? ''}`;
};
