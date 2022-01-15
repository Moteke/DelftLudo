import * as boardView from "./views/boardView.js";
import * as screenView from "./views/screenView.js";

import { elements } from "./views/base.js";

// ****************
// STATE
const state = {
  base: "",
  receivedDice: false,
  canRoll: false,
  canMove: false,
  playerData: {
    id: 0,
    color: "",
    possibleMoves: [],
  },
};

boardView.activateDice();

// promises to make good dice rolling animation
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const socketWait = (state) => {
  return new Promise(async (resolve) => {
    while (!state.receivedDice) {
      await sleep(100);
    }
    resolve("cool");
  });
};

/*
  MESSAGE HANDLER
*/
const socket = new WebSocket("ws://localhost:3000");

socket.onmessage = function (event) {
  console.log("Server message:  " + event.data);
  let incomingMsg = JSON.parse(event.data);

  switch (incomingMsg.type) {
    case Messages.T_WAIT:
      console.log("Showing waiting screen");
      screenView.deactiveScreenWithMessage("Waiting for another player...");
      break;

    case Messages.T_PLAYER_TYPE:
      let playerType = incomingMsg.data;
      console.log(`Starting game as player ${playerType}`);
      // set user data to state
      state.playerData = {
        id: playerType,
        color: playerType === 1 ? "blue" : "black",
      };
      state.base = document.querySelector(`.base--${state.playerData.color}`);
      break;

    case Messages.T_START:
      console.log("Game starts");
      init();
      screenView.activateScreen();
      screenView.renderMessage("Time to start!");
      break;

    case Messages.T_YOUR_TURN:
      boardView.activateDice();
      state.canRoll = true;
      console.log("It is your turn");
      screenView.renderMessage("Time to roll!");
      break;

    case Messages.T_OPP_TURN:
      state.canRoll = false;
      state.canMove = false;
      console.log("It is opponent turn");
      screenView.renderMessage("Waiting for the opponent to move...");
      break;

    case Messages.T_YOU_ROLLED:
      state.receivedDice = true;
      state.diceNumber = incomingMsg.data;
      console.log(`You rolled ${incomingMsg.data}`);
      let pos = incomingMsg.activePositions;
      state.playerData.possibleMoves = incomingMsg.activePositions;
      if (pos.length == 0) {
        console.log("There are no possible moves");
      } else {
        state.canMove = true;
        console.log(`Possibble moves are: ${pos}`);
      }
      break;

    case Messages.T_MOVE:
      let msg = incomingMsg;
      console.log(msg);
      boardView.removePawn(msg.from, msg.color);
      boardView.placePawn(msg.to, msg.color);
      break;

    case Messages.T_ABORTED:
      console.log("Game aborted");
      screenView.renderMessage("Your opponent left. Game Over");
      break;

    case Messages.T_WIN:
      console.log("You won");
      screenView.renderMessage("Congratulations! You won the game!");
      break;

    case Messages.T_LOSE:
      console.log("You lose");
      screenView.renderMessage("The game ended! You lose!");
      break;
  }
};

socket.onopen = function () {
  console.log("Connected to the browser");
};

/*
  Handle clicking the dice
*/

const handleDiceClick = async (e) => {
  if (!state.canRoll) return;
  else state.canRoll = false;

  // hide the normal dice and show the 0 one
  boardView.hideNormalDice();

  // add animation for 1 second
  boardView.startDiceShaking();
  state.receivedDice = false;
  socket.send(Messages.S_DICE_ROLLED);

  /*
      What happens here is we wait for both Promises to resolve:
        - 1 second wait Promise
        - Promise that waits until we receive a dice number
      Once both are ready, we proceed to next lines.
      'await' keyword is what allows us to stop the execution. It's called async await mechanism.
      https://javascript.info/async-await
    */
  await Promise.all([sleep(1000), socketWait(state)]);
  boardView.stopDiceShaking();
  screenView.renderMessage(`You rolled ${state.diceNumber}!`);
  boardView.showSpecificDice(state.diceNumber);
  boardView.hideDice();

  // render possible moves or the skip turn
  if (state.playerData.possibleMoves.length === 0) {
    // render the skip turn btn
    screenView.renderSkipBtn();
  } else {
    // highligh pawns
    state.playerData.possibleMoves.forEach((e) =>
      boardView.highlightPosition(e, state.playerData.color)
    );
  }
};

/*
  Handle clicking a pawn on the board on in the base
*/

const handlePawnClick = (e) => {
  const pawn = e.target.closest(`.pawn--${state.playerData.color}`);
  if (!pawn || !pawn.classList.contains("pawn--glow") || !state.canMove) {
    return;
  }

  const base = pawn.closest(`.base--${state.playerData.color}`);
  const step = pawn.closest(".board__step");
  let x = Messages.O_CLIENT_MOVE;
  if (base) {
    x.from = 0;
    console.log("Base move!");
  }
  if (step) {
    const currentPos = step.dataset.stepId;
    if (currentPos.startsWith("blue") || currentPos.startsWith("black"))
      x.from = currentPos;
    else x.from = +currentPos;

    console.log("Step move!");
  }
  socket.send(JSON.stringify(x));
  boardView.unhighlightAllPawns();
};

/*
  Handling clicking the skip button to skip the turn
*/

const handleSkipBtnClick = (e) => {
  const target = e.target.closest(".skip-turn__btn");
  if (!target) return;

  // TODO: what should happen when someone clicks the button
  socket.send(Messages.S_SKIPPED);
  screenView.removeSkipBtn();
};

const init = () => {
  elements.dice.addEventListener("click", handleDiceClick);
  elements.board.addEventListener("click", handlePawnClick);
  state.base.addEventListener("click", handlePawnClick);
  elements.skipTurn.addEventListener("click", handleSkipBtnClick);
};
