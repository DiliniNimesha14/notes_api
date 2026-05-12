const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const s3 = new S3Client({ region: "us-east-1" });
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
};

// GET presigned URL for upload
module.exports.getUploadUrl = async (event) => {
  try {
    const { noteId, fileType } = JSON.parse(event.body);
    if (!noteId || !fileType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "noteId and fileType are required" })
      };
    }

    const key = `images/${noteId}-${Date.now()}.${fileType.split("/")[1]}`;

    const command = new PutObjectCommand({
      Bucket: process.env.IMAGES_BUCKET,
      Key: key,
      ContentType: fileType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const imageUrl = `https://${process.env.IMAGES_BUCKET}.s3.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ uploadUrl, imageUrl, key })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not generate upload URL", details: error.message })
    };
  }
};

// Save image URL to DynamoDB note
module.exports.saveImageUrl = async (event) => {
  try {
    const { noteId, imageUrl, key } = JSON.parse(event.body);

    const existing = await dynamo.send(new GetCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id: noteId }
    }));

    if (!existing.Item) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Note not found" }) };
    }

    const result = await dynamo.send(new UpdateCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id: noteId },
      UpdateExpression: "set imageUrl = :imageUrl, imageKey = :imageKey, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":imageUrl": imageUrl,
        ":imageKey": key,
        ":updatedAt": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW"
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Image saved successfully", note: result.Attributes })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not save image", details: error.message })
    };
  }
};

// Delete image from S3 and remove from note
module.exports.deleteImage = async (event) => {
  try {
    const { noteId } = event.pathParameters;

    const existing = await dynamo.send(new GetCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id: noteId }
    }));

    if (!existing.Item) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Note not found" }) };
    }

    const imageKey = existing.Item.imageKey;

    if (imageKey) {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.IMAGES_BUCKET,
        Key: imageKey
      }));
    }

    const result = await dynamo.send(new UpdateCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id: noteId },
      UpdateExpression: "remove imageUrl, imageKey set updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":updatedAt": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW"
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Image deleted successfully", note: result.Attributes })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not delete image", details: error.message })
    };
  }
};