import { SQSEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const db = new DynamoDB.DocumentClient();
const tableName = process.env.APPOINTMENTS_TABLE!;

export const handler = async (event: SQSEvent): Promise<void> => {

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);

      const detail = body.detail;
      const insuredId = detail.insuredId;

      await db.update({
        TableName: tableName,
        Key: { insuredId },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'completed'
        }
      }).promise();

      console.log(`[UPDATE] Cita marcada como completada para: ${insuredId}`);
    } catch (err) {
      console.error('[UPDATE] Error procesando mensaje:', err);
    }
  }
};
