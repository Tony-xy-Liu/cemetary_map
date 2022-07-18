import React from 'react';
import './App.css';
import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import { AppProps, HeaderProps, MapProps } from './models/props';
import { HeaderComponent } from './components/header/header';
import { MapComponent } from './components/pg_map/map';

// ts typing for mui theme
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

const THEME: Theme = createTheme({
  typography: {
    fontFamily: [
      "Open Sans",
      "sans-serif"
    ].join(",")
  },
  palette: {  
    primary: {
      main: '#00518A',
      contrastText: '#FFFFFF',
    },
    
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
});

interface AppState {}

export class App extends React.Component<AppProps, AppState> {
  // private apiService: ApiService

  constructor(props: AppProps) {
    super(props)
    // this.apiService = new ApiService();
  }

  render(): JSX.Element {
    const HeaderProps: HeaderProps = {}
    const DownloadsProps: MapProps = {
      // apiService: this.apiService,
      theme: THEME,
    }
    return (
      <ThemeProvider theme={THEME}>
        <HeaderComponent {...HeaderProps}/>
        <div className='app-container'>
          <MapComponent {...DownloadsProps} />
        </div>
      </ThemeProvider>
    )
  }
}