const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

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
    const result = await docClient.send(new GetCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id },
    }));
    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Note not found" }),
      };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Note retrieved successfully", note: result.Item }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not retrieve note", details: error.message }),
    };
  }
};