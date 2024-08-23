'use strict';
const DynamoDB = require('aws-sdk/clients/dynamodb');
const documentClient = new DynamoDB.DocumentClient({
  region: 'us-east-1',
  maxRetries: 3,
  httpOptions: { timeout: 5000 },
});
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

module.exports.create = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        id: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    };

    await documentClient.put(params).promise();
    callback(null, {
      statusCode: 201,
      body: JSON.stringify(data),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify(error.message),
    });
  }
};

module.exports.update = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let noteId = event.pathParameters.id;
  let data = JSON.parse(event.body);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        id: noteId,
      },
      UpdateExpression: 'set title = :title, body = :body',
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body,
      },
      ConditionExpression: 'attribute_exists(id)',
    };

    await documentClient.update(params).promise();
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(data),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify(error.message),
    });
  }
};

module.exports.delete = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let noteId = event.pathParameters.id;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        id: noteId,
      },
      ConditionExpression: 'attribute_exists(id)',
    };

    await documentClient.delete(params).promise();
    callback(null, {
      statusCode: 200,
      body: JSON.stringify('Note with id ' + noteId + ' deleted!'),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify(error.message),
    });
  }
};

module.exports.get = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let noteId = event.pathParameters.id;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        id: noteId,
      },
      ConditionExpression: 'attribute_exists(id)',
    };

    const note = await documentClient.get(params).promise();
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(note.Item),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify(error.message),
    });
  }
};

module.exports.getAll = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };

    const notes = await documentClient.scan(params).promise();
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(notes),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify(error.message),
    });
  }
};
