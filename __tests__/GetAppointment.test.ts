import { GetAppointment } from '../src/application/useCases/GetAppointment';
import { Appointment } from '../src/domain/entities/Appointment';
import { IAppointmentRepo } from '../src/infrastructure/dynamo/AppointmentRepo';

describe('GetAppointment', () => {
  let getAppointment: GetAppointment;
  let mockRepo: jest.Mocked<IAppointmentRepo>;

  beforeEach(() => {
    mockRepo = {
      findByInsuredId: jest.fn(),
      save: jest.fn()
    } as unknown as jest.Mocked<IAppointmentRepo>;

    getAppointment = new GetAppointment(mockRepo);
  });

  it('debería retornar una cita existente', async () => {
    const mockAppointment = Appointment.create({
      insuredId: '12345',
      scheduleId: 456,
      countryISO: 'PE'
    });

    mockRepo.findByInsuredId.mockResolvedValueOnce(mockAppointment);

    const result = await getAppointment.execute('12345');

    expect(result).toBeDefined();
    expect(result).toEqual(mockAppointment);
    expect(mockRepo.findByInsuredId).toHaveBeenCalledWith('12345');
  });

  it('debería retornar null cuando no existe la cita', async () => {
    mockRepo.findByInsuredId.mockResolvedValueOnce(null);

    const result = await getAppointment.execute('12345');

    expect(result).toBeNull();
    expect(mockRepo.findByInsuredId).toHaveBeenCalledWith('12345');
  });

  it('debería validar el formato del ID del asegurado', async () => {
    await expect(getAppointment.execute('123')).rejects.toThrow('El ID del asegurado debe tener 5 dígitos');
    expect(mockRepo.findByInsuredId).not.toHaveBeenCalled();
  });

  it('debería manejar errores del repositorio', async () => {
    mockRepo.findByInsuredId.mockRejectedValueOnce(new Error('Error de base de datos'));

    await expect(getAppointment.execute('12345')).rejects.toThrow('Error de base de datos');
  });
}); 