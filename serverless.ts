import type { AWS } from '@serverless/typescript';

const config: AWS = {
  service: 'rimac-citas',
  frameworkVersion: '4',
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    environment: {
      APPOINTMENTS_TABLE: 'Appointments',
      SNS_TOPIC_ARN: { Ref: 'AppointmentTopic' },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:PutItem',
              'dynamodb:GetItem',
              'dynamodb:UpdateItem',
              'dynamodb:Query',
              'dynamodb:Scan',
            ],
            Resource: { 'Fn::GetAtt': ['AppointmentsTable', 'Arn'] },
          },
          {
            Effect: 'Allow',
            Action: ['sns:Publish'],
            Resource: { Ref: 'AppointmentTopic' },
          },
          {
            Effect: 'Allow',
            Action: ['sqs:SendMessage', 'sqs:ReceiveMessage', 'sqs:DeleteMessage'],
            Resource: [
              { 'Fn::GetAtt': ['AppointmentQueuePE', 'Arn'] },
              { 'Fn::GetAtt': ['AppointmentQueueCL', 'Arn'] },
              { 'Fn::GetAtt': ['UpdateStatusQueue', 'Arn'] },
            ],
          },
          {
            Effect: 'Allow',
            Action: ['events:PutEvents'],
            Resource: 'arn:aws:events:us-east-1:*:event-bus/default',
          },
        ],
      },
    },
  },

  functions: {
    appointment: {
      handler: 'src/handlers/createAppointment.handler',
      events: [
        {
          httpApi: {
            path: '/appointment',
            method: 'post',
          },
        },
      ],
    },
    getAppointment: {
      handler: 'src/handlers/getAppointment.handler',
      events: [
        {
          httpApi: {
            path: '/appointment/{insuredId}',
            method: 'get',
          },
        },
      ],
    },
    appointmentPE: {
      handler: 'src/handlers/appointmentPE.handler',
      events: [
        {
          sqs: {
            arn: { 'Fn::GetAtt': ['AppointmentQueuePE', 'Arn'] },
            batchSize: 10,
          },
        },
      ],
    },
    appointmentCL: {
      handler: 'src/handlers/appointmentCL.handler',
      events: [
        {
          sqs: {
            arn: { 'Fn::GetAtt': ['AppointmentQueueCL', 'Arn'] },
            batchSize: 10,
          },
        },
      ],
    },
    updateStatus: {
      handler: 'src/handlers/updateStatus.handler',
      events: [
        {
          sqs: {
            arn: { 'Fn::GetAtt': ['UpdateStatusQueue', 'Arn'] },
            batchSize: 10,
          },
        },
      ],
    },
    swagger: {
      handler: 'src/handlers/swagger.handler',
      events: [
        {
          http: {
            path: 'docs/',
            method: 'get',
            cors: true
          },
        },
      ],
    }
  },

  resources: {
    Resources: {
      AppointmentsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'Appointments',
          AttributeDefinitions: [
            { AttributeName: 'insuredId', AttributeType: 'S' },
          ],
          KeySchema: [{ AttributeName: 'insuredId', KeyType: 'HASH' }],
          BillingMode: 'PAY_PER_REQUEST',
        },
      },
      AppointmentTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: { TopicName: 'AppointmentTopic' },
      },
      AppointmentQueuePE: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'SQS_PE',
          VisibilityTimeout: 60,
          RedrivePolicy: {
            deadLetterTargetArn: {
              'Fn::GetAtt': ['AppointmentQueuePEDLQ', 'Arn'],
            },
            maxReceiveCount: 5,
          },
        },
      },
      AppointmentQueuePEDLQ: {
        Type: 'AWS::SQS::Queue',
        Properties: { QueueName: 'SQS_PE_DLQ' },
      },
      AppointmentQueueCL: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'SQS_CL',
          VisibilityTimeout: 60,
          RedrivePolicy: {
            deadLetterTargetArn: {
              'Fn::GetAtt': ['AppointmentQueueCLDLQ', 'Arn'],
            },
            maxReceiveCount: 5,
          },
        },
      },
      AppointmentQueueCLDLQ: {
        Type: 'AWS::SQS::Queue',
        Properties: { QueueName: 'SQS_CL_DLQ' },
      },
      UpdateStatusQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'SQS_UpdateStatus',
          VisibilityTimeout: 60,
          RedrivePolicy: {
            deadLetterTargetArn: {
              'Fn::GetAtt': ['UpdateStatusQueueDLQ', 'Arn'],
            },
            maxReceiveCount: 5,
          },
        },
      },
      UpdateStatusQueueDLQ: {
        Type: 'AWS::SQS::Queue',
        Properties: { QueueName: 'SQS_UpdateStatus_DLQ' },
      },
      SnsSubscriptionPE: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'sqs',
          TopicArn: { Ref: 'AppointmentTopic' },
          Endpoint: { 'Fn::GetAtt': ['AppointmentQueuePE', 'Arn'] },
          FilterPolicy: { countryISO: ['PE'] },
        },
      },
      SnsSubscriptionCL: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'sqs',
          TopicArn: { Ref: 'AppointmentTopic' },
          Endpoint: { 'Fn::GetAtt': ['AppointmentQueueCL', 'Arn'] },
          FilterPolicy: { countryISO: ['CL'] },
        },
      },
      CitaProcesadaBusRule: {
        Type: 'AWS::Events::Rule',
        Properties: {
          Name: 'CitaProcesadaRule',
          EventPattern: {
            source: ['cita.rimac'],
            'detail-type': ['CitaProcesada'],
          },
          Targets: [
            {
              Arn: { 'Fn::GetAtt': ['UpdateStatusQueue', 'Arn'] },
              Id: 'SendToUpdateStatusQueue',
            },
          ],
        },
      },
      PermissionForEventBridgeToSQS: {
        Type: 'AWS::SQS::QueuePolicy',
        Properties: {
          Queues: [{ Ref: 'UpdateStatusQueue' }],
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { Service: 'events.amazonaws.com' },
                Action: 'sqs:SendMessage',
                Resource: { 'Fn::GetAtt': ['UpdateStatusQueue', 'Arn'] },
              },
            ],
          },
        },
      },
      AppointmentQueuePEPolicy: {
        Type: 'AWS::SQS::QueuePolicy',
        Properties: {
          Queues: [{ Ref: 'AppointmentQueuePE' }],
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { Service: 'sns.amazonaws.com' },
                Action: 'sqs:SendMessage',
                Resource: { 'Fn::GetAtt': ['AppointmentQueuePE', 'Arn'] },
                Condition: {
                  ArnEquals: {
                    'aws:SourceArn': { Ref: 'AppointmentTopic' },
                  },
                },
              },
            ],
          },
        },
      },
      AppointmentQueueCLPolicy: {
        Type: 'AWS::SQS::QueuePolicy',
        Properties: {
          Queues: [{ Ref: 'AppointmentQueueCL' }],
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { Service: 'sns.amazonaws.com' },
                Action: 'sqs:SendMessage',
                Resource: { 'Fn::GetAtt': ['AppointmentQueueCL', 'Arn'] },
                Condition: {
                  ArnEquals: {
                    'aws:SourceArn': { Ref: 'AppointmentTopic' },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },

  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      target: 'node18',
      platform: 'node',
    },
  },

  package: {
    individually: true,
    include: ['docs/**'],
    exclude: ['node_modules/aws-sdk/**', 'tests/**'],
  },
};

export default config;
