#!/usr/bin/env node
import app from './app';
import { port } from './config/server';
import db from '../db/models';

(async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ alter: true });
    app.listen(port, () => {
      console.log(`App:${port} UP`);
    });
  } catch (err) {
    console.log(`Failed to instantiate app on port ${port}`);
    console.error(err);
    console.error(err.toString());
  }
})();
