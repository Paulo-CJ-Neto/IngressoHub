import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../auth';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('requireAuth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('deve permitir acesso com token válido', () => {
    const token = 'valid_token';
    mockRequest.headers = { authorization: `Bearer ${token}` };
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 'user_123', email: 'test@example.com' });

    requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).auth).toBeDefined();
  });

  it('deve retornar 401 se token não fornecido', () => {
    requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se token inválido', () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se formato de autorização inválido', () => {
    mockRequest.headers = { authorization: 'InvalidFormat token' };

    requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});

