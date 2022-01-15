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

// ****************
// DICE
let active = false;

// *****************
// BOARD

const highlightPawns = (diceNum) => {
  if (diceNum == 6) {
    // highlight base pawns
    const basePawns = state.base.querySelectorAll(".pawn");
    basePawns.forEach((el) => {
      el.classList.add("pawn--glow");
    });
  }

  // highligh board pawns
  const boardPawns = document
    .querySelector(".board")
    .querySelectorAll(state.pawn);

  boardPawns.forEach((el) => {
    el.classList.add("pawn--glow");
  });
};

const unhighlightPawns = () => {
  document
    .querySelectorAll(".pawn--glow")
    .forEach((el) => el.classList.remove("pawn--glow"));
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

let playerType;
const socket = new WebSocket("ws://localhost:3000");
socket.onmessage = function (event) {
  console.log("Server message:  " + event.data);
  let incomingMsg = JSON.parse(event.data);
  //show waiting screen
  if (incomingMsg.type == Messages.T_WAIT) {
    console.log("Showing waiting screen");
    screenView.deactiveScreenWithMessage("Waiting for another player...");
  } else if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
    playerType = incomingMsg.data;
    console.log(`Starting game as player ${playerType}`);
    console.log(incomingMsg);
    state.base = document.querySelector(
      `.base--${playerType === 1 ? "blue" : "black"}`
    );
  } else if (incomingMsg.type == Messages.T_START) {
    console.log("Game starts");
    init();
    screenView.activateScreen();
    screenView.renderMessage("Time to start!");
  } else if (incomingMsg.type == Messages.T_YOUR_TURN) {
    active = true;
    console.log("It is your turn");
    screenView.renderMessage("Time to roll!");
  } else if (incomingMsg.type == Messages.T_OPP_TURN) {
    active = false;
    console.log("It is opponent turn");
    screenView.renderMessage("Waiting for the opponent to move...");
  } else if (incomingMsg.type == Messages.T_YOU_ROLLED) {
    state.receivedDice = true;
    state.diceNumber = incomingMsg.data;
    console.log(`You rolled ${incomingMsg.data}`);
    let pos = incomingMsg.activePositions;
    if (pos == []) {
      console.log("There are no possible moves");
    } else {
      console.log(`Possibble moves are: ${pos}`);
      for (let i = 0; i < pos.length; i++) {
        boardView.highlightPosition(
          pos[i],
          playerType === 1 ? "blue" : "black"
        );
      }
    }
  }
};

socket.onopen = function () {
  console.log("Connected to the browser");
};

const init = () => {
  elements.dice.addEventListener("click", async (e) => {
    if (!active) return;
    else active = false;

    const { target } = e;

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
  });

  elements.board.addEventListener("click", (e) => {
    const pawn = e.target.closest(state.pawn);
    if (!pawn || !pawn.classList.contains("pawn--glow")) {
      return;
    }

    // console.log("you clicked your pawn!");
    // send what user chose to do to the server

    // if you receive OK move the pawn to the desired location
    const currentPos = +pawn.closest(".board__step").dataset.stepId;
    let pos = Math.floor((Math.random() * 10000) % 6) + 1;
    console.log(
      `Jumping from ${currentPos} to ${((currentPos + pos) % 36) + 1}`
    );
    movePawn(currentPos, ((currentPos + pos) % 36) + 1);
    unhighlightPawns();
  });
  state.base.addEventListener("click", (e) => {
    const pawn = e.target.closest(state.pawn);
    if (pawn === null || !pawn.classList.contains("pawn--glow")) {
      return;
    }
    // console.log("You clicked pawn");
    // send what user chose to do to the server

    // if you receive OK move the pawn to the desired location
    movePawn("base");
    unhighlightPawns();
  });
};
