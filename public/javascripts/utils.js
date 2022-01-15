export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const socketWait = (state) => {
  return new Promise(async (resolve) => {
    while (!state.receivedDice) {
      await sleep(100);
    }
    resolve("cool");
  });
};
