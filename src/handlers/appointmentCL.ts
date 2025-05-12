import { SQSEvent } from 'aws-lambda';
import { EventBridge } from 'aws-sdk';

const eventBridge = new EventBridge();

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const appointment = JSON.parse(body.Message);

      console.log(`[CL] Guardando cita en MySQL...`, appointment);

      await eventBridge.putEvents({
        Entries: [
          {
            Source: 'cita.rimac',
            DetailType: 'CitaProcesada',
            Detail: JSON.stringify({
              insuredId: appointment.insuredId
            }),
            EventBusName: 'default'
          }
        ]
      }).promise();

      console.log(`[CL] Evento enviado a EventBridge`);
    } catch (error) {
      console.error(`[CL] Error procesando mensaje:`, error);
    }
  }
};
