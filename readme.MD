# Reto Técnico Rimac - Backend Serverless

Este proyecto implementa una arquitectura backend moderna usando AWS Lambda, DynamoDB, SNS, SQS y EventBridge. Se sigue arquitectura limpia, principios SOLID y patrones como Repository y Facade.

---

## Tecnologías y servicios usados

- Node.js + TypeScript
- AWS Lambda
- API Gateway
- DynamoDB
- SNS
- SQS
- EventBridge
- Serverless Framework v4

---

## Escenario del reto

1. Se recibe una cita vía HTTP (`POST /appointment`).
2. Se valida y guarda en DynamoDB.
3. Se publica un evento en SNS con atributo `countryISO`.
4. SNS redirige el mensaje a la cola `SQS_PE` o `SQS_CL`.
5. Lambdas `appointment_pe` / `appointment_cl` simulan guardado en RDS.
6. Se publica un evento `CitaProcesada` en EventBridge.
7. Otra Lambda actualiza el estado de la cita a `"completed"` en DynamoDB.

---

## Arquitectura

```txt
[POST /appointment] → Lambda handler
  └→ CreateAppointment (use case)
      └→ Appointment.create() (entidad dominio)
      └→ AppointmentInfraFacade
          ├→ repo.save()         → DynamoDB
          └→ publisher.publish() → SNS

SNS → [Filtro por countryISO] → SQS_PE / SQS_CL
  → Lambda appointment_pe / appointment_cl
      ├→ Simula guardar en RDS (log)
      └→ Publica evento en EventBridge

EventBridge → SQS_UpdateStatus → Lambda updateStatus
  → DynamoDB.update (status: "completed")
```

---

## Principios aplicados

### Arquitectura limpia
- Separación clara entre dominio, aplicación, infraestructura y entrada.

### Principios SOLID
- **S**: Una clase = una responsabilidad.
- **O**: Se puede extender con nuevas clases sin modificar.
- **D**: Los casos de uso dependen de interfaces, no de clases concretas.

### Patrones usados
- **Repository**: abstrae el acceso a la base de datos.
- **Facade**: coordina guardar + publicar, ocultando infraestructura.

---

## Cómo ejecutar el proyecto

```bash
npm install
npx serverless deploy
```

### Probar API con curl:

```bash
curl -X POST https://<tu-api>/appointment   -H "Content-Type: application/json"   -d '{"insuredId":"00001","scheduleId":123,"countryISO":"PE"}'
```

---

## Estructura del proyecto

```txt
src/
├── application/
│   └── useCases/CreateAppointment.ts
├── domain/
│   └── entities/Appointment.ts
├── infrastructure/
│   ├── dynamo/AppointmentRepo.ts
│   ├── sns/SnsAppointmentPublisher.ts
│   ├── facades/AppointmentInfraFacade.ts
│   ├── eventbridge/Publisher.ts
│   └── dynamo/Updater.ts
├── handlers/
│   ├── appointment.ts
│   ├── appointmentPE.ts
│   ├── appointmentCL.ts
│   └── updateStatus.ts
```

---

## Autor

Desarrollado como solución al reto técnico de Rimac.