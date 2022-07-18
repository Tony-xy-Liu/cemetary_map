from . import server

if __name__ == "__main__":
    # server.app.run()
    server.sio.run(server.app)

application = server.app