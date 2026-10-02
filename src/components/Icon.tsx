import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { theme } from '../theme/theme';

interface IconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = theme.colors.onSurface, style }) => {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
};
