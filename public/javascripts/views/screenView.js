import { elements } from "./base.js";

export const deactiveScreenWithMessage = (msg) => {
  const markup = `
    <div class="modal">
      <div class="modal__message">${msg}</div>
    </div>
  `;

  elements.body.insertAdjacentHTML("afterBegin", markup);
};

export const activateScreen = () => {
  // can't export .modal selector to elements because it is dynamic
  const modal = document.querySelector(".modal");
  if (modal) modal.remove();
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
