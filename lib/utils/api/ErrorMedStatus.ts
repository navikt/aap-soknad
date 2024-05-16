// TODO: Errorcode og developerMessage vil returneres fra innsending og oppslag etterhvert.
// Her må vi støtte begge deler parallelt i en periode.

export class ErrorMedStatus extends Error {
  status: number;
  developerMessage?: string;
  errorCode?: string;
  navCallId?: string;
  constructor(
    message: string,
    status: number,
    navCallId = '',
    developerMessage = '',
    errorCode = '',
  ) {
    super(message);
    this.status = status;
    this.developerMessage = developerMessage;
    this.errorCode = errorCode;
    this.navCallId = navCallId;
  }
}
