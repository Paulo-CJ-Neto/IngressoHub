import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TicketTypeSelector, { TicketType } from '../TicketTypeSelector';

describe('TicketTypeSelector', () => {
  const mockTicketTypes: TicketType[] = [
    {
      id: 'type_1',
      name: 'Pista',
      description: 'Ingresso para pista',
      price: 100,
      original_price: 120,
      discount_percentage: 10,
      available_quantity: 50,
      icon: '🎫',
    },
    {
      id: 'type_2',
      name: 'VIP',
      description: 'Ingresso VIP',
      price: 200,
      original_price: 200,
      available_quantity: 20,
      icon: '⭐',
    },
  ];

  const mockOnTicketQuantityChange = jest.fn();
  const mockGetAvailableTicketsForType = jest.fn((type) => type.available_quantity);
  const mockFormatPrice = jest.fn((price) => price.toFixed(2).replace('.', ','));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar tipos de ingressos', () => {
    const { getByText } = render(
      <TicketTypeSelector
        ticketTypes={mockTicketTypes}
        selectedTickets={{}}
        onTicketQuantityChange={mockOnTicketQuantityChange}
        getAvailableTicketsForType={mockGetAvailableTicketsForType}
        formatPrice={mockFormatPrice}
      />
    );
    
    expect(getByText('Pista')).toBeTruthy();
    expect(getByText('VIP')).toBeTruthy();
  });

  it('deve incrementar quantidade ao pressionar botão +', () => {
    const { getAllByText } = render(
      <TicketTypeSelector
        ticketTypes={mockTicketTypes}
        selectedTickets={{ type_1: 0 }}
        onTicketQuantityChange={mockOnTicketQuantityChange}
        getAvailableTicketsForType={mockGetAvailableTicketsForType}
        formatPrice={mockFormatPrice}
      />
    );
    
    const plusButtons = getAllByText('+');
    fireEvent.press(plusButtons[0]);
    
    expect(mockOnTicketQuantityChange).toHaveBeenCalledWith('type_1', 1);
  });

  it('deve decrementar quantidade ao pressionar botão -', () => {
    const { getAllByText } = render(
      <TicketTypeSelector
        ticketTypes={mockTicketTypes}
        selectedTickets={{ type_1: 2 }}
        onTicketQuantityChange={mockOnTicketQuantityChange}
        getAvailableTicketsForType={mockGetAvailableTicketsForType}
        formatPrice={mockFormatPrice}
      />
    );
    
    const minusButtons = getAllByText('-');
    fireEvent.press(minusButtons[0]);
    
    expect(mockOnTicketQuantityChange).toHaveBeenCalledWith('type_1', 1);
  });

  it('deve desabilitar botão - quando quantidade é 0', () => {
    const { getAllByText } = render(
      <TicketTypeSelector
        ticketTypes={mockTicketTypes}
        selectedTickets={{ type_1: 0 }}
        onTicketQuantityChange={mockOnTicketQuantityChange}
        getAvailableTicketsForType={mockGetAvailableTicketsForType}
        formatPrice={mockFormatPrice}
      />
    );
    
    const minusButtons = getAllByText('-');
    fireEvent.press(minusButtons[0]);
    
    expect(mockOnTicketQuantityChange).not.toHaveBeenCalled();
  });
});

