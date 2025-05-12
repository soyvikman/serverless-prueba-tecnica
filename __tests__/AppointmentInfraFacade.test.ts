import { AppointmentInfraFacade } from '../src/infrastructure/facades/AppointmentInfraFacade';
import { Appointment } from '../src/domain/entities/Appointment';

describe('AppointmentInfraFacade', () => {
  let facade: AppointmentInfraFacade;
  let mockRepo: any;
  let mockPublisher: any;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined)
    };

    mockPublisher = {
      publish: jest.fn().mockResolvedValue(undefined)
    };

    facade = new AppointmentInfraFacade(mockRepo, mockPublisher);
  });

  it('debería guardar y publicar una cita', async () => {
    const appointment = Appointment.create({
      insuredId: '12345',
      scheduleId: 456,
      countryISO: 'PE'
    });

    await facade.createAndNotify(appointment);

    expect(mockRepo.save).toHaveBeenCalledWith(appointment);
    expect(mockPublisher.publish).toHaveBeenCalledWith(appointment);
  });

  it('debería manejar errores al guardar la cita', async () => {
    const appointment = Appointment.create({
      insuredId: '12345',
      scheduleId: 456,
      countryISO: 'PE'
    });

    mockRepo.save.mockRejectedValueOnce(new Error('Error al guardar'));

    await expect(facade.createAndNotify(appointment)).rejects.toThrow('Error al guardar');
    expect(mockPublisher.publish).not.toHaveBeenCalled();
  });
}); 