import React from "react";
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
    password: string
    authenticated: boolean
    acceptCookies: boolean
}

export class MapComponent extends React.Component<MapProps, ComponentState> {
    private readonly COOKIES: Cookies = new Cookies() 
    private searchVal: string = ""
    private lastSearch: number = Date.now()
    constructor(props: MapProps) {
        super(props)
        this.searchVal = ""
        this.state = {
            showDot: false,
            password: "",
            authenticated: false,
            acceptCookies: false
        }
    }

    public componentDidMount() {
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

    private checkPassword() {
        // todo
        this.setState({authenticated: true})
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
                <Grid item xs={8}>
                    <Collapse in={!this.state.authenticated} style={{paddingTop: "2em", paddingBottom: "2em"}}>
                        <FormGroup>
                            <Grid container justifyContent="center" spacing={1}>
                                <Grid item xs={FORM_WIDTH}>
                                    <Typography variant="body1" style={{fontStyle: 'italic'}} align="left">
                                        Please enter the password to continue
                                    </Typography>
                                </Grid>
                                <Grid item xs={FORM_WIDTH}>
                                    <TextField label="Password" fullWidth variant="filled" required
                                        onChange={(x)=>this.setState({password: x.target.value})} />
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
                                            onClick={()=>this.checkPassword()}
                                            variant="outlined">
                                            Submit
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </FormGroup>
                    </Collapse>
                </Grid>
                <Grid item xs={8}>
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
                </Grid>
                <Grid item xs={8} spacing={VSPACE} style={{paddingTop: "2em"}}>
                    <Collapse in={this.state.authenticated}>
                        <Stage
                            width={window.innerWidth*8/12}
                            height={window.innerHeight-270}
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