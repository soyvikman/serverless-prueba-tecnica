import { CreateAppointment } from '../src/application/useCases/CreateAppointment';
import { AppointmentInfraFacade } from '../src/infrastructure/facades/AppointmentInfraFacade';

describe('CreateAppointment', () => {
  let createAppointment: CreateAppointment;
  let mockInfra: jest.Mocked<AppointmentInfraFacade>;

  beforeEach(() => {
    mockInfra = {
      createAndNotify: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<AppointmentInfraFacade>;

    createAppointment = new CreateAppointment(mockInfra);
  });

  it('debería crear una cita correctamente', async () => {
    const appointmentData = {
      insuredId: '12345',
      scheduleId: 456,
      countryISO: 'PE'
    };

    const result = await createAppointment.execute(appointmentData);

    expect(result).toBeDefined();
    expect(result.insuredId).toBe(appointmentData.insuredId);
    expect(result.scheduleId).toBe(appointmentData.scheduleId);
    expect(result.countryISO).toBe(appointmentData.countryISO);
    expect(result.status).toBe('pending');
    expect(mockInfra.createAndNotify).toHaveBeenCalledTimes(1);
  });

  it('debería manejar errores al crear una cita', async () => {
    const appointmentData = {
      insuredId: '12345',
      scheduleId: 456,
      countryISO: 'PE'
    };

    mockInfra.createAndNotify.mockRejectedValueOnce(new Error('Error al crear cita'));

    await expect(createAppointment.execute(appointmentData)).rejects.toThrow('Error al crear cita');
  });

  it('debería validar el formato del ID del asegurado', async () => {
    const invalidData = {
      insuredId: '123',
      scheduleId: 456,
      countryISO: 'PE'
    };

    await expect(createAppointment.execute(invalidData)).rejects.toThrow('El ID del asegurado debe tener 5 dígitos');
  });

  it('debería validar el país', async () => {
    const invalidData = {
      insuredId: '12345',
      scheduleId: 456,
      countryISO: 'MX'
    };

    await expect(createAppointment.execute(invalidData)).rejects.toThrow('El país debe ser PE o CL');
  });
}); 