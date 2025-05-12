import { Appointment } from '../../domain/entities/Appointment';
import { IAppointmentRepo } from '../../infrastructure/dynamo/AppointmentRepo';

export class GetAppointment {
  constructor(private readonly repo: IAppointmentRepo) {}

  async execute(insuredId: string): Promise<Appointment | null> {
    if (!/^\d{5}$/.test(insuredId)) {
      throw new Error('El ID del asegurado debe tener 5 dígitos');
    }

    const appointment = await this.repo.findByInsuredId(insuredId);
    return appointment;
  }
} 