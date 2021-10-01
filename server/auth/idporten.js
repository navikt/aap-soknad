"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.validerToken = void 0;
var openid_client_1 = require("openid-client");
var verify_1 = require("jose/jwt/verify");
var remote_1 = require("jose/jwks/remote");
var _issuer;
var _remoteJWKSet;
function validerToken(token) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, _b;
    var _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _a = verify_1.jwtVerify;
          _b = [token];
          return [4 /*yield*/, jwks()];
        case 1:
          _b = _b.concat([_d.sent()]);
          _c = {};
          return [4 /*yield*/, issuer()];
        case 2:
          return [
            2 /*return*/,
            _a.apply(
              void 0,
              _b.concat([((_c.issuer = _d.sent().metadata.issuer), _c)])
            ),
          ];
      }
    });
  });
}
exports.validerToken = validerToken;
function jwks() {
  return __awaiter(this, void 0, void 0, function () {
    var iss;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (!(typeof _remoteJWKSet === "undefined")) return [3 /*break*/, 2];
          return [4 /*yield*/, issuer()];
        case 1:
          iss = _a.sent();
          _remoteJWKSet = (0, remote_1.createRemoteJWKSet)(
            new URL(iss.metadata.jwks_uri)
          );
          _a.label = 2;
        case 2:
          return [2 /*return*/, _remoteJWKSet];
      }
    });
  });
}
function issuer() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (!(typeof _issuer === "undefined")) return [3 /*break*/, 2];
          if (!process.env.IDPORTEN_WELL_KNOWN_URL)
            throw new Error(
              'Milj\u00F8variabelen "IDPORTEN_WELL_KNOWN_URL" m\u00E5 v\u00E6re satt'
            );
          return [
            4 /*yield*/,
            openid_client_1.Issuer.discover(
              process.env.IDPORTEN_WELL_KNOWN_URL
            ),
          ];
        case 1:
          _issuer = _a.sent();
          _a.label = 2;
        case 2:
          return [2 /*return*/, _issuer];
      }
    });
  });
}
exports.default = {
  validerToken: validerToken,
};
