import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoAppointmentRepo } from '../infrastructure/dynamo/AppointmentRepo';
import { SnsAppointmentPublisher } from '../infrastructure/sns/SnsAppointmentPublisher';
import { AppointmentInfraFacade } from '../infrastructure/facades/AppointmentInfraFacade';
import { CreateAppointment } from '../application/useCases/CreateAppointment';

const repo = new DynamoAppointmentRepo();
const publisher = new SnsAppointmentPublisher();
const facade = new AppointmentInfraFacade(repo, publisher);
const useCase = new CreateAppointment(facade);

export const handler: APIGatewayProxyHandler = async (event) => {

  try {
    const body = JSON.parse(event.body || '{}');
    const { insuredId, scheduleId, countryISO } = body;

    if (!insuredId || !scheduleId || !countryISO) {

      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      };
    }

    const appointment = await useCase.execute({ insuredId, scheduleId, countryISO });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Appointment created', appointment })
    };
  } catch (err: any) {
    console.error('❌ ERROR en handler de cita:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal error', error: err.message })
    };
  }
};
