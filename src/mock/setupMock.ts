import fetchMock from "fetch-mock";
import { meMock } from "./data/me";

fetchMock.config.fallbackToNetwork = true;

fetchMock.get(
  '/aap/api/me',
  {
    status: 200,
    body: meMock
  },
  {
    delay: 1000
  }
);

fetchMock.post(
  '/aap/api/innsending/utland',
  {
    status: 200,
    body: {id: 12345}
  },
  {
    delay: 3000
  }
);

fetchMock.post(
  '/aap/api/lagre/UTLAND',
  {
    status: 200,
    body: {}
  },
  {
    delay: 100
  }
);
fetchMock.get(
  '/aap/api/les/UTLAND',
  {
    status: 200,
    body: {}
  },
  {
    delay: 100
  }
);
