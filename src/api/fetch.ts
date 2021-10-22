import { logger } from "../utils/logger";

export async function get<T>(url: string): Promise<T> {
  console.log('Get', url);
  const res = await fetch(url, {credentials: 'include'})

  if (res.ok) {
    try {
      const json = res.json();
      console.log(json);
      return json;
    } catch (error: any) {
      logger.error({
        ...error,
        message: error.message ?? `Ukjent feilmelding fra GET-kall til ${url}`
      });
      throw Error(error)
    }
  }
  // TODO Håndtere 401 ved utgått token? Redirect til login service?
  const textResponse = await res.text();
  logger.error(`GET-kall til ${url} ga statuscode: ${res.status} melding: ${textResponse}`);
  if (res.status === 400) {
    throw new Error(textResponse);
  }
  throw new Error('Ukjent feil, prøv igjen senere.');
}
