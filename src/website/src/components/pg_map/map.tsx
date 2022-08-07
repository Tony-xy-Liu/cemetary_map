import React, { useState, useEffect } from "react"
import { Stack, Typography, Grid, Button, TextField, 
    Collapse, FormGroup, FormControlLabel, Checkbox} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { Stage, Layer, Circle, Image } from 'react-konva';
import useImage from 'use-image';
import { MapProps } from '../../models/props';
import Cookies from 'universal-cookie'

const MapImage = () => {
    const [image] = useImage('assets/map.png');
    const [W, H] = [1403, 1379]
    let s = window.innerWidth*8/12 / W  
    return <Image
        scaleX={s}
        scaleY={s}
        image={image}
    />;
};

interface ComponentState {
    showDot: boolean
    passwordAttempt: string
    authenticated: boolean
    acceptCookies: boolean
    passwordColor: "primary" | "error"
    mapSize: number[]
    zoom: number
    baseZoom: number
    zoomOffset: number[]
}

export class MapComponent extends React.Component<MapProps, ComponentState> {
    private readonly COOKIES: Cookies = new Cookies() 
    private PASSWORD: String = ""
    private searchVal: string = ""
    private lastSearch: number = Date.now()

    constructor(props: MapProps) {
        super(props)
        this.searchVal = ""
        this.state = {
            showDot: false,
            passwordAttempt: "",
            authenticated: false,
            acceptCookies: false,
            passwordColor: "primary",
            mapSize: [0, 0],
            zoom: 1,
            baseZoom: 1,
            zoomOffset: [0, 0]
        }
    }

    public componentDidMount() {
        const auth = this.COOKIES.get('auth')
        fetch("assets/password.txt")
            .then((res) => {
                return res.text()
            }).then((pass) => {
                this.PASSWORD = pass
                const valid = auth && auth == pass
                if (valid) {
                    this.setState({
                        authenticated: true
                    })
                }
            })

        this.onResize()
        window.addEventListener('resize', ()=>this.onResize());
    }

    private search(force: boolean=false){
        const PERIOD = 500

        const doSearch = () => {
            if(this.searchVal) {
                this.setState({showDot: true})
            }
        }

        if (force) {
            doSearch()
        } else {
            this.lastSearch = Date.now()
            setTimeout(() => {
                if (Date.now() - this.lastSearch >= PERIOD) {
                    doSearch()
                }
            }, PERIOD);
        }
    }

    private checkPassword(attempt: string) {
        const match = this.PASSWORD && attempt == this.PASSWORD
        return match
    }

    private submitPassword() {
        const match = this.checkPassword(this.state.passwordAttempt)

        if (!match) {
            alert("wrong password")
        }

        if (match && this.state.acceptCookies) {
            this.COOKIES.set('auth', this.state.passwordAttempt, {expires: new Date(Date.now()+86400000*30)})
        }

        this.setState({
            authenticated: match,
            passwordColor: match? "primary" : "error",
            passwordAttempt: match? this.state.passwordAttempt : "",
        })
    }

    private onResize() {
        const rwidth = window.innerWidth;
        const width = rwidth<900? rwidth : rwidth*8/12
        const height = window.innerHeight;
        // console.log([l<900, sl])
        const z = rwidth<900? 11/8 : 1
        this.setState({
            mapSize: [width, height],
            baseZoom: z,
            zoom: z
        })
    }

    private onMapClick(e: any) {
        // const v = e.evt.clientX? e.evt : e.evt.changedTouches[0]
        const v = e.currentTarget.pointerPos
        const s = 0.6
        const maxZoom = this.state.baseZoom * 3
        const zoomed = this.state.zoom < maxZoom
        this.setState({
            zoom: zoomed? maxZoom: this.state.baseZoom,
            zoomOffset: zoomed? [v.x*s, v.y*s] : [0, 0]
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
            <Grid container justifyContent='center' style={outerStyle}>
                <Grid item md={8} xs={12}>
                    <Collapse in={!this.state.authenticated} style={{paddingTop: "2em", paddingBottom: "2em"}}>
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
                    </Collapse>
                </Grid>
                <Grid item md={8} xs={12}>
                    <Collapse in={this.state.authenticated}>
                        <Stack direction="row" spacing={HSPACE}>
                            <Button 
                                variant="contained"
                                onClick={()=>this.search(true)}
                            >
                                <SearchIcon/>
                            </Button>
                            <TextField
                                fullWidth
                                label="Find the departed by name"
                                variant="outlined"
                                onChange={(v)=>{
                                    this.searchVal = v.target.value
                                    this.search()
                                    this.setState({showDot: false})
                                }}
                                onKeyDown={(k)=>{k.code==="Enter" && this.search(true)}}
                            />
                        </Stack>
                    </Collapse>
                </Grid>
                <Grid item md={8} xs={12} spacing={VSPACE} style={{paddingTop: "2em"}}>
                    <Collapse in={this.state.authenticated}>
                        <Stage
                            width={this.state.mapSize[0]}
                            height={this.state.mapSize[1]}
                            onTap={(e)=>this.onMapClick(e)}
                            onClick={(e)=>this.onMapClick(e)}
                            scaleX={this.state.zoom}
                            scaleY={this.state.zoom}
                            offsetX={this.state.zoomOffset[0]}
                            offsetY={this.state.zoomOffset[1]}
                        >
                            <Layer>
                                <MapImage/>
                            </Layer>
                            <Layer>
                                <Circle
                                    key={"s1"}
                                    id={"s1"}
                                    x={600}
                                    y={500}
                                    radius={10}
                                    numPoints={5}
                                    innerRadius={20}
                                    outerRadius={40}
                                    fill="#972020"
                                    visible={this.state.showDot}
                                />
                            </Layer>
                        </Stage>
                    </Collapse>
                </Grid>
            </Grid>
        )
    }
}