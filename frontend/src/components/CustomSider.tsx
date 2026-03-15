import { useEffect, type CSSProperties } from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Tooltip, IconButton, Avatar, Typography, Divider,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import ListOutlined from '@mui/icons-material/ListOutlined';
import {
  CanAccess,
  type ITreeMenu,
  useMenu,
  useRouterType,
  useLink,
  useRouterContext,
} from '@refinedev/core';
import { useThemedLayoutContext } from '@refinedev/mui';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';

const DRAWER_WIDTH = 252;
const COLLAPSED_WIDTH = 72;

const DARK = '#0f1a2e';
const DARK_HOVER = 'rgba(255,255,255,0.06)';
const DARK_ACTIVE = 'rgba(255,255,255,0.1)';
const DARK_BORDER = 'rgba(255,255,255,0.08)';
const TEXT_DIM = 'rgba(255,255,255,0.5)';
const TEXT_LIGHT = 'rgba(255,255,255,0.85)';
const ACCENT = '#4a90d9';

export function CustomSider() {
  const {
    siderCollapsed,
    setSiderCollapsed,
    mobileSiderOpen,
    setMobileSiderOpen,
  } = useThemedLayoutContext();

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?';

  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const ActiveLink = routerType === 'legacy' ? LegacyLink : Link;

  const { menuItems, selectedKey, defaultOpenKeys } = useMenu();

  const width = siderCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const renderItems = (tree: ITreeMenu[], currentKey?: string, collapsed?: boolean) =>
    tree.map((item) => {
      const { icon, label, route, name, children, meta, options, parentName } = item;
      const isSelected = item.key === currentKey;
      const isNested = !!(meta?.parent ?? options?.parent ?? parentName);
      const linkStyle: CSSProperties = isSelected ? { pointerEvents: 'none' } : {};

      if (children.length > 0) return null;

      return (
        <CanAccess key={item.key} resource={name} action="list" params={{ resource: item }}>
          <Tooltip title={label ?? name} placement="right" disableHoverListener={!collapsed} arrow>
            <ListItemButton
              component={ActiveLink}
              to={route}
              selected={isSelected}
              style={linkStyle}
              onClick={() => setMobileSiderOpen(false)}
              sx={{
                mx: 1.25,
                mb: 0.5,
                borderRadius: 2,
                px: collapsed ? 1.5 : 2,
                py: 1.15,
                position: 'relative',
                color: isSelected ? '#fff' : TEXT_DIM,
                bgcolor: isSelected ? DARK_ACTIVE : 'transparent',
                '&:hover': {
                  bgcolor: isSelected ? DARK_ACTIVE : DARK_HOVER,
                  color: TEXT_LIGHT,
                },
                justifyContent: collapsed ? 'center' : 'flex-start',
                // Left accent bar for active item
                '&::before': isSelected ? {
                  content: '""',
                  position: 'absolute',
                  left: -10,
                  top: '20%',
                  bottom: '20%',
                  width: 3,
                  borderRadius: 2,
                  bgcolor: ACCENT,
                } : {},
              }}
            >
              <ListItemIcon
                sx={{
                  justifyContent: 'center',
                  minWidth: 22,
                  mr: collapsed ? 0 : 1.75,
                  color: isSelected ? '#fff' : 'inherit',
                  transition: 'margin 0.2s',
                  '& .MuiSvgIcon-root': { fontSize: 21 },
                }}
              >
                {icon ?? <ListOutlined />}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 600 : 400,
                    letterSpacing: '0.01em',
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </CanAccess>
      );
    });

  const siderContent = (collapsed: boolean) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: DARK }}>
      {/* Top section: toggle */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          px: collapsed ? 0 : 1.5,
          flexShrink: 0,
        }}
      >
        <IconButton
          size="small"
          onClick={() => setSiderCollapsed(!collapsed)}
          sx={{
            width: 34,
            height: 34,
            color: TEXT_DIM,
            border: '1px solid',
            borderColor: DARK_BORDER,
            borderRadius: 1.5,
            '&:hover': { bgcolor: DARK_HOVER, color: TEXT_LIGHT },
          }}
        >
          {collapsed ? <ChevronRightIcon sx={{ fontSize: 18 }} /> : <ChevronLeftIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      {/* Section label */}
      {!collapsed && (
        <Typography
          sx={{
            px: 2.75,
            pt: 0.5,
            pb: 1,
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: TEXT_DIM,
          }}
        >
          Navigation
        </Typography>
      )}

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflowX: 'hidden', overflowY: 'auto' }}>
        <List disablePadding>
          {renderItems(menuItems, selectedKey, collapsed)}
        </List>
      </Box>

      {/* Bottom: User profile + logout */}
      {user && (
        <>
          <Divider sx={{ borderColor: DARK_BORDER, mx: 1.5 }} />
          <Box
            sx={{
              px: collapsed ? 0 : 2,
              py: 1.75,
              display: 'flex',
              flexDirection: collapsed ? 'column' : 'row',
              alignItems: 'center',
              gap: collapsed ? 1 : 1.25,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <Tooltip title={collapsed ? user.name : ''} placement="right" arrow>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: ACCENT,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>
            </Tooltip>
            {!collapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    color: TEXT_LIGHT,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name}
                </Typography>
                <Typography sx={{ color: TEXT_DIM, fontSize: '0.75rem', lineHeight: 1.3 }}>
                  ${user.balance} &middot; {user.country}
                </Typography>
              </Box>
            )}
            <Tooltip title="Logout" placement="right" arrow>
              <IconButton
                size="small"
                onClick={() => dispatch(logout())}
                sx={{
                  color: TEXT_DIM,
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  '&:hover': { bgcolor: DARK_HOVER, color: TEXT_LIGHT },
                }}
              >
                <LogoutIcon sx={{ fontSize: collapsed ? 18 : 19 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      {/* Spacer for desktop */}
      <Box
        sx={{
          width: { xs: 0, md: width },
          display: { xs: 'none', md: 'block' },
          transition: 'width 0.2s ease',
          flexShrink: 0,
        }}
      />

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileSiderOpen}
        onClose={() => setMobileSiderOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            border: 'none',
            bgcolor: DARK,
          },
        }}
      >
        {siderContent(false)}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width,
            overflow: 'hidden',
            transition: 'width 0.2s ease',
            border: 'none',
            bgcolor: DARK,
            boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        {siderContent(siderCollapsed)}
      </Drawer>
    </>
  );
}
