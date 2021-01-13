import express from 'express';
import serveIndex from 'serve-index';
import path from 'path';
import cors from 'cors';
import { createServer } from 'http';
import { Server, LobbyRoom, RelayRoom } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import { TestRoom } from "./rooms/chat";

import basicAuth from "express-basic-auth";

const basicAuthMiddleware = basicAuth({
    users: {
        "admin": "admin",
    },
    challenge: true
});

const port = Number(process.env.PORT || 2567) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();

app.use(cors());
app.use(express.json());

// Attach WebSocket Server on HTTP Server.
const gameServer = new Server({
  server: createServer(app),
  express: app,
  pingInterval: 0,
});

// Define "lobby" room
gameServer.define("lobby", LobbyRoom);

var Players = new Map();
Players.set(2,"test1");
Players.set(23,"test2");

console.log(Players);

// Define "chat" room
gameServer.define("chat", TestRoom)
    .enableRealtimeListing();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use('/', express.static(path.join(__dirname, "public")));

app.use("/colyseus", basicAuthMiddleware, monitor());



gameServer.onShutdown(function(){
  console.log(`game server is going down.`);
});

gameServer.listen(port);

// process.on("uncaughtException", (e) => {
//   console.log(e.stack);
//   process.exit(1);
// });

console.log(`Listening on http://localhost:${ port }`);
