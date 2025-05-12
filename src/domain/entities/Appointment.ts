export type CountryISO = 'PE' | 'CL';
export type AppointmentStatus = 'pending' | 'completed';

export class Appointment {
  constructor(
    public readonly insuredId: string,
    public readonly scheduleId: number,
    public readonly countryISO: CountryISO,
    public readonly status: AppointmentStatus = 'pending',
    public readonly createdAt: string = new Date().toISOString()
  ) {}

  static create(data: {
    insuredId: string;
    scheduleId: number;
    countryISO: string;
  }): Appointment {
    if (!/^\d{5}$/.test(data.insuredId)) {
      throw new Error('El ID del asegurado debe tener 5 dígitos');
    }

    if (!['PE', 'CL'].includes(data.countryISO)) {
      throw new Error('El país debe ser PE o CL');
    }

    return new Appointment(
      data.insuredId,
      data.scheduleId,
      data.countryISO as CountryISO
    );
  }

  complete(): Appointment {
    return new Appointment(
      this.insuredId,
      this.scheduleId,
      this.countryISO,
      'completed',
      this.createdAt
    );
  }
}
