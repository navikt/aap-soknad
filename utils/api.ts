export type SøknadsType = 'UTLAND' | 'STANDARD';

export const GYLDIGE_SØKNADS_TYPER = ['UTLAND', 'STANDARD'];

export const erGyldigSøknadsType = (type?: string) =>
  typeof type === 'undefined' || !GYLDIGE_SØKNADS_TYPER.includes(type);
