import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import axios from 'axios';
import { mapUser } from '../api/mappers/user';
import { dynamoDB } from '../utils/aws';

// Knex with migrations
import knex from 'knex';
import { User } from 'knex/types/tables';
import fetchCredentials from '../knex/knexfile';
import * as migrations from '../knex/migrations/20210919172112_create_user_table';

export const controller: APIGatewayProxyHandlerV2 = async () => {
  // XRAY tracing a HTTP request
  await axios.get('https://google.com');

  // XRAY AWS SDK Tracing
  await dynamoDB
    .putItem({
      TableName: String(process.env.TABLE_NAME),
      Item: {
        pk: { S: (Math.random() + 1).toString(36).substring(7) },
        sk: { S: (Math.random() + 1).toString(36).substring(7) },
      },
    })
    .promise();

  // XRAY tracing a database
  const credentials = await fetchCredentials();
  const db = knex(credentials);
  await migrations.up(db);

  let user: User[] | null = null;

  try {
    user = await db('users')
      .insert({
        name: 'Simon',
      })
      .returning('*');
  } catch (e) {
    console.error('Database insert error', e);
  } finally {
    db.destroy();
  }

  if (user === null) {
    return {
      statusCode: 422,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Failed to create user',
      }),
    };
  }

  const apiUser = mapUser(user[0]);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiUser),
  };
};
