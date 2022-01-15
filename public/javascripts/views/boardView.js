import { elements } from "./base.js";

export const sayHello = () => console.log(`Hello`);

export const highlightPosition = (pos, color) => {
  let selector = "";
  if (pos === 0) selector = document.querySelector(`.base--${color}`);
  else selector = document.querySelector(`[data-step-id='${pos}']`);

  highlightPawnsIn(selector);
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

export const placePawn = (pos, color) => {
  const step = document.querySelector(`[data-step-id='${pos}']`);
  placePawnIn(step, color);
};

export const placePawnIn = (selector, color) => {
  const markup = `
  <div class="pawn pawn--${color}"></div>
  `;

  selector.insertAdjacentHTML("beforeEnd", markup);
};

export const hideNormalDice = () => {
  elements.visibleDiceImage.classList.remove("dice__image--visible");

  elements.blankDice.classList.add("dice__image--visible");
  elements.dice.classList.remove("dice--active");
};

export const showSpecificDice = (number) => {
  if (number < 1 || number > 6) return;

  elements.blankDice.classList.remove("dice__image--visible");
  document
    .querySelector(`#dice-${number}`)
    .classList.add("dice__image--visible");
};

export const activateDice = () => {
  elements.dice.classList.add("dice--active");
  elements.dice.classList.remove("dice--disabled");
};

export const hideDice = () => {
  elements.dice.classList.add("dice--disabled");
};

export const startDiceShaking = () => {
  elements.dice.classList.add("dice--shake");
};

export const stopDiceShaking = () => {
  elements.dice.classList.remove("dice--shake");
};
