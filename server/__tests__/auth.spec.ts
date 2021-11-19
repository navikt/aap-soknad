import { createRequest, createResponse} from "node-mocks-http";
import { Request, Response} from "express";

import {enforceIDPortenAuthenticationMiddleware} from '../src/auth/middleware';
import {loginserviceCallback, redirectToLoginservice} from "../src/auth/loginservice";

jest.mock("../src/auth/idporten");

describe("auth/middleware", () => {
  test("redirect til idporten login hvis authentication mangler", async () => {
    const req = createRequest<Request>();
    const res = createResponse<Response>();
    await enforceIDPortenAuthenticationMiddleware(req, res, () => 'next');
    expect(res.statusCode).toEqual(302);
    expect(res._getRedirectUrl()).toEqual('/oauth2/login?redirect=/');
  });

  test("redirect til idporten login hvis authentication ikke validerer", async () => {
    const req = createRequest<Request>({
      headers: {
        authorization: "Bearer foo",
      },
      cookies: {
        'selvbetjening-idtoken': 'foo'
      }
    });
    const res = createResponse<Response>();
    await enforceIDPortenAuthenticationMiddleware(req, res, () => 'next');
    expect(res.statusCode).toEqual(302);
    expect(res._getRedirectUrl()).toEqual('/oauth2/login?redirect=/');
  });
});

describe("loginservice", () => {

  test("originalUrl i APP_PATH cookie når redirect til loginservice", async () => {
    const req = createRequest<Request>({
      url: '/aap/foo'
    });
    const res = createResponse<Response>();
    redirectToLoginservice(req, res);
    expect(res.cookies.APP_PATH?.value).toEqual('/aap/foo');
  });

  test("redirect til originalUrl fra APP_PATH cookie etter loginservice", () => {
    const req = createRequest<Request>({
      headers: {
        authorization: "Bearer foo",
      },
      cookies: {
        'APP_PATH': '/aap/foo'
      }
    });
    const res = createResponse<Response>();
    loginserviceCallback(req, res);
    expect(res.statusCode).toEqual(302);
    expect(res._getRedirectUrl()).toEqual('/aap/foo');
    expect(res.cookies.APP_PATH?.value).toEqual(' ');
  });
});
