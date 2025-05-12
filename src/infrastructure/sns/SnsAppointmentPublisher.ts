import { SNS } from 'aws-sdk';
import { Appointment } from '../../domain/entities/Appointment';

const sns = new SNS();

export interface IAppointmentPublisher {
  publish(appointment: Appointment): Promise<void>;
}

export class SnsAppointmentPublisher implements IAppointmentPublisher {
  private topicArn = process.env.SNS_TOPIC_ARN!;

  async publish(appointment: Appointment): Promise<void> {
    await sns.publish({
      TopicArn: this.topicArn,
      Message: JSON.stringify({
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO,
        createdAt: appointment.createdAt
      }),
      MessageAttributes: {
        countryISO: {
          DataType: 'String',
          StringValue: appointment.countryISO
        }
      }
    }).promise();
  }
}
