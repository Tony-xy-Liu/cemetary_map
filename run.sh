
# py=python3
py=python
dir=`pwd`
src=src
cd $src
sw=$1
case $sw in
    react | -r)
    cd website
    npm run start
    ;;
    server-rebuild-react | -sr)
    cd $dir
    ./build.sh -r
    cd $src
    gunicorn -c server/gunicorn.conf.py server.wsgi
    ;;
    server | -s)
    gunicorn -c server/gunicorn.conf.py server.wsgi
    ;;
    *)
        echo "ignoring unknown option [$arg]"
    ;;
esac

cd $dir