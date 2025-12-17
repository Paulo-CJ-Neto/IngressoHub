// Mock do nodemailer
export const mockSendMail = jest.fn().mockResolvedValue({
  messageId: 'test-message-id',
  accepted: ['test@example.com'],
  rejected: [],
  pending: [],
  response: '250 OK',
});

export const mockVerify = jest.fn().mockResolvedValue(true);

const mockTransporter = {
  sendMail: mockSendMail,
  verify: mockVerify,
};

export default {
  createTransport: jest.fn().mockReturnValue(mockTransporter),
};

