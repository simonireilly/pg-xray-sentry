import fetchCredentials from '../knexfile';
import knex from 'knex';

export const provisionDatabase = async (
  databaseName: string
): Promise<void> => {
  const credentials = await fetchCredentials();

  console.info('Attempting to connect to database', {
    database: credentials.connection.database,
  });
  const db = knex(credentials);

  // Create the database
  console.info('Attempting to create database', {
    databaseName: databaseName,
  });

  try {
    await db.raw(`CREATE DATABASE ${databaseName};`);
  } catch (e) {
    console.error('Error while creating database', e);
  }

  console.info('Closing database connection to database', {
    database: credentials.connection.database,
  });

  await db.destroy();

  credentials.connection.database = databaseName;

  // Connect to the database and run migrations
  //
  // TODO: Should we be doing this here?
  //
  // I dont think so, we should probably run migrations
  // separate to the database creation
  console.info('Attempting to connect to database', {
    database: credentials.connection.database,
  });
  const database = knex(credentials);

  console.info('Attempting to migrate the database', {
    database: credentials.connection.database,
  });

  try {
    await database.migrate.latest();
  } catch (err) {
    console.error('Error migrating the database', { err });
  }

  await database.destroy();

  return;
};
