/**
 * Required External Modules
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { clientOrigins, serverPort } from "./config/env.dev.js";

import { messagesRouter } from "./messages/messages.router.js";
import { listingsRouter } from "./api-calls/listings.router.js";
import { usersRouter } from "./api-calls/users.router.js";

/**
 * App Variables
 */
const app = express();
const apiRouter = express.Router();

/**
 *  App Configuration
 */

app.use(helmet());
app.use(cors({ origin: clientOrigins }));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/api", apiRouter);

apiRouter.use("/messages", messagesRouter);
apiRouter.use("/listings", listingsRouter);
apiRouter.use("/users", usersRouter);

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send(err.message);
});

/**
 * Server Activation
 */

app.listen(serverPort, () =>
  console.log(`API Server listening on port ${serverPort}`)
);
