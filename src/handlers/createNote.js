const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

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
    const data = JSON.parse(event.body);
    if (!data.title || !data.content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Title and content are required" }),
      };
    }
    const note = {
      id: uuidv4(),
      title: data.title,
      content: data.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await docClient.send(new PutCommand({
      TableName: process.env.NOTES_TABLE,
      Item: note,
    }));
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: "Note created successfully", note }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not create note", details: error.message }),
    };
  }
};