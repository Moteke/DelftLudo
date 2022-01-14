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
  this.isYourTURN = function(w){
    return true;
  }
  this.rollDice = function(){
    return 5;
  }
  this.madeMove = function(pos){ //return move from the provided position or "Incorrect move" if the move is incorrect
    const diceNumb = 5;
    return "MOVE:15-21";
  }
};

/*************** 
      Required modules
*****************/
const express = require("express");
const res = require("express/lib/response");
const websocket = require("ws");
const http = require("http");
const messages = require("./public/javascripts/messages");
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


//CLEANING OF THE GAME OBJECTS NEEDED TO BE DONE

wss.on("connection", function (ws) {

  //starting of the game
  const con = ws;
  con["id"] = numberOfPlayers++;
  const playerType = currentGame.addPlayer(con); // returning type of the player
  websockets[con["id"]] = currentGame;

  console.log(
    `Player ${con["id"]} placed in game ${currentGame.id} as ${playerType}`
  );
  con.send(playerType == 1 ? messages.S_PLAYER_1: messages.S_PLAYER_2);
  if(playerType == 1){
    con.send(messages.S_WAIT);
  }
  if(playerType == 2){
    const opponent = currentGame.playerA;
    opponent.send(messages.S_START);
    con.send(messages.S_START);
    opponent.send(messages.S_YOUR_TURN);
    con.send(messages.S_OPP_TURN);
    currentGame = new game(++gameID);
  }

  //response messages
  con.on("message", function incoming(message) {

    const oMsg = JSON.parse(message.toString());
    const gameObj = websockets[con["id"]];
    const opponent = gameObj.playerA == con ? gameObj.playerB : gameObj.playerA;

    if(gameObj.isYourTURN(con)){ //can do it only if it is your turn
      //dice rolled
      if(oMsg.type == messages.T_DICE_ROLLED){ 
        const dice = gameObj.rollDice();
        let response = messages.O_YOU_ROLLED;
        response.data = dice;
        con.send(JSON.stringify(response));
        let oppResp = messages.O_OPP_ROLLED;
        oppResp.data = dice;
        opponent.send(JSON.stringify(oppResp));
      }
      //move somewhere
      else if(message.slice(0, 5) == "MOVE:"){
        const move = +message.slice(5)+1;
        const madeMove = gameObj.madeMove(move);
        //INVALID MOVE
        if(madeMove == "Invalid move"){
          con.send("INVALID MOVE");
        }
        //NORMAL MOVE 
        else{
          con.send(madeMove);
          opponent.send(madeMove);
          //check for the move changing
          if(gameObj.isYourTURN(con)){
            con.send("YOUR TURN");
            opponent.send("OPPONENT TURN");
          }
          else{
            con.send("OPPONENT TURN");
            opponent.send("YOUR TURN");
          }
          //check for the winning situation
          if(gameObj.getStatus() == "1WIN"){
            con.send("WIN");
            opponent.send("LOSE");
          }
          else if(gameObj.getStatus()=="2WIN"){
            opponent.send("WIN");
            con.send("LOSE");
          }
          else if(gameObj.getStatus()=="ABORTED"){
            con.send("ABORTED");
            opponent.send("ABORTED");
          }
        }
      }
    }
  });
  con.on("close", function(code){
    /**WILL BE FINISHED */
  });
});
server.listen(port); 