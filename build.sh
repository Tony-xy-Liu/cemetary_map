#!/bin/bash

ver="0.1.0"

for arg in "$@"; do
    case $arg in
    --react | -r)
        echo "building React client"
        wdir=`pwd`
        cd src/website
        npm run build

        zip tar

        cd $wdir
        exit 0
        ;;
    *)
        echo "ignoring unknown option [$arg]"
        ;;
    esac
done
