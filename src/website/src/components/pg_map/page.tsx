import React, { useState, useEffect } from "react"
import { Stack, Typography, Grid, Button, TextField, 
    Collapse, FormGroup, FormControlLabel, Checkbox} from "@mui/material";
import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { Stage, Layer, Circle, Image } from 'react-konva';
import useImage from 'use-image';
import { LoginProps, SearchProps, MapProps, PlotFinderProps } from '../../models/props';
import Cookies from 'universal-cookie'
import Fuse from 'fuse.js'
import { LoginComponent } from "./login";
import { SearchComponent } from "./search";
import { MapComponent } from "./map";

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
    // showDot: boolean
    // passwordAttempt: string
    // authenticated: boolean
    // acceptCookies: boolean
    // passwordColor: "primary" | "error"
    // queryResults: GraveData[]
    // selection: any[]
    // mapSize: number[]
    // zoom: number
    // baseZoom: number
    // zoomOffset: number[]

    view: "password" | "search" | "map"
    loginComponent: any
    searchComponent: any
    selectedPlot: [string, string] | null
}

export class PlotFinderComponent extends React.Component<PlotFinderProps, ComponentState> {
    private readonly COOKIES: Cookies = new Cookies() 
    private PASSWORD: String = ""
    private searchVal: string = ""
    private lastSearch: number = Date.now()
    private firstMounted: boolean = false
    private graveDataMap: Map<string, GraveData> = new Map()
    private fuseYear: Fuse<GraveData> | undefined
    private fuseName: Fuse<GraveData> | undefined

    constructor(props: PlotFinderProps) {
        super(props)
        this.searchVal = ""
        this.state = {
            // showDot: false,
            // passwordAttempt: "",
            // authenticated: false,
            // acceptCookies: false,
            // passwordColor: "primary",
            // queryResults: [],
            // selection: [],
            // mapSize: [0, 0],
            // zoom: 1,
            // baseZoom: 1,
            // zoomOffset: [0, 0]

            view: "password",
            loginComponent: null,
            searchComponent: null,
            selectedPlot: null
        }

    }

    public componentDidMount() {
        if (this.firstMounted) return
        fetch("assets/password.txt")
            .then((res) => {
                return res.text()
            }).then((pass) => {
                const loginProps: LoginProps = {
                    ...this.props,
                    onAuthenticate: ()=>{
                        this.setState({
                            view: "search"
                        })
                        // this.props.setHeaderVisible(false)
                    },
                    password: pass
                }

                this.setState({
                    loginComponent: (
                        <LoginComponent {...loginProps}/>
                    )
                })
            })

        fetch("assets/plots.csv")
            .then((res) => {
                return res.text()
            }).then((raw) => {
                const searchProps: SearchProps = {
                    ...this.props,
                    plotsTsvRaw: raw,
                    onPlotSelect: (zone, num) => {
                        this.setState({
                            selectedPlot: [zone, num],
                            view: "map"
                        })
                        this.props.setHeaderVisible(false)
                    }
                }

                this.setState({
                    searchComponent: (
                        <SearchComponent {...searchProps}/>
                    )
            })
            })

        // this.onResize()
        // window.addEventListener('resize', ()=>this.onResize());

        this.firstMounted = true
    }

    render(): JSX.Element {
        const [HSPACE, VSPACE] = [1, 1]
        const FORM_WIDTH = 12
        const outerStyle: React.CSSProperties = {
            paddingLeft: "22px",
            paddingRight: "22px",
            marginTop: '1em',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
        }

        const getStyle = (inview: string) => {
            if (this.state.view == inview) {
                return outerStyle
            } else {
                return {}
            }
        }

        const mapProps: MapProps = {
            ...this.props,
            onBack: () => {
                this.setState({
                    view: "search",
                })
                this.props.setHeaderVisible(true)
            },
            getLocation: () => {
                return this.state.selectedPlot
            }
        }

        return (
            <Stack>
                <Collapse in={this.state.view == "password"} style={getStyle("password")}>
                    {this.state.loginComponent}
                </Collapse>
                <Collapse in={this.state.view == "search"} style={getStyle("search")}>
                    {this.state.searchComponent}
                </Collapse>
                <Collapse in={this.state.view == "map"}>
                    <MapComponent {...mapProps} />
                </Collapse>
            </Stack>
        )
    }
}