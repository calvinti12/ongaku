import { Button as ChakraButton, Text, Box } from '@chakra-ui/react';
import React from 'react';

import { theme } from '@/stitches.config.js';

const variants = {
  primary: {
    backgroundColor: theme.colors.primaryBg.value,
    hover: theme.colors.primaryBgHover.value,
    active: theme.colors.primaryBgActive.value,
  },
  accent: {
    backgroundColor: theme.colors.accentSolid.value,
    hover: theme.colors.accentSolidHover.value,
    active: theme.colors.accentSolidActive.value,
  },
  text: theme.colors.primaryTextContrast,
};

export function Button({
  variant = 'primary',
  label = '',
  position = 'top',
  isFullWidth = true,
  children,
}) {
  return (
    <Box textAlign="center">
      {label && position === 'top' && <Label text={label} position="top" />}

      <ChakraButton
        isFullWidth={isFullWidth}
        backgroundColor={variants[variant].backgroundColor}
        color={variants.text}
        _hover={{
          bg: variants[variant].hover,
        }}
        _active={{
          bg: variants[variant].active,
        }}
      >
        {children}
      </ChakraButton>

      {label && position === 'bottom' && <Label text={label} position="bottom" />}
    </Box>
  );
}

function Label({ text, position }) {
  const margin = position === 'top' ? { marginBottom: '2' } : { marginTop: '2' };

  return (
    <Text fontSize="sm" {...margin} fontWeight="bold" color={variants.text}>
      {text}
    </Text>
  );
}
