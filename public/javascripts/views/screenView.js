export const deactiveScreenWithMessage = (msg) => {
  const markup = `
    <div class="modal">
      <div class="modal__message">${msg}</div>
    </div>
  `;

  document.querySelector("body").insertAdjacentHTML("afterBegin", markup);
};

export const activateScreen = () => {
  const modal = document.querySelector(".modal");
  if (modal) modal.remove();
};

export const renderMessage = (msg) => {
  document.querySelector(".message").textContent = msg;
};
