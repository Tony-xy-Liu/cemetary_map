import React, { useState, useEffect } from "react"
import { Stack, Typography, Grid, Button, IconButton, TextField, 
    Collapse, Paper, List} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { SearchProps } from '../../models/props';
import Fuse from 'fuse.js'
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
    searched: boolean
    queryResults: GraveData[]
}

export class SearchComponent extends React.Component<SearchProps, ComponentState> {
    private searchVal: string = ""
    private lastSearch: number = Date.now()
    private graveDataMap: Map<string, GraveData> = new Map()
    private fuseYear: Fuse<GraveData> | undefined
    private fuseName: Fuse<GraveData> | undefined

    constructor(props: SearchProps) {
        super(props)
        this.searchVal = ""
        this.state = {
            searched: false,
            queryResults: [],
        }

        this.graveDataMap = this.props.plotsTsvRaw
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

            this.setState({
                searched: true,
                queryResults: results,
            })
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

    private renderResults(results: GraveData[]) {
        if (results.length == 0) {
            const message = this.state.searched? "Apologies, no results found." : "Awaiting search..."
            return (
                <Typography variant="subtitle1">
                    {message}
                </Typography>
            )
        }

        const topResults = results.filter((v, i) => true)

        return (
            <List style={{height: "55vh", overflow: "scroll", borderTop: "1px solid grey", borderBottom: "1px solid grey"}}>
                {topResults.map((result, i) => {
                    return (
                        <li key={`search_result_${i}`}>
                            <Paper elevation={3} style={{padding: "0.5em", margin: "0.2em", marginBottom: "1em", marginRight: "0.7em"}}>
                                <Grid container>
                                    <Grid item md={10} xs={9}>
                                        <Stack>
                                            <Typography variant="h4" align="left">
                                                {result.displayName}
                                            </Typography>
                                            <Typography variant="body1" align="left">
                                                died {result.year}, grave {result.zone}{result.number}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item md={2} xs={3}>
                                        <Button
                                            color="primary"
                                            variant="text"
                                            style={{marginLeft: "0.7em", fontSize: "3.5em"}}
                                            onClick={(event)=>{
                                                this.props.onPlotSelect(result.zone, result.number)
                                            }}
                                        >
                                            <LocationOnIcon fontSize="inherit"/>
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </li>
                    )})
                }
            </List>
        )
    }

    render(): JSX.Element {
        const [HSPACE, VSPACE] = [1, 1]

        return (
            <Grid container justifyContent='center'>
                <Grid item md={8} xs={12}>
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
                            }}
                            onKeyDown={(k)=>{k.code==="Enter" && this.search(true)}}
                        />
                    </Stack>
                </Grid>
                <Grid item md={8} xs={12} style={{paddingTop: "1em"}}>
                    {this.renderResults(this.state.queryResults)}
                </Grid>
            </Grid>
        )
    }
}