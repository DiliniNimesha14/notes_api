# Notes API - Serverless AWS

A simple CRUD REST API built with AWS Serverless architecture.

## Architecture
Client → API Gateway → AWS Lambda → DynamoDB

## AWS Services Used
- **API Gateway** - HTTP endpoints
- **AWS Lambda** - Serverless functions (Node.js 18)
- **DynamoDB** - NoSQL database
- **CloudFormation** - Infrastructure as code
- **S3** - Deployment artifacts

## Setup Steps
1. Install Node.js, AWS CLI, Serverless Framework
2. Configure AWS credentials: `aws configure`
3. Clone this repo: `git clone https://github.com/DiliniNimesha14/notes_api`
4. Install dependencies: `npm install`
5. Deploy: `serverless deploy --stage dev`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /notes | Create a note |
| GET    | /notes | Get all notes |
| GET    | /notes/{id} | Get single note |
| PUT    | /notes/{id} | Update a note |
| DELETE | /notes/{id} | Delete a note |

## Example Request
POST /notes
```json
{
  "title": "My Note",
  "content": "Note content here"
}
```

## Live API
Base URL: `https://g049fi00oe.execute-api.us-east-1.amazonaws.com/dev`