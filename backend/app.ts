require('./utils/prototypes');

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import csurf from 'csurf';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { ValidationError } from 'sequelize';

import routes from './routes';
import { isProduction } from './config/server';

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// only enable CORS in development, when the frontend and backend
// are running on different servers
if (!isProduction) {
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
}

// helmet disables inline scripting by default, which is incompatible
// with the way babel and webpack compile finished React apps
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? 'lax' : false,
      httpOnly: true
    }
  })
);

// forcibly upgrade all http requests to https in production
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(`https://${req.get('host')}${req.originalUrl}`);
    } else {
      next();
    }
  });
}

app.use(routes);

app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = 'Resource Not Found';
  err.errors = ["The requested resource couldn't be found."];
  err.status = 404;
  next(err);
});

app.use((err, _req, _res, next) => {
  if (err instanceof ValidationError) {
    err.errors = err.errors.map(e => e.message);
    err.title = 'Validation error';
    err.status = 400;
  }
  next(err);
});

app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack
  });
});

export default app;
