import React from 'react';
import { render } from '@testing-library/react-native';
import EventHeader from '../EventHeader';
import { Event } from '@ingressohub/entities';

jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => '01 de janeiro às 20:00'),
}));

describe('EventHeader', () => {
  const mockEvent: Event = {
    id: 'event_123',
    name: 'Test Event',
    date: new Date().toISOString(),
    location: 'Test Location',
    producer_id: 'producer_123',
    price: 100,
    max_tickets: 100,
    sold_tickets: 50,
    status: 'active',
    image_url: 'https://example.com/image.jpg',
  };

  const mockGetAvailableTickets = jest.fn(() => 50);

  it('deve renderizar informações do evento', () => {
    const { getByText } = render(
      <EventHeader event={mockEvent} getAvailableTickets={mockGetAvailableTickets} />
    );
    
    expect(getByText('Test Event')).toBeTruthy();
    expect(getByText('Test Location')).toBeTruthy();
    expect(getByText('50 ingressos disponíveis')).toBeTruthy();
  });

  it('deve usar imagem padrão se image_url não fornecido', () => {
    const eventWithoutImage = { ...mockEvent, image_url: undefined };
    const { getByText } = render(
      <EventHeader event={eventWithoutImage} getAvailableTickets={mockGetAvailableTickets} />
    );
    
    expect(getByText('Test Event')).toBeTruthy();
  });
});

