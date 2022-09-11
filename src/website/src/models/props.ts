import { Theme } from '@mui/material/styles';

export interface AppProps {}

export interface HeaderProps {
}

export interface BaseProps {
    theme: Theme
    setHeaderVisible: (visible: boolean) => void
}

export interface PlotFinderProps extends BaseProps {
}

export interface SearchProps extends BaseProps {
    plotsTsvRaw: string
    onPlotSelect: (zone: string, number: string) => void
}

export interface MapProps extends BaseProps {
    onBack: () => void
    getLocation: () => [string, string] | null
}

export interface LoginProps extends BaseProps {
    onAuthenticate: () => void
    password: string
}
