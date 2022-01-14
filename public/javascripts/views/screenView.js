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
