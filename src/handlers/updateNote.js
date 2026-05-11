const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
};

module.exports.handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const data = JSON.parse(event.body);
    const existing = await docClient.send(new GetCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id },
    }));
    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Note not found" }),
      };
    }
    const result = await docClient.send(new UpdateCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id },
      UpdateExpression: "set title = :title, content = :content, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":title": data.title || existing.Item.title,
        ":content": data.content || existing.Item.content,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    }));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Note updated successfully", note: result.Attributes }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not update note", details: error.message }),
    };
  }
};