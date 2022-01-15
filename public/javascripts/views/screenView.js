import { elements } from "./base.js";

export const deactiveScreenWithMessage = (msg) => {
  elements.modalMessage.textContent = msg;
  elements.modal.classList.add("modal--visible");
};

export const activateScreen = () => {
  elements.modal.classList.remove("modal--visible");
};

export const renderMessage = (msg) => {
  elements.message.textContent = msg;
};

export const renderSkipBtn = () => {
  const markup = `
    <span class="skip-turn__btn">Skip turn</span>
  `;
  elements.skipTurn.insertAdjacentHTML("beforeEnd", markup);
};

export const removeSkipBtn = () => {
  const btn = document.querySelector(".skip-turn__btn");
  if (btn) btn.remove();
};

export const activateTimer = () => {
  const timer = document.querySelector(".navigation__item--timer");
  let minutes = 0;
  let seconds = 0;
  return setInterval(() => {
    seconds++;
    if (seconds >= 60) {
      seconds -= 60;
      minutes++;
    }
    if (seconds < 10) {
      timer.textContent = `Timer: ${minutes}:0${seconds}`;
    } else {
      timer.textContent = `Timer: ${minutes}:${seconds}`;
    }
  }, 1000);
};

export const setTurnScreen = (player) => {
  const turn = document.querySelector(".statistics__turn");
  turn.textContent = `${player} turn`;
};
