import React from 'react';
import './App.css';
import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import { AppProps, HeaderProps, MapProps, PlotFinderProps } from './models/props';
import { HeaderComponent } from './components/header/header';
import { PlotFinderComponent } from './components/pg_map/page';
import { Collapse } from '@mui/material';

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

interface AppState {
  headerVisible: boolean
}

export class App extends React.Component<AppProps, AppState> {
  // private apiService: ApiService

  constructor(props: AppProps) {
    super(props)
    // this.apiService = new ApiService();
    this.state = {
      headerVisible: true
    }
  }

  render(): JSX.Element {
    const HeaderProps: HeaderProps = {}
    const pageProps: PlotFinderProps = {
      // apiService: this.apiService,
      theme: THEME,
      setHeaderVisible: (visible: boolean) => {
        this.setState({
          headerVisible: visible
        })
      }

    }
    return (
      <ThemeProvider theme={THEME}>
        <Collapse in={this.state.headerVisible}>
          <HeaderComponent {...HeaderProps}/>
        </Collapse>
        <div className='app-container'>
          <PlotFinderComponent {...pageProps} />
        </div>
      </ThemeProvider>
    )
  }
}