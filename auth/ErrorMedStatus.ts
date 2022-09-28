export class ErrorMedStatus extends Error {
  status: number;
  navCallId: string;
  constructor(message: string, status: number, navCallId = '') {
    super(message);
    this.status = status;
    this.navCallId = navCallId;
  }
}
