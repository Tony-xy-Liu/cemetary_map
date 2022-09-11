import React from 'react';
// import './header.css';
import { Grid, Stack, Typography, AppBar, Toolbar, Box} from "@mui/material";
import { HeaderProps } from '../../models/props'
import HomeIcon from '@mui/icons-material/Home';


interface ComponentState {
}

export class HeaderComponent extends React.Component<HeaderProps, ComponentState> {
    constructor(props: HeaderProps) {
        super(props)
        // this.theme = props.theme
        this.state = {
        }
    }
    render(): JSX.Element {
        return (
            <AppBar position="static" color="primary" style={{paddingTop: "5px", paddingBottom: "5px"}}>
                <span className="font-link">
                <Toolbar>
                    <Grid
                        width="100%"
                        container
                        alignItems="left"
                        justifyContent="left">
                        <Grid item xs={2}></Grid>
                        <Grid item xs={8}>
                            <Box
                                component="img"
                                alt="Temple Sholom Logo"
                                src="assets/temple_sholom_logo.png"
                            />
                        </Grid>
                        <Grid item xs={2}></Grid>
                        
                        {/* <Grid item xs={8}></Grid> */}
                    </Grid>
                </Toolbar>
                </span>
            </AppBar>
        )
    }
}