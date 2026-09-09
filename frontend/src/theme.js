import { createTheme } from '@mui/material/styles';

// Paleta:
// fundo grafite-azulado (não preto puro), um único acento "sinal" em ciano-fosforo
// reservado para ações e estados ativos, e a tríade semântica clássica
// (verde/âmbar/vermelho) reservada só para status de servidor — nunca decorativa.
export const colors = {
  bg: '#0B0E14',
  panel: '#131826',
  elevated: '#1B2130',
  border: 'rgba(231,234,242,0.09)',
  borderStrong: 'rgba(231,234,242,0.16)',
  textPrimary: '#E7EAF2',
  textSecondary: '#8A93A8',
  accent: '#2FD8C4',
  accentHover: '#26BFAD',
  online: '#34D399',
  degraded: '#F2A63D',
  offline: '#F2495C'
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: colors.bg, paper: colors.panel },
    primary: { main: colors.accent, contrastText: '#06110F' },
    error: { main: colors.offline },
    warning: { main: colors.degraded },
    success: { main: colors.online },
    text: { primary: colors.textPrimary, secondary: colors.textSecondary },
    divider: colors.border
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: "'Space Grotesk', sans-serif",
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: colors.bg }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colors.panel,
          border: `1px solid ${colors.border}`
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, paddingInline: 16 },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' }
        },
        outlined: {
          borderColor: colors.borderStrong,
          '&:hover': { borderColor: colors.accent, backgroundColor: 'rgba(47,216,196,0.08)' }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border}`,
          color: colors.textPrimary
        },
        head: {
          color: colors.textSecondary,
          fontSize: '0.72rem',
          fontWeight: 500,
          letterSpacing: '0.02em'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(231,234,242,0.03)' }
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(231,234,242,0.08)' }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'filled' }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.elevated,
          borderRadius: 6,
          '&:before, &:after': { display: 'none' },
          '&:hover': { backgroundColor: colors.elevated }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundColor: colors.elevated, backgroundImage: 'none' }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: colors.panel, backgroundImage: 'none' }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: 'rgba(231,234,242,0.06)' } }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: colors.elevated, fontSize: '0.75rem' }
      }
    }
  }
});

export default theme;
