import React from 'react';
import { render } from '@testing-library/react-native';
import { Card, CardContent } from '../Card';
import { Text } from 'react-native';

describe('Card', () => {
  it('deve renderizar children corretamente', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('deve aplicar estilos customizados', () => {
    const customStyle = { padding: 20 };
    const { getByText } = render(
      <Card style={customStyle}>
        <Text>Styled Card</Text>
      </Card>
    );
    
    expect(getByText('Styled Card')).toBeTruthy();
  });
});

describe('CardContent', () => {
  it('deve renderizar children corretamente', () => {
    const { getByText } = render(
      <CardContent>
        <Text>Card Content Text</Text>
      </CardContent>
    );
    
    expect(getByText('Card Content Text')).toBeTruthy();
  });
});

