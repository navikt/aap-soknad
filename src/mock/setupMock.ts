import fetchMock from "fetch-mock";
import { meMock } from "./data/me";

fetchMock.config.fallbackToNetwork = true;

fetchMock.get(
  '/aap/soknad-api/me',
  {
    status: 200,
    body: meMock
  },
  {
    delay: 1000
  }
);

fetchMock.post(
  '/aap/soknad-api/innsending/utland',
  {
    status: 200,
    body: {id: 12345}
  },
  {
    delay: 3000
  }
);

fetchMock.post(
  '/aap/soknad-api/buckets/lagre/UTLAND',
  {
    status: 200,
    body: {}
  },
  {
    delay: 100
  }
);
fetchMock.get(
  '/aap/soknad-api/buckets/les/UTLAND',
  {
    status: 200,
    body: {}
  },
  {
    delay: 100
  }
);

fetchMock.post(
  '/aap/soknad-api/innsending/soknad',
  {
    status: 200,
    body: {}
  },
  {
    delay: 2000
  }
)
