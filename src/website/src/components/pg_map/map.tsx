import React, { useState, useEffect } from "react"
import { Stack, Typography, Grid, Button, TextField, 
    Collapse, FormGroup, FormControlLabel, Checkbox, Fab} from "@mui/material";
import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { Stage, Layer, Circle, Image } from 'react-konva';
import useImage from 'use-image';
import { MapProps } from '../../models/props';
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import WestIcon from '@mui/icons-material/West';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// const MapImage = () => {
//     const [image] = useImage('assets/map.png');
//     const [W, H] = [1403, 1379]
//     let s = window.innerWidth*8/12 / W  
//     return <Image
//         scaleX={s}
//         scaleY={s}
//         image={image}
//     />;
// };

interface GraveData {
    id: string // zone + number
    zone: string
    number: string
    searchName: string
    displayName: string
    year: string
    month: string
    day: string
}

interface ComponentState {
    showDot: boolean
    passwordAttempt: string
    authenticated: boolean
    acceptCookies: boolean
    passwordColor: "primary" | "error"
    queryResults: GraveData[]
    selection: any[]
    mapSize: number[]
    zoom: number
    baseZoom: number
    zoomOffset: number[]
}

export class MapComponent extends React.Component<MapProps, ComponentState> {
    private firstMounted: boolean = false
    private graveDataMap: Map<string, GraveData> = new Map()
    private metric: string

    constructor(props: MapProps) {
        super(props)
        this.state = {
            showDot: false,
            passwordAttempt: "",
            authenticated: false,
            acceptCookies: false,
            passwordColor: "primary",
            queryResults: [],
            selection: [],
            mapSize: [0, 0],
            zoom: 1,
            baseZoom: 1,
            zoomOffset: [0, 0]
        }

        this.metric = window.innerWidth < window.innerHeight? "vw" : "vh"
    }

    public componentDidMount() {
        if (this.firstMounted) return

        this.onResize()
        window.addEventListener('resize', ()=>this.onResize());

        this.firstMounted = true
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

    private getLocation() {
        const loc = this.props.getLocation()
        if (loc === null) {
            return {
                left: "-500px",
                top: "-500px",
            }
        }

        const [zone, num] = loc
        let locXY = [-500, -500]
        switch (zone) {
            case "M":
                locXY = [80, 400]
                break
            case "L":
                locXY = [80, 90]
                break
            case "K":
                locXY = [200, 90]
                break
            case "J":
                locXY = [330, 40]
                break
            case "I":
                locXY = [100, 180]
                break
            case "H":
                locXY = [340, 120]
                break
            case "G":
                locXY = [400, 260]
                break
            case "F":
                locXY = [380, 330]
                break
            case "E":
                locXY = [220, 220]
                break
            case "D":
                locXY = [440, 380]
                break
            case "C":
                locXY = [390, 420]
                break
            case "B":
                locXY = [290, 330]
                break
            case "A":
                locXY = [220, 400]
                break
        }
        let [x, y] = locXY
        const assumedLen = 510
        x = x/assumedLen * 100
        y = y/assumedLen * 100
        return {
            left: `${x}${this.metric}`,
            top: `${y}${this.metric}`,
        }
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
            <div style={{height: "100vh"}}>
                <Fab
                    color="primary"
                    style={{
                        width: "1.2em",
                        height: "1.2em",
                        position: "fixed",
                        fontSize: "4em",
                        left: "0.25em",
                        top: "0.25em"
                    }}
                    onClick={()=>{
                        this.props.onBack()
                    }}
                >
                    <WestIcon fontSize="inherit"/>
                </Fab>
                <TransformWrapper
                    maxScale={6}
                >
                    <TransformComponent>
                        <a style={{position: "relative", fontSize: "2.5em", height: "100vh"}}>

                            <LocationOnIcon
                                color="error"
                                fontSize="inherit"
                                style={{
                                    position: "absolute",
                                    ...this.getLocation(),
                                    // left: "600px",
                                    // top: "800px",
                                }}
                            />
                            <img src="assets/map.png" style={{
                                width: `100${this.metric}`, height: `100${this.metric}`
                                }}></img>
                        </a>
                    </TransformComponent>
                </TransformWrapper>
                <Typography variant="body1" align="right" color="error" style={{
                    fontStyle: "italic", position: "absolute", right: "2vw", top: "2vw"
                }}>
                    location is to the nearest zone
                </Typography>
            </div>
            // <img src="assets/map.png"></img>
        )
    }
}