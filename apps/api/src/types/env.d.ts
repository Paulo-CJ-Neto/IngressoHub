declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // AWS
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION?: string;
      
      // DynamoDB Tables
      EVENTS_TABLE_NAME?: string;
      TICKETS_TABLE_NAME?: string;
      USERS_TABLE_NAME?: string;
      PAYMENTS_TABLE_NAME?: string;
      
      // Environment
      NODE_ENV?: 'development' | 'production' | 'test';
      PORT?: number;
      
      // DynamoDB Local (development)
      DYNAMODB_ENDPOINT?: string;

      // Tickets
      TICKET_JWT_PRIVATE_KEY?: string;

      // AbacatePay
      ABACATEPAY_API_KEY?: string;

      // S3
      S3_BUCKET_NAME?: string;
    }
  }
}

export {};
