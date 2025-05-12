import { APIGatewayProxyHandler } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const filePath = path.join(__dirname, '../docs/swagger.yaml');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/yaml' },
      body: fileContent
    };
  } catch (error: any) {
    console.error('Failed to load swagger.yaml:', error.message);
    return {
      statusCode: 500,
      body: 'Failed to load Swagger file'
    };
  }
};
