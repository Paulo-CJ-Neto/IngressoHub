// Mock do DynamoDB DocumentClient
export const mockSend = jest.fn();

// Criar instância mock do DocumentClient
const createMockDocumentClient = () => ({
  send: mockSend,
});

// Mock do DynamoDBDocumentClient com método estático from()
export const DynamoDBDocumentClient = Object.assign(
  jest.fn().mockImplementation(() => createMockDocumentClient()),
  {
    from: jest.fn().mockImplementation(() => createMockDocumentClient()),
  }
);

export const GetCommand = jest.fn().mockImplementation((params) => ({
  input: params,
}));

export const PutCommand = jest.fn().mockImplementation((params) => ({
  input: params,
}));

export const UpdateCommand = jest.fn().mockImplementation((params) => ({
  input: params,
}));

export const DeleteCommand = jest.fn().mockImplementation((params) => ({
  input: params,
}));

export const QueryCommand = jest.fn().mockImplementation((params) => ({
  input: params,
}));

export const ScanCommand = jest.fn().mockImplementation((params) => ({
  input: params,
}));

