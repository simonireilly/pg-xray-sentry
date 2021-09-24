// Map a database user into an APIUser

import { Knex } from 'knex';
import { User } from 'knex/types/tables';

type APIUser = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export const mapUser = (user: User): APIUser => ({
  ...{ id: user.id },
  name: user.name,
  createdAt: new Date(user.created_at),
  updatedAt: new Date(user.updated_at),
});

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
