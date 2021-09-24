import { SNSHandler } from 'aws-lambda';
import knex from 'knex';
import { User } from 'knex/types/tables';
import fetchCredentials from '../../knex/knexfile';

export const command: SNSHandler = async (event) => {
  console.info('Event received', { event });

  const record = event.Records[0];
  const data = JSON.parse(record.Sns.Message);

  console.info('Received SNS message', { data });

  const credentials = await fetchCredentials();
  const db = knex(credentials);
  let user: User | undefined;

  try {
    user = await db<User>('users').where('id', data.data.user_id).first();
  } catch (e) {
    console.error('Database insert error', e);
  } finally {
    db.destroy();
  }

  console.info('Found user', { user });
};
