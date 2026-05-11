const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
};

module.exports.handler = async () => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: process.env.NOTES_TABLE,
    }));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Notes retrieved successfully",
        count: result.Count,
        notes: result.Items,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not retrieve notes", details: error.message }),
    };
  }
};