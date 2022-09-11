import React, { useState, useEffect } from "react"
import { Stack, Typography, Grid, Button, TextField, 
    Collapse, FormGroup, FormControlLabel, Checkbox} from "@mui/material";
import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { Stage, Layer, Circle, Image } from 'react-konva';
import useImage from 'use-image';
import { LoginProps } from '../../models/props';
import Cookies from 'universal-cookie'
import Fuse from 'fuse.js'

interface ComponentState {
    // showDot: boolean
    passwordAttempt: string
    acceptCookies: boolean
    passwordColor: "primary" | "error"
    // queryResults: GraveData[]
    // selection: any[]
    // mapSize: number[]
    // zoom: number
    // baseZoom: number
    // zoomOffset: number[]

    // view: "password" | "search" | "map"
}

export class LoginComponent extends React.Component<LoginProps, ComponentState> {
    private readonly COOKIES: Cookies = new Cookies() 

    constructor(props: LoginProps) {
        super(props)
        this.state = {
            passwordAttempt: "",
            acceptCookies: false,
            passwordColor: "primary",
        }

        const auth = this.COOKIES.get('auth')
        const valid = auth && this.checkPassword(auth)
        if (valid) {
            this.props.onAuthenticate()
        }
    }

    private checkPassword(attempt: string) {
        const pass = this.props.password
        const match = pass && attempt == pass
        return match
    }

    private submitPassword() {
        const match = this.checkPassword(this.state.passwordAttempt)

        if (!match) {
            alert("wrong password")
        } else {
            this.props.onAuthenticate()
        }

        if (match && this.state.acceptCookies) {
            this.COOKIES.set('auth', this.state.passwordAttempt, {expires: new Date(Date.now()+86400000*30)})
        }

        this.setState({
            passwordColor: match? "primary" : "error",
            passwordAttempt: match? this.state.passwordAttempt : "",
        })
    }

    render(): JSX.Element {
        const [HSPACE, VSPACE] = [1, 1]
        const FORM_WIDTH = 12
        const outerStyle: React.CSSProperties = {
            paddingLeft: "22px",
            paddingRight: "22px",
            // marginTop: '2em',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
        }
        return (
            <FormGroup>
                <Grid container justifyContent="center" spacing={1}>
                    <Grid item xs={FORM_WIDTH}>
                        <Typography variant="body1" style={{fontStyle: 'italic'}} align="left">
                            Please enter the password to continue
                        </Typography>
                    </Grid>
                    <Grid item xs={FORM_WIDTH}>
                        <TextField
                            type="password" 
                            label="Password"
                            fullWidth
                            variant="filled"
                            required
                            color={this.state.passwordColor}
                            value={this.state.passwordAttempt}
                            onKeyDown={(x)=>{
                                if (x.key=="Enter") {
                                    this.submitPassword()
                                }
                            }}
                            onChange={(x)=>this.setState({
                                passwordAttempt: x.target.value,
                                passwordColor: "primary",
                            })} />
                    </Grid>
                    <Grid item xs={FORM_WIDTH}>
                        <Stack direction="row" justifyContent="right" spacing={HSPACE}>
                            <FormControlLabel control={
                                <Checkbox 
                                    checked={this.state.acceptCookies}
                                    onKeyDown={(k)=>{k.code==="Enter" && this.setState({acceptCookies: !this.state.acceptCookies})}}
                                    onClick={()=>this.setState({acceptCookies: !this.state.acceptCookies})}
                                    /> }
                                label="Accept cookie to remember me for 30 days" />
                            <Button
                                onClick={()=>this.submitPassword()}
                                variant="outlined">
                                Submit
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </FormGroup>
        )
    }
}