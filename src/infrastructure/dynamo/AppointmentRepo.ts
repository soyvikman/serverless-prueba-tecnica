import { DynamoDB } from 'aws-sdk';
import { Appointment } from '../../domain/entities/Appointment';

const db = new DynamoDB.DocumentClient();

export interface IAppointmentRepo {
  save(appointment: Appointment): Promise<void>;
  findByInsuredId(insuredId: string): Promise<Appointment | null>;
}

export class DynamoAppointmentRepo implements IAppointmentRepo {
  private tableName = process.env.APPOINTMENTS_TABLE!;

  async save(appointment: Appointment): Promise<void> {
    await db.put({
      TableName: this.tableName,
      Item: {
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO,
        status: appointment.status,
        createdAt: appointment.createdAt
      }
    }).promise();
  }

  async findByInsuredId(insuredId: string): Promise<Appointment | null> {
    const result = await db.get({
      TableName: this.tableName,
      Key: { insuredId }
    }).promise();

    if (!result.Item) {
      return null;
    }

    return new Appointment(
      result.Item.insuredId,
      result.Item.scheduleId,
      result.Item.countryISO,
      result.Item.status,
      result.Item.createdAt
    );
  }
}
