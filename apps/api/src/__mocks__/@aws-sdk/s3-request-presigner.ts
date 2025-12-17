// Mock do S3 Request Presigner
export const getSignedUrl = jest.fn().mockResolvedValue(
  'https://test-bucket.s3.amazonaws.com/test-key?signature=test'
);

