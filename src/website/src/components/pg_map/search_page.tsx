import React, { useState, useEffect } from "react"
import { Stack, Typography, Grid, Button, TextField, 
    Collapse, FormGroup, FormControlLabel, Checkbox} from "@mui/material";
import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { Stage, Layer, Circle, Image } from 'react-konva';
import useImage from 'use-image';
import { SearchPageProps } from '../../models/props';
import Cookies from 'universal-cookie'
import Fuse from 'fuse.js'

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

export class SearchComponent extends React.Component<SearchPageProps, ComponentState> {
    private readonly COOKIES: Cookies = new Cookies() 
    private PASSWORD: String = ""
    private searchVal: string = ""
    private lastSearch: number = Date.now()
    private firstMounted: boolean = false
    private graveDataMap: Map<string, GraveData> = new Map()
    private fuseYear: Fuse<GraveData> | undefined
    private fuseName: Fuse<GraveData> | undefined

    constructor(props: SearchPageProps) {
        super(props)
        this.searchVal = ""
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

    }

    public componentDidMount() {
        if (this.firstMounted) return

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
        fetch("assets/plots.tsv")
            .then((res) => {
                return res.text()
            }).then((raw) => {
                this.graveDataMap = raw
                    .split('\n')
                    .map((row) => {
                        row = row.replace('\r', '')
                        const [site, dName, _, burriedDate] = row.split('\t')
                        const [zone, number] = site.split(' - ')
                        const [year, month, day] = burriedDate.split('-')
                        return {
                            zone: zone, number: number,
                            searchName: dName.toLowerCase(), displayName: dName,
                            year: year, month: month, day: day,
                            id: site,
                        }
                    }).reduce((acc, curr) => {
                        acc.set(curr.id, curr)
                        return acc
                    }, new Map<string, GraveData>())

                const optYear: Fuse.IFuseOptions<GraveData>  = {
                    includeScore: true,
                    keys: ['year'],
                };
                const optName: Fuse.IFuseOptions<GraveData>  = {
                    includeScore: true,
                    keys: ['searchName'],
                };

                const graveDataList = Array.from(this.graveDataMap.values())
                this.fuseYear = new Fuse(graveDataList, optYear)
                this.fuseName = new Fuse(graveDataList, optName)
            })

        this.onResize()
        window.addEventListener('resize', ()=>this.onResize());

        this.firstMounted = true
    }

    private search(force: boolean=false){
        const PERIOD = 500

        const doSearch = () => {
            if (!this.searchVal) return
            if (!this.fuseName || !this.fuseYear) return

            let yearRaw: any = this.searchVal.match(/\d{4}|\d{2}/)
            yearRaw = yearRaw? yearRaw[0] : ""
            yearRaw = yearRaw.length == 2? `19${yearRaw}` : yearRaw
            const sYear: string = yearRaw

            const sName: string = this.searchVal.replace(sYear, '')
            if (sName.length==0) return

            const nResults = this.fuseName.search(sName)
                .reduce((acc, curr) => {
                    acc.set(curr.refIndex, curr)
                    return acc
                }, new Map<number, Fuse.FuseResult<GraveData>>())

            // update with year score
            if (sYear != "") {
                const yResults = this.fuseYear.search(sYear)
                .reduce((acc, res) => {
                    if ((res.score? res.score:1) > 0.01) return acc // stricter matching for year
                    const nRes = nResults.get(res.refIndex)
                    if (!nRes) return acc // only those with name matches
                    if (nRes.score && res.score)
                        nRes.score += res.score
                    nResults.set(res.refIndex, nRes)

                    acc.set(res.refIndex, res)
                    return acc
                }, new Map<number, Fuse.FuseResult<GraveData>>())

                for (let key of nResults.keys()) {
                    const yRes = yResults.get(key)
                    let yScore
                    if (!yRes) {
                        yScore = 1
                    } else {
                        yScore = yRes.score? yRes.score:1
                    }

                    const nRes = nResults.get(key)
                    if (!nRes || !nRes.score) continue // never happens
                    nRes.score += yScore * 0.5
                    nResults.set(key, nRes)
                }
            }
            const resultsAll = Array.from(nResults.values())

            const minScore = resultsAll.reduce((acc, res) => {
                const resScore = res.score? res.score:1
                return resScore < acc? resScore:acc
            }, 1)

            const results = resultsAll
                .filter((res) => {
                    return (res.score? res.score: 0) < minScore*1.05
                }).sort((a, b) => {
                    return (a.score? a.score:1) - (b.score? b.score:1)
                // }).map((res) => {
                //     return [res.item.displayName, res.item.year, res.score]
                }).map((res) => {
                    return res.item
                }).filter((res, i) => {
                    return i < 10
                })

            this.setState({queryResults: results})
        }

        this.lastSearch = Date.now()
        if (force) {
            doSearch()
        } else {
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
                    <Collapse in={! this.state.authenticated} style={{paddingTop: "2em", paddingBottom: "2em"}}>
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
                                label='Find the deceased'
                                placeholder='terrance stanley fox 1981'
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
                <Grid item md={8} xs={12} spacing={VSPACE} style={{paddingTop: "1em"}}>
                    <Collapse in={this.state.authenticated}>
                        <DataGrid
                            rows={this.state.queryResults}
                            columns={[
                                {sortable: false, field: "displayName",     headerName: "Name",             width: 200},
                                {sortable: false, field: "year",            headerName: "Year Deceased",    width: 150},
                                {sortable: false, field: "zone",            headerName: "Zone",             width: 60},
                                {sortable: false, field: "number",          headerName: "Grave Number",     width: 120},
                            ]}
                            rowsPerPageOptions={[10]}
                            onPageSizeChange={() => {}}
                            onSelectionModelChange={(ids: GridSelectionModel) => {
                                this.setState({
                                    selection: ids,
                                })
                                ids.map((x) => {
                                    console.log(x)
                                })
                            }}
                            onRowClick={(x) => {
                                console.log(x.row)
                            }}
                            density="compact"
                            disableSelectionOnClick
                            // checkboxSelection={true}
                            disableColumnMenu
                            disableColumnFilter
                            disableColumnSelector
                            autoHeight
                            // style={{
                            //     opacity: this.state.working? 0.25: 1,
                            // }}
                            components={{
                                NoRowsOverlay: () => (
                                <Stack height="100%" alignItems="center" justifyContent="center">
                                    No results
                                </Stack>
                                ),
                            }}
                        />
                    </Collapse>
                </Grid>
                <Grid item md={8} xs={12} spacing={VSPACE} style={{paddingTop: "2em"}}>
                    <Collapse in={this.state.authenticated}>
                        {/* <Stage
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
                        </Stage> */}
                    </Collapse>
                </Grid>
            </Grid>
        )
    }
}