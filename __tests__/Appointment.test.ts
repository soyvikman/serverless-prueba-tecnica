import { Appointment } from '../src/domain/entities/Appointment';

describe('Appointment', () => {
  it('debería crear una cita con estado pendiente', () => {
    const appointmentData = {
      insuredId: '12345',
      scheduleId: 456,
      countryISO: 'PE'
    };

    const appointment = Appointment.create(appointmentData);

    expect(appointment).toBeDefined();
    expect(appointment.insuredId).toBe(appointmentData.insuredId);
    expect(appointment.scheduleId).toBe(appointmentData.scheduleId);
    expect(appointment.countryISO).toBe(appointmentData.countryISO);
    expect(appointment.status).toBe('pending');
    expect(appointment.createdAt).toBeDefined();
  });

  it('debería validar el formato del ID del asegurado', () => {
    const invalidData = {
      insuredId: '123',
      scheduleId: 456,
      countryISO: 'PE'
    };

    expect(() => Appointment.create(invalidData)).toThrow('El ID del asegurado debe tener 5 dígitos');
  });

  it('debería validar el país', () => {
    const invalidData = {
      insuredId: '12345',
      scheduleId: 456,
      countryISO: 'MX'
    };

    expect(() => Appointment.create(invalidData)).toThrow('El país debe ser PE o CL');
  });

  it('debería permitir completar una cita', () => {
    const appointmentData = {
      insuredId: '12345',
      scheduleId: 456,
      countryISO: 'PE'
    };

    const appointment = Appointment.create(appointmentData);
    const completedAppointment = appointment.complete();

    expect(completedAppointment.status).toBe('completed');
    expect(completedAppointment.insuredId).toBe(appointment.insuredId);
    expect(completedAppointment.scheduleId).toBe(appointment.scheduleId);
    expect(completedAppointment.countryISO).toBe(appointment.countryISO);
    expect(completedAppointment.createdAt).toBe(appointment.createdAt);
  });
}); 