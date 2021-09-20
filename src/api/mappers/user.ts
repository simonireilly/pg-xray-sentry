// Map a database user into an APIUser

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
