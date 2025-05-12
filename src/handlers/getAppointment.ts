import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoAppointmentRepo } from '../infrastructure/dynamo/AppointmentRepo';
import { GetAppointment } from '../application/useCases/GetAppointment';

const repo = new DynamoAppointmentRepo();
const useCase = new GetAppointment(repo);

export const handler: APIGatewayProxyHandler = async (event) => {
  const insuredId = event.pathParameters?.insuredId;

  if (!insuredId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing insuredId' })
    };
  }

  try {
    const appointment = await useCase.execute(insuredId);

    if (!appointment) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Appointment not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    };
  } catch (error: any) {
    console.error('❌ ERROR en handler de getAppointment:', error.message);
    
    if (error.message === 'El ID del asegurado debe tener 5 dígitos') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: error.message })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal error', error: error.message })
    };
  }
};
