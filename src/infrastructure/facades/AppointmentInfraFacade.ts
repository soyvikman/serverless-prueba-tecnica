import { Appointment } from '../../domain/entities/Appointment';
import { IAppointmentRepo } from '../dynamo/AppointmentRepo';
import { IAppointmentPublisher } from '../sns/SnsAppointmentPublisher';

export class AppointmentInfraFacade {
  constructor(
    private readonly repo: IAppointmentRepo,
    private readonly publisher: IAppointmentPublisher
  ) {}

  async createAndNotify(appointment: Appointment): Promise<void> {
    await this.repo.save(appointment);
    await this.publisher.publish(appointment);
  }
}
