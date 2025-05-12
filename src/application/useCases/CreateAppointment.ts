import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentInfraFacade } from '../../infrastructure/facades/AppointmentInfraFacade';

export class CreateAppointment {
  constructor(private readonly infra: AppointmentInfraFacade) {}

  async execute(data: {
    insuredId: string;
    scheduleId: number;
    countryISO: string;
  }): Promise<Appointment> {
    const appointment = Appointment.create(data);
    await this.infra.createAndNotify(appointment);
    return appointment;
  }
}
