import React, { useState, useEffect } from "react"
import { Stack, Typography, Grid, Button, TextField, 
    Collapse, FormGroup, FormControlLabel, Checkbox} from "@mui/material";
import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { Stage, Layer, Circle, Image } from 'react-konva';
import useImage from 'use-image';
import { MapProps } from '../../models/props';
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

interface ComponentState {
}

export class MapComponent extends React.Component<MapProps, ComponentState> {

}