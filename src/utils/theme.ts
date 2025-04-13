import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    threadsDark: {
      main: string;
      light: string;
      lighter: string;
      dark: string;
      text: string;
      border: string;
      background: string;
      backgroundSecondary: string;
      cardBackground: string;
    };
    threadsLight: {
      main: string;
      light: string;
      dark: string;
      text: string;
      border: string;
      background: string;
      backgroundSecondary: string;
      cardBackground: string;
    };
  }

  interface PaletteOptions {
    threadsDark: {
      main: string;
      light: string;
      lighter: string;
      dark: string;
      text: string;
      border: string;
      background: string;
      backgroundSecondary: string;
      cardBackground: string;
    };
    threadsLight: {
      main: string;
      light: string;
      dark: string;
      text: string;
      border: string;
      background: string;
      backgroundSecondary: string;
      cardBackground: string;
    };
  }
}

// Dark theme (default for Threads)
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
      light: '#EFEFEF',
      dark: '#AAAAAA',
    },
    secondary: {
      main: '#1F1F1F',
      light: '#2A2A2A',
      dark: '#121212',
    },
    threadsDark: {
      main: '#000000',
      light: '#1A1A1A',
      lighter: '#2A2A2A',
      dark: '#000000',
      text: '#FFFFFF',
      border: '#333333',
      background: '#000000',
      backgroundSecondary: '#0F0F0F',
      cardBackground: '#101010',
    },
    threadsLight: {
      main: '#FFFFFF',
      light: '#F9F9F9',
      dark: '#E0E0E0',
      text: '#000000',
      border: '#DBDBDB',
      background: '#FFFFFF',
      backgroundSecondary: '#FAFAFA',
      cardBackground: '#FFFFFF',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#AAAAAA',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.9rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.43,
    },
    caption: {
      fontSize: '0.75rem',
      color: '#8E8E8E',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#FFFFFF',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#EFEFEF',
          },
        },
        outlined: {
          borderColor: '#333333',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#333333',
            },
            '&:hover fieldset': {
              borderColor: '#555555',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFFFFF',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#101010',
          borderRadius: 12,
          border: '1px solid #333333',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#333333',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#101010',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
        },
      },
    },
  },
});

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
    },
    secondary: {
      main: '#F5F5F5',
      light: '#FFFFFF',
      dark: '#E0E0E0',
    },
    threadsDark: {
      main: '#000000',
      light: '#1A1A1A',
      lighter: '#2A2A2A',
      dark: '#000000',
      text: '#FFFFFF',
      border: '#333333',
      background: '#000000',
      backgroundSecondary: '#0F0F0F',
      cardBackground: '#101010',
    },
    threadsLight: {
      main: '#FFFFFF',
      light: '#F9F9F9',
      dark: '#E0E0E0',
      text: '#000000',
      border: '#DBDBDB',
      background: '#FFFFFF',
      backgroundSecondary: '#FAFAFA',
      cardBackground: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#8E8E8E',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.9rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.43,
    },
    caption: {
      fontSize: '0.75rem',
      color: '#8E8E8E',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlined: {
          borderColor: '#DBDBDB',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#DBDBDB',
            },
            '&:hover fieldset': {
              borderColor: '#A8A8A8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #EFEFEF',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#DBDBDB',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
        },
      },
    },
  },
});

export default darkTheme; 