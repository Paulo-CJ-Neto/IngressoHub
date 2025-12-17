// Mock do axios para testes
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => mockAxios),
  defaults: {
    headers: {
      common: {},
    },
    baseURL: '',
  },
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
  getUri: jest.fn(() => 'http://localhost:3000/api'),
};

export default mockAxios;

