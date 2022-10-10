require("./utils/prototypes");

import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import csurf from "csurf";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { ValidationError } from "sequelize";

import routes from "./routes";
import { isProduction } from "./config/server";

import ExtendedError from "./utils/extended-error";

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// only enable CORS in development, when the frontend and backend
// are running on different servers
if (!isProduction) {
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
}

// helmet disables inline scripting by default, which is incompatible
// with the way babel and webpack compile finished React apps
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "lax" : false,
      httpOnly: true,
    },
  })
);

// forcibly upgrade all http requests to https in production
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      res.redirect(`https://${req.get("host")}${req.originalUrl}`);
    } else {
      next();
    }
  });
}

app.use(routes);

app.use((_req, _res, next) => {
  const err = new ExtendedError(
    "The requested resource couldn't be found.",
    ["The requested resource couldn't be found."],
    404
  );
  next(err);
});

app.use(
  (
    err: ValidationError | ExtendedError | any,
    _req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    let newError: ExtendedError;
    if (err instanceof ValidationError) {
      newError = new ExtendedError(
        "Validation error",
        err.errors.map((e) => e.message),
        400
      );
    } else if (!(err instanceof ExtendedError)) {
      console.error(err);
      newError = new ExtendedError("Server Error Status 500", [], 500);
    } else {
      newError = err;
    }
    next(newError);
  }
);

app.use(
  (err: ExtendedError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status);
    res.json({
      title: err.status,
      message: err.message,
      errors: err.errors,
    });
  }
);

export default app;
