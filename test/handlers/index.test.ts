/**
 * @jest-environment node
 */
process.env.AWS_REGION = 'local';

import { api } from '../../src/handlers';

import { Knex, knex } from 'knex';
import fetchCredentials from '../../src/knex/knexfile';
import * as nock from 'nock';
import { clean as databaseCleaner } from 'knex-cleaner';
import { eventFactory, contextFactory } from '../../.jest/models/aws';

let db: Knex;

jest.setTimeout(30000);

describe('controller test', () => {
  beforeAll(async () => {
    const creds = await fetchCredentials();
    db = knex(creds);
    await db.migrate.latest();
  });

  beforeEach(async () => {
    jest.resetModules();

    nock.disableNetConnect();
    await databaseCleaner(db, {
      mode: 'truncate',
      ignoreTables: ['knex_migrations', 'knex_migrations_lock'],
      restartIdentity: true,
    });
  });

  afterAll(async () => {
    await db.migrate.down();
    return db.destroy();
  });

  it('accesses the db', async () => {
    // Nock network calls
    nock('https://example.com').get('/').reply(200);
    nock('https://dynamodb.local.amazonaws.com').options('/').reply(201);
    nock('https://dynamodb.local.amazonaws.com').post('/').reply(201);

    // Use fixtures for invoking integration
    const response = await api(
      eventFactory.build(),
      contextFactory.build(),
      () => {}
    );

    // @ts-ignore
    expect(response.statusCode).toEqual(200);
    // @ts-ignore
    expect(JSON.parse(response.body)).toEqual(
      expect.objectContaining({
        name: 'Simon',
        id: 1,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    );
  });
});
