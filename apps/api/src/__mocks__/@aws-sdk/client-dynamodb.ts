// Mock do DynamoDB Client
export const DynamoDBClient = jest.fn().mockImplementation(() => ({
  config: {},
  send: jest.fn(),
}));

