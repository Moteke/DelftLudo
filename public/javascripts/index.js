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
  },
};

boardView.activateDice();

const utils = {
  getStep: (number) => {
    return `[data-step-id='${number}'`;
  },
};

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

// ************************
// PAWN MOVEMENT

const movePawn = (from, to) => {
  if (from == "base") {
    // remove one pawn from the base
    state.base.querySelector(state.pawn).remove();
    // add one pawn to the start
    document
      .querySelector(state.startingStep)
      .insertAdjacentHTML("beforeend", state.normalPawn);
  } else {
    document
      .querySelector(utils.getStep(from))
      .querySelector(state.pawn)
      .remove();
    document
      .querySelector(utils.getStep(to))
      .insertAdjacentHTML("beforeend", state.normalPawn);
  }
};

const socket = new WebSocket("ws://localhost:3000");
socket.onmessage = function (event) {
  console.log("Server message:  " + event.data);
  let incomingMsg = JSON.parse(event.data);
  //show waiting screen
  if (incomingMsg.type == Messages.T_WAIT) {
    console.log("Showing waiting screen");
    screenView.deactiveScreenWithMessage("Waiting for another player...");
  }
  //Receive type of player
  else if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
    let playerType = incomingMsg.data;
    console.log(`Starting game as player ${playerType}`);
    // set user data to state
    state.playerData = {
      id: playerType,
      color: playerType === 1 ? "blue" : "black",
    };
    state.base = document.querySelector(`.base--${state.playerData.color}`);
  } else if (incomingMsg.type == Messages.T_START) {
    console.log("Game starts");
    init();
    screenView.activateScreen();
    screenView.renderMessage("Time to start!");
  } else if (incomingMsg.type == Messages.T_YOUR_TURN) {
    boardView.activateDice();
    state.canRoll = true;
    console.log("It is your turn");
    screenView.renderMessage("Time to roll!");
  } else if (incomingMsg.type == Messages.T_OPP_TURN) {
    state.canRoll = false;
    state.canMove = false;
    console.log("It is opponent turn");
    screenView.renderMessage("Waiting for the opponent to move...");
  }
  //Receive you rolled message
  else if (incomingMsg.type == Messages.T_YOU_ROLLED) {
    state.receivedDice = true;
    state.diceNumber = incomingMsg.data;
    console.log(`You rolled ${incomingMsg.data}`);
    let pos = incomingMsg.activePositions;
    if (pos.length == 0) {
      console.log("There are no possible moves");
      socket.send(Messages.S_SKIPPED);
    } else {
      state.canMove = true;
      console.log(`Possibble moves are: ${pos}`);
      for (let i = 0; i < pos.length; i++) {
        boardView.highlightPosition(pos[i], state.playerData.color);
      }
    }
  }
  //Receive move message
  else if (incomingMsg.type == Messages.T_MOVE) {
    let msg = incomingMsg;
    console.log(msg);
    boardView.removePawn(msg.from, msg.color);
    boardView.placePawn(msg.to, msg.color);
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
    // player wants to move from base
    // TODO
    x.from = 0;
    console.log("Base move!");
  }
  if (step) {
    // player wants to make a board move
    // TODO
    const currentPos = +step.dataset.stepId;
    x.from = currentPos;
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
};

const init = () => {
  elements.dice.addEventListener("click", handleDiceClick);
  elements.board.addEventListener("click", handlePawnClick);
  state.base.addEventListener("click", handlePawnClick);
  elements.skipTurn.addEventListener("click", handleSkipBtnClick);
};
