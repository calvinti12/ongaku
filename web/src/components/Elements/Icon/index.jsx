import React from 'react';

import { styled } from '@/stitches.config.js';

const IconWrapper = styled('div', {
  padding: '$4',
  borderRadius: '20px',
  width: '13%',

  '& *': {
    margin: '0 auto',
  },

  variants: {
    backgroundColor: {
      primary: { backgroundColor: '$primaryBg' },
      accent: { backgroundColor: '$accentSolid' },
    },
  },

  defaultVariants: {
    backgroundColor: 'primary',
  },
});

export function Icon({ variant, wrapped = false, size = 40, children }) {
  return wrapped ? (
    <IconWrapper backgroundColor={variant}>
      {React.cloneElement(children, { color: '#ffffff', size })}
    </IconWrapper>
  ) : (
    React.cloneElement(children, { color: '#ffffff', size })
  );
}
