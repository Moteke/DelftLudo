import * as boardView from "./boardView.js";

// ****************
// STATE
const state = {
  base: document.querySelector(".base--blue"),
  pawn: ".pawn--blue",
  startingStep: "[data-step-id='2']",
  pawnMarkup: '<div class="pawn pawn--blue pawn--glow"></div>',
  normalPawn: '<div class="pawn pawn--blue"></div>',
};

boardView.activateDice();

const utils = {
  getStep: (number) => {
    return `[data-step-id='${number}'`;
  },
};

// ****************
// DICE

const dice = document.querySelector(".dice");
dice.addEventListener("click", (e) => {
  if (active) return;
  else active = true;

  const { target } = e;

  // hide the normal dice and show the 0 one
  boardView.hideNormalDice();

  // add animation for 1 second
  boardView.startDiceShaking();

  setTimeout(() => {
    // receive dice number TEMPORARY TODO
    const diceNumber = Math.floor((Math.random() * 10000) % 6) + 1;

    boardView.stopDiceShaking();
    boardView.showSpecificDice(diceNumber);

    document.querySelector(
      ".message"
    ).textContent = `You rolled ${diceNumber}!`;

    active = false;
    highlightPawns(diceNumber);
  }, 1000); // set the timeout to max(1000, websocket response time)

  setTimeout(() => boardView.hideDice(), 4000);
});

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

document.querySelector(".board").addEventListener("click", (e) => {
  const pawn = e.target.closest(state.pawn);
  if (!pawn || !pawn.classList.contains("pawn--glow")) {
    return;
  }

  // console.log("you clicked your pawn!");
  // send what user chose to do to the server

  // if you receive OK move the pawn to the desired location
  const currentPos = +pawn.closest(".board__step").dataset.stepId;
  let pos = Math.floor((Math.random() * 10000) % 6) + 1;
  console.log(`Jumping from ${currentPos} to ${((currentPos + pos) % 36) + 1}`);
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

const socket = new WebSocket("ws://localhost:3000");
socket.onmessage = function (event) {
  console.log("Server message:  " + event.data);
  let incomingMsg = JSON.parse(event.data);
  //show waiting screen
  if (incomingMsg.type == Messages.T_WAIT) {
    console.log("Showing waiting screen");
  } else if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
    let playerType = incomingMsg.data;
    console.log(`Starting game as player ${playerType}`);
  } else if (incomingMsg.type == Messages.T_START) {
    console.log("Game starts");
  } else if (incomingMsg.type == Messages.T_YOUR_TURN) {
    console.log("It is your turn");
  } else if (incomingMsg.type == Messages.T_OPP_TURN) {
    console.log("It is opponent turn");
  } else if (incomingMsg.type == Messages.T_YOU_ROLLED) {
    console.log("You rolled ...");
  }
};

socket.onopen = function () {
  console.log("Connected to the browser");
};
