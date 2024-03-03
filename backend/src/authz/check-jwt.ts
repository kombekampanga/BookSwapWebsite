import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import { domain, audience } from "../config/env.dev.js";

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${domain}/.well-known/jwks.json`,
  }),

  audience: audience,
  issuer: `https://${domain}/`,
  algorithms: ["RS256"],
});

export {
  checkJwt,
};
