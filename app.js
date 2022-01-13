const game = function(gameID) {
  this.playerA = null;
  this.playerB = null;
  this.id = gameID;
  this.blackPos = [0,0,0,0];
  this.bluePos = [0,0,0,0];
  this.gameState = "0 JOINT"; //"A" means A won, "B" means B won, "ABORTED" means the game was aborted
  this.addPlayer = function(w){
      if(this.playerA==null){
        this.playerA = w;
        return 1;
      }
      else{
        this.playerB = w;
        return 2;
      }
  }
};

/*************** 
      Required modules
*****************/
const express = require("express");
const res = require("express/lib/response");
const websocket = require("ws");
const http = require("http");
//const Game = require("./Game");


const port = process.argv[2]; //connection to the port(provided in the second argument)
const app = express();
const websockets = {} // object for storing games

app.use(express.static(__dirname + "/public")); // allow to access public files directly
// app.get("/", (req, res)=>{
//   res.sendFile("splash.html" , {root: "./public"});
// });
// app.get("/play", (req, res)=>{
//   res.sendFile("game.html" , {root: "./public"});
// });
const server = http.createServer(app);

/***************
Web Socket 
*****************/
const wss = new websocket.Server({server});
let numberOfPlayers = 0;
let gameID=0;
let currentGame = new game(gameID);


wss.on("connection", function (ws) {
  const con = ws;
  con["id"] = numberOfPlayers++;
  const playerType = currentGame.addPlayer(con); // returning type of the player
  websockets[con["id"]] = currentGame;

  console.log(
    `Player ${con["id"]} placed in game ${currentGame.id} as ${playerType}`
  );
  con.send(playerType == 1 ? "PLAYER1": "PLAYER2");
  if(playerType == 1){
    con.send("WAIT FOR OPPONENT");
  }
  if(playerType == 2){
    const opponent = currentGame.playerA;
    opponent.send("START GAME");
    con.send("START GAME");
    opponent.send("YOUR TURN");
    con.send("OPPONENT TURN");
    currentGame = new game(++gameID);
  }
  ws.on("message", function incoming(message) {
    
  });
});
server.listen(port); 