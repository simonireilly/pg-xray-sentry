import { Knex } from 'knex';
import { join } from 'path';

// Fetch config from secrets manager
async function fetchConfiguration(): Promise<Knex.Config> {
  if (!process.env.LAMBDA_TASK_ROOT) {
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
    // Fetch from secrets manager
    return {};
  }
}

// Update with your config settings.
export default async (): Promise<Knex.Config> => {
  const configuration = await fetchConfiguration();

  return {
    ...configuration,
    migrations: {
      extension: 'ts',
      directory: 'src/knex/migrations',
    },
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
