/*************** 
      Required modules
*****************/
const express = require("express");
const res = require("express/lib/response");
const websocket = require("ws");
const http = require("http");

const messages = require("./public/javascripts/messages");
const Game = require("./scripts/Game");

const port = process.env.PORT || process.argv[2]; //connection to the port(provided in the second argument)
const app = express();
const server = http.createServer(app).listen(port);
const websockets = {}; // object for storing games

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); // allow to access public files directly

app.get("/", (req, res) => {
  res.render("splash");
});

app.get("/play", (req, res) => {
  res.render("game");
});

/***************
Web Socket 
*****************/
const wss = new websocket.Server({ server });
let numberOfPlayers = 0;
let gameID = 0;
let currentGame = new Game();

//CLEANING OF THE GAME OBJECTS NEEDED TO BE DONE

wss.on("connection", function (ws) {
  //starting of the game
  const con = ws;
  con["id"] = numberOfPlayers++;
  // if (currentGame.isGameOver() != false) {
  //   currentGame = new Game();
  //   gameID++;
  // }
  const playerType = currentGame.addPlayer(con); // returning type of the player
  websockets[con["id"]] = currentGame;

  console.log(`Player ${con["id"]} placed in game ${gameID} as ${playerType}`);
  con.send(playerType == 1 ? messages.S_PLAYER_1 : messages.S_PLAYER_2);
  if (playerType == 1) {
    con.send(messages.S_WAIT);
  }
  if (playerType == 2) {
    const opponent = currentGame.getOpponentOf(con);
    opponent.send(messages.S_START);
    con.send(messages.S_START);
    opponent.send(messages.S_YOUR_TURN);
    con.send(messages.S_OPP_TURN);
    currentGame = new Game();
    gameID++;
  }

  //response messages
  con.on("message", function incoming(message) {
    const oMsg = JSON.parse(message.toString());
    console.log(oMsg);
    const gameObj = websockets[con["id"]];
    const opponent = gameObj.getOpponentOf(con);
    if (gameObj.isTurnOf(con)) {
      //can do it only if it is your turn
      //dice rolled
      if (oMsg.type == messages.T_DICE_ROLLED) {
        const dice = gameObj.rollDice();
        let response = messages.O_YOU_ROLLED;
        response.data = dice.number;
        response.activePositions = dice.possibleMoves;
        con.send(JSON.stringify(response));
        let oppResp = messages.O_OPP_ROLLED;
        oppResp.data = dice.number;
        opponent.send(JSON.stringify(oppResp));
      }
      //move somewhere
      else if ((oMsg.type = messages.T_CLIENT_MOVE)) {
        const move = oMsg.from;
        const madeMove = gameObj.makeMove(move);
        //INVALID MOVE
        if (madeMove == "InvalidMove") {
          con.send(messages.S_INVALID);
        }
        //NORMAL MOVE
        else {
          let response = messages.O_MOVE;
          response.from = madeMove.from;
          response.to = madeMove.to;
          response.color = madeMove.color;
          console.log(response);
          con.send(JSON.stringify(response));
          opponent.send(JSON.stringify(response));

          //check for the move changing
          if (gameObj.isTurnOf(con)) {
            con.send(messages.S_YOUR_TURN);
            opponent.send(messages.S_OPP_TURN);
          } else {
            con.send(messages.S_OPP_TURN);
            opponent.send(messages.S_YOUR_TURN);
          }
          //check for the winning situation needed to be implemented
          let gameStatus = gameObj.isGameOver();
          if (gameStatus != false) {
            //if the game is aborted
            if (gameStatus == "ForcedEnd") {
              console.log("Game aborted for some reason");
              try {
                gameObj.endGame();
                opponent.close();
                con.close();
              } catch (e) {
                console.log("Error on closing");
              }
            }
            //if this client is winner
            else if (gameStatus.winner == con) {
              con.send(messages.S_WIN);
              opponent.send(messages.S_LOSE);
            }
            //if the opponent is winner
            else {
              con.send(messages.S_LOSE);
              opponent.send(messages.S_WIN);
            }
          }
        }
      }
    }
    if (oMsg.type == messages.T_SKIPPED) {
      console.log("SKIPPING");
      if (gameObj.isTurnOf(con)) {
        con.send(messages.S_YOUR_TURN);
        opponent.send(messages.S_OPP_TURN);
      } else {
        con.send(messages.S_OPP_TURN);
        opponent.send(messages.S_YOUR_TURN);
      }
    }
  });
  con.on("close", function (code) {
    // const gameObj = websockets[con["id"]];
    // const opponent = gameObj.getOpponentOf(con);
    console.log(`Player ${con["id"]} disconnected ...`);
    if (code == 1001) {
      /*
       * if possible, abort the game; if not, the game is already completed
       */
      const gameObj = websockets[con["id"]];
      const opponent = gameObj.getOpponentOf(con);
      if (opponent != null) {
        opponent.send(messages.S_ABORTED);
        try {
          opponent.close();
          con.close();
        } catch (e) {
          console.log(`There's been an error: ${e}`);
        }
      }
      gameObj.endGame();
      console.log("Game ended");
      if (opponent == null) {
        currentGame = new Game();
        gameID++;
      }
    }
  });
});
