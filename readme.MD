# Sistema de Gestión de Citas Médicas - Rimac

## Descripción General
Sistema serverless para la gestión de citas médicas, implementado con Clean Architecture y desplegado en AWS. El sistema permite crear y consultar citas médicas, con procesamiento asíncrono por país (Perú y Chile).

## Arquitectura

### Principios de Diseño
- **Clean Architecture**: Separación clara de responsabilidades en capas
- **Domain-Driven Design**: Modelado basado en el dominio de negocio
- **Event-Driven Architecture**: Procesamiento asíncrono mediante eventos

### Capas de la Arquitectura

#### 1. Dominio (Domain)
- **Entidades**: `Appointment` - Representa la cita médica
- **Interfaces**: `IAppointmentRepo`, `IAppointmentPublisher`
- **Value Objects**: `InsuredId`, `ScheduleId`, `CountryISO`

#### 2. Aplicación (Application)
- **Casos de Uso**:
  - `CreateAppointment`: Creación de citas
  - `GetAppointment`: Consulta de citas
- **DTOs**: Objetos de transferencia de datos
- **Validaciones**: Reglas de negocio y validaciones

#### 3. Infraestructura (Infrastructure)
- **Repositorios**: `DynamoAppointmentRepo`
- **Publicadores**: `SnsAppointmentPublisher`
- **Handlers**: Manejadores de eventos Lambda
- **Facades**: `AppointmentInfraFacade`

### Componentes AWS
- **API Gateway**: Endpoints REST
- **Lambda**: Funciones serverless
- **DynamoDB**: Almacenamiento de citas
- **SNS**: Publicación de eventos
- **SQS**: Colas de procesamiento por país
- **EventBridge**: Manejo de eventos de estado

## Estructura del Proyecto
```
src/
├── domain/
│   ├── entities/
│   └── interfaces/
├── application/
│   └── useCases/
├── infrastructure/
│   ├── dynamo/
│   ├── sns/
│   └── facades/
└── handlers/
```

## Endpoints API

### POST /appointment
Crea una nueva cita médica.

**Request:**
```json
{
  "insuredId": "string",
  "scheduleId": "number",
  "countryISO": "PE|CL"
}
```

**Response (201):**
```json
{
  "insuredId": "string",
  "scheduleId": "number",
  "countryISO": "string",
  "status": "pending",
  "createdAt": "string"
}
```

### GET /appointment/{insuredId}
Consulta una cita por ID de asegurado.

**Response (200):**
```json
{
  "insuredId": "string",
  "scheduleId": "number",
  "countryISO": "string",
  "status": "string",
  "createdAt": "string"
}
```

## Flujo de Procesamiento

1. **Creación de Cita**:
   - Validación de datos
   - Persistencia en DynamoDB
   - Publicación en SNS

2. **Procesamiento por País**:
   - Filtrado por `countryISO` (PE/CL)
   - Procesamiento en colas específicas
   - Actualización de estado

3. **Consulta de Cita**:
   - Validación de `insuredId`
   - Búsqueda en DynamoDB
   - Retorno de datos

## Despliegue

### Prerrequisitos
- Node.js 18.x
- AWS CLI configurado
- Serverless Framework

### Instalación
```bash
npm install
```

### Despliegue
```bash
serverless deploy
```

### Variables de Entorno
- `APPOINTMENTS_TABLE`: Tabla DynamoDB
- `SNS_TOPIC_ARN`: ARN del tópico SNS

## Testing

### Pruebas Unitarias
```bash
npm test
```

### Estructura de Tests
```
__tests__/
├── CreateAppointment.test.ts
├── GetAppointment.test.ts
└── AppointmentInfraFacade.test.ts
```

## Licencia
Este proyecto es propiedad de Rimac Seguros.