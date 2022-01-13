/*************** 
      Required modules
*****************/
const express = require("express");
const res = require("express/lib/response");
const websocket = require("ws");
const http = require("http");
const Game = require("./game");


const port = process.argv[2]; //connection to the port(provided in the second argument)
const app = express();

app.use(express.static(__dirname + "/public")); // allow to access public files directly
app.get("/", (req, res)=>{
  res.sendFile("splash.html" , {root: "./public"});
});
app.get("/play", (req, res)=>{
  res.sendFile("game.html" , {root: "./public"});
});
const server = http.createServer(app);

/***************
Web Socket 
*****************/
const wss = new websocket.Server({server});
let numberOfPlayers = 0;
wss.on("connection", function (ws) {
  numberOfPlayers++;
  console.log(`Player with ID: ${numberOfPlayers} connected. Connection state: ${ws.readyState}`);
  ws.send(`ID:${numberOfPlayers}`);

  ws.on("message", function incoming(message) {
    console.log("[LOG] " + message);
    if(message == "START-GAME"){
      console.log("Starting game");
      ws.send("WAITING-FOR-OTHER-PLAYER");
    }
  });
});
server.listen(port); 