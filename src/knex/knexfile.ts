import { secretsManager } from '../utils/aws';
import { Knex } from 'knex';
import { capturePostgres } from 'aws-xray-sdk';

if (process.env.LAMBDA_TASK_ROOT) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  capturePostgres(require('pg'));
}

// Fetch config from secrets manager
async function fetchConfiguration(): Promise<Knex.Config> {
  if (process.env.NODE_ENV === 'test') {
    return {
      client: 'pg',
      connection: {
        user: 'postgres',
        password: 'postgres',
        database: 'postgres',
        host: 'localhost',
        port: 5433,
      },
    };
  } else {
    console.info('Fetching db creds');

    const { SecretString } = await secretsManager
      .getSecretValue({
        SecretId: String(process.env.SECRET_NAME),
      })
      .promise();

    console.info('Have database credentials');

    const credentials = SecretString && JSON.parse(SecretString);

    // Fetch from secrets manager
    return {
      client: 'pg',
      connection: {
        user: credentials.username,
        password: credentials.password,
        database: 'postgres',
        host: credentials.host,
        port: credentials.port,
      },
      acquireConnectionTimeout: 1000,
      pool: { min: 1, max: 1 },
    };
  }
}

// Update with your config settings.
export default async (): Promise<Knex.Config> => {
  const configuration = await fetchConfiguration();

  return {
    migrations: {
      extension: 'ts',
      directory: 'src/knex/migrations',
    },
    ...configuration,
    log: console,
  };
};

declare module 'knex/types/tables' {
  interface User {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }

  interface Tables {
    users: User;

    users_composite: Knex.CompositeTableType<
      User,
      Pick<User, 'name'> & Partial<Pick<User, 'created_at' | 'updated_at'>>,
      Partial<Omit<User, 'id'>>
    >;
  }
}
