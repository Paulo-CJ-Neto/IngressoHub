import { EventRepository } from '../EventRepository';
import { docClient } from '../../client';
import { createMockEvent } from '../../../test-utils/helpers';
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

jest.mock('../../client');

describe('EventRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('deve buscar evento por ID com sucesso', async () => {
      const mockEvent = createMockEvent();
      (docClient.send as jest.Mock).mockResolvedValue({ Item: mockEvent });

      const result = await EventRepository.findById('event_123');

      expect(result).toEqual(mockEvent);
      expect(docClient.send).toHaveBeenCalled();
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input).toMatchObject({ TableName: expect.any(String), Key: { id: 'event_123' } });
    });

    it('deve retornar null se evento não encontrado', async () => {
      (docClient.send as jest.Mock).mockResolvedValue({ Item: undefined });

      const result = await EventRepository.findById('invalid_id');

      expect(result).toBeNull();
    });

    it('deve lançar erro em caso de falha', async () => {
      (docClient.send as jest.Mock).mockRejectedValue(new Error('DynamoDB Error'));

      await expect(EventRepository.findById('event_123')).rejects.toThrow('Erro ao buscar evento');
    });
  });

  describe('findAll', () => {
    it('deve listar todos os eventos', async () => {
      const mockEvents = [createMockEvent({ id: 'event_1' }), createMockEvent({ id: 'event_2' })];
      (docClient.send as jest.Mock).mockResolvedValue({ Items: mockEvents });

      const result = await EventRepository.findAll();

      expect(result).toEqual(mockEvents);
      expect(docClient.send).toHaveBeenCalled();
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input).toMatchObject({ TableName: expect.any(String) });
    });

    it('deve retornar array vazio se não houver eventos', async () => {
      (docClient.send as jest.Mock).mockResolvedValue({ Items: [] });

      const result = await EventRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findActive', () => {
    it('deve buscar eventos ativos usando índice', async () => {
      const mockEvents = [createMockEvent({ status: 'active' })];
      (docClient.send as jest.Mock).mockResolvedValue({ Items: mockEvents });

      const result = await EventRepository.findActive();

      expect(result).toEqual(mockEvents);
      expect(docClient.send).toHaveBeenCalled();
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input).toMatchObject({ 
        TableName: expect.any(String),
        IndexName: 'status-index',
        KeyConditionExpression: expect.any(String)
      });
    });

    it('deve fazer scan e filtrar se índice não existir', async () => {
      const allEvents = [
        createMockEvent({ id: 'event_1', status: 'active' }),
        createMockEvent({ id: 'event_2', status: 'inactive' }),
      ];
      
      (docClient.send as jest.Mock)
        .mockRejectedValueOnce(new Error('Index not found'))
        .mockResolvedValueOnce({ Items: allEvents });

      const result = await EventRepository.findActive();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
    });
  });

  describe('createOrUpdate', () => {
    it('deve criar ou atualizar evento', async () => {
      const mockEvent = createMockEvent();
      (docClient.send as jest.Mock).mockResolvedValue({});

      const result = await EventRepository.createOrUpdate(mockEvent);

      expect(result).toEqual(mockEvent);
      expect(docClient.send).toHaveBeenCalled();
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input).toMatchObject({ TableName: expect.any(String), Item: expect.any(Object) });
    });
  });

  describe('update', () => {
    it('deve atualizar evento existente', async () => {
      const mockEvent = createMockEvent();
      const updates = { name: 'Updated Name' };
      
      (docClient.send as jest.Mock)
        .mockResolvedValueOnce({ Item: mockEvent }) // findById
        .mockResolvedValueOnce({ Attributes: { ...mockEvent, ...updates } }); // update

      const result = await EventRepository.update('event_123', updates);

      expect(result?.name).toBe('Updated Name');
      expect(docClient.send).toHaveBeenCalledTimes(2);
      const updateCallArg = (docClient.send as jest.Mock).mock.calls[1][0];
      expect(updateCallArg.input).toMatchObject({ 
        TableName: expect.any(String),
        Key: { id: 'event_123' },
        UpdateExpression: expect.any(String)
      });
    });

    it('deve retornar null se evento não encontrado', async () => {
      (docClient.send as jest.Mock).mockResolvedValue({ Item: null });

      const result = await EventRepository.update('invalid_id', { name: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deve deletar evento', async () => {
      (docClient.send as jest.Mock).mockResolvedValue({});

      const result = await EventRepository.delete('event_123');

      expect(result).toBe(true);
      expect(docClient.send).toHaveBeenCalled();
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input).toMatchObject({ TableName: expect.any(String), Key: { id: 'event_123' } });
    });
  });

  describe('incrementSoldTickets', () => {
    it('deve incrementar ingressos vendidos', async () => {
      const updatedEvent = createMockEvent({ sold_tickets: 5 });
      (docClient.send as jest.Mock).mockResolvedValue({ Attributes: updatedEvent });

      const result = await EventRepository.incrementSoldTickets('event_123', 2);

      expect(result?.sold_tickets).toBe(5);
      expect(docClient.send).toHaveBeenCalled();
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input).toMatchObject({ 
        TableName: expect.any(String),
        Key: { id: 'event_123' },
        UpdateExpression: expect.stringContaining('sold_tickets')
      });
    });
  });
});

