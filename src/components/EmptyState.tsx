import { Box, Typography } from '@mui/material';
import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { colors, radius } from '../theme/tokens';

interface EmptyStateProps {
  icon: Icon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: IconComponent, title, description, action }: EmptyStateProps) {
  return (
    <Box
      role="status"
      sx={{
        display: 'grid',
        justifyItems: 'center',
        textAlign: 'center',
        gap: 1.5,
        py: 8,
        px: 3,
        border: `1px dashed ${colors.lineStrong}`,
        borderRadius: `${radius.surface}px`,
        backgroundColor: colors.surface,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          width: 48,
          height: 48,
          borderRadius: `${radius.control}px`,
          bgcolor: colors.accentSoft,
          color: colors.accent,
        }}
      >
        <IconComponent size={24} weight="regular" aria-hidden />
      </Box>
      <Typography component="h2" variant="h2">
        {title}
      </Typography>
      <Typography sx={{ color: 'text.secondary', maxWidth: '44ch' }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}
