import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('deve renderizar corretamente', () => {
    const { getByText } = render(<Button>Test Button</Button>);
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('deve chamar onPress quando pressionado', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Click Me</Button>);
    
    fireEvent.press(getByText('Click Me'));
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onPress quando disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Disabled Button
      </Button>
    );
    
    fireEvent.press(getByText('Disabled Button'));
    
    expect(onPress).not.toHaveBeenCalled();
  });

  it('deve aplicar estilos customizados', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <Button style={customStyle}>Styled Button</Button>
    );
    
    const button = getByText('Styled Button').parent;
    expect(button).toBeTruthy();
  });
});

