import React from 'react';
import { View } from 'react-native';
import { useDisableDrawerSwipe } from '@/hooks/useDisableDrawerSwipe';

type Props = { children?: React.ReactNode };

export default function DisableDrawerSwipe({ children }: Props) {
  useDisableDrawerSwipe();
  return <>{children}</>;
}
