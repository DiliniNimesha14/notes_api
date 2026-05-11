const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

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
    await docClient.send(new DeleteCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id },
    }));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Note deleted successfully", id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not delete note", details: error.message }),
    };
  }
};