import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';

export function useDisableDrawerSwipe() {
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions?.({ swipeEnabled: false });
      return () => {
        parent?.setOptions?.({ swipeEnabled: true });
      };
    }, [navigation])
  );
}


