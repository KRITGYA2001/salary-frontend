import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { List as MenuIcon, Wallet } from '@phosphor-icons/react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ApiStatus } from '../components/ApiStatus';
import { colors, layout, radius } from '../theme/tokens';
import { NAV_ITEMS } from './navigation';

const APP_NAME = 'Salary Desk';

function Brand() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, px: 1 }}>
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          width: 34,
          height: 34,
          borderRadius: `${radius.control}px`,
          bgcolor: colors.accent,
          color: '#fff',
        }}
      >
        <Wallet size={20} weight="regular" aria-hidden />
      </Box>
      <Typography component="span" sx={{ fontWeight: 650, fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>
        {APP_NAME}
      </Typography>
    </Stack>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box component="nav" aria-label="Primary" sx={{ display: 'grid', gap: 0.5 }}>
      {NAV_ITEMS.map(({ label, path, icon: IconComponent }) => (
        <NavLink key={path} to={path} onClick={onNavigate} style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                gap: 1.5,
                px: 1.5,
                py: 1.1,
                borderRadius: `${radius.control}px`,
                color: isActive ? colors.accent : colors.ink,
                bgcolor: isActive ? colors.surface : 'transparent',
                border: `1px solid ${isActive ? colors.line : 'transparent'}`,
                fontWeight: isActive ? 600 : 500,
                transition: 'background-color 120ms, color 120ms',
                '&:hover': { bgcolor: isActive ? colors.surface : 'rgba(255,255,255,0.6)' },
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconComponent size={20} weight={isActive ? 'fill' : 'regular'} aria-hidden />
              <span>{label}</span>
            </Stack>
          )}
        </NavLink>
      ))}
    </Box>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Stack sx={{ height: '100%', p: 2.5, gap: 4 }}>
      <Brand />
      <NavList onNavigate={onNavigate} />
      <Box sx={{ mt: 'auto', px: 1 }}>
        <ApiStatus />
      </Box>
    </Stack>
  );
}

/** Persistent sidebar on desktop; a top bar with a drawer on small screens. */
export function AppShell() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex' }}>
      {isDesktop ? (
        <Box
          component="aside"
          sx={{
            width: layout.sidebarWidth,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100dvh',
            bgcolor: colors.paperDeep,
            borderRight: `1px solid ${colors.line}`,
          }}
        >
          <SidebarContent />
        </Box>
      ) : (
        <>
          <Box
            component="header"
            sx={{
              position: 'fixed',
              insetInline: 0,
              top: 0,
              height: 56,
              zIndex: theme.zIndex.appBar,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              bgcolor: colors.paperDeep,
              borderBottom: `1px solid ${colors.line}`,
            }}
          >
            <IconButton aria-label="Open navigation" onClick={() => setDrawerOpen(true)}>
              <MenuIcon size={24} aria-hidden />
            </IconButton>
            <Brand />
          </Box>
          <Drawer
            open={drawerOpen}
            onClose={closeDrawer}
            slotProps={{ paper: { sx: { width: layout.sidebarWidth, bgcolor: colors.paperDeep } } }}
          >
            <SidebarContent onNavigate={closeDrawer} />
          </Drawer>
        </>
      )}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2, md: 6 },
          pt: { xs: 9, md: 6 },
          pb: 8,
        }}
      >
        <Box sx={{ maxWidth: layout.contentMaxWidth, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
