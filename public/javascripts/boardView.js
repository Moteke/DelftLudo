export const sayHello = () => console.log(`Hello`);

export const highlightPosition = (pos) => {
  //if the position is 0, all the base pawns needed to be shown(showing error now)
  const step = document.querySelector(`[data-step-id='${pos}']`);
  highlightPawnsIn(step);
};

export const highlightPawnsIn = (selector) => {
  selector
    .querySelectorAll(".pawn")
    .forEach((e) => e.classList.add("pawn--glow"));
};

export const removePawn = (pos, color) => {
  const step = document.querySelector(`[data-step-id='${pos}']`);
  removePawnFrom(step, color);
};

export const removePawnFrom = (selector, color) => {
  selector.querySelector(`.pawn--${color}`).remove();
};

export const hideNormalDice = () => {
  document
    .querySelector(".dice__image--visible")
    .classList.remove("dice__image--visible");

  document.querySelector("#dice-0").classList.add("dice__image--visible");
  const dice = document.querySelector(".dice");
  dice.classList.remove("dice--active");
};

export const showSpecificDice = (number) => {
  if (number < 1 || number > 6) return;

  document.querySelector("#dice-0").classList.remove("dice__image--visible");
  document
    .querySelector(`#dice-${number}`)
    .classList.add("dice__image--visible");
};

export const activateDice = () => {
  const dice = document.querySelector(".dice");
  dice.classList.add("dice--active");
  dice.classList.remove("dice--disabled");
};

export const hideDice = () => {
  const dice = document.querySelector(".dice");
  dice.classList.add("dice--disabled");
};

export const startDiceShaking = () => {
  const dice = document.querySelector(".dice");
  dice.classList.add("dice--shake");
};

export const stopDiceShaking = () => {
  const dice = document.querySelector(".dice");
  dice.classList.remove("dice--shake");
};
