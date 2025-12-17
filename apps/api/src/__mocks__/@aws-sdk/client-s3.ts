// Mock do AWS S3 Client
export const mockSend = jest.fn();

export const S3Client = jest.fn().mockImplementation(() => ({
  send: mockSend,
}));

export const PutObjectCommand = jest.fn().mockImplementation((params) => ({
  input: params,
}));

export const DeleteObjectCommand = jest.fn().mockImplementation((params) => ({
  input: params,
}));

