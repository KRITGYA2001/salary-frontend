import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, gap: 2, mb: 4 }}
    >
      <Box>
        <Typography component="h1" variant="h1">
          {title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1, maxWidth: '60ch' }}>
          {description}
        </Typography>
      </Box>
      {actions}
    </Stack>
  );
}
