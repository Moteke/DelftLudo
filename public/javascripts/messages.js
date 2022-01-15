(function (exports) {
  /**T - type of message
   * O - object sended as message
   * S - JSON string, that is representing this object
   */
  /*
   * Server to client: set as player 1
   */
  exports.T_PLAYER_TYPE = "PLAYER";
  exports.O_PLAYER_1 = {
    type: exports.T_PLAYER_TYPE,
    data: 1,
  };
  exports.S_PLAYER_1 = JSON.stringify(exports.O_PLAYER_1);

  /*
   * Server to client: set as player 2
   */
  exports.O_PLAYER_2 = {
    type: exports.T_PLAYER_TYPE,
    data: 2,
  };
  exports.S_PLAYER_2 = JSON.stringify(exports.O_PLAYER_2);

  //wait for opponet(Server send to the first player)
  exports.T_WAIT = "WAIT";
  exports.O_WAIT = {
    type: exports.T_WAIT,
  };
  exports.S_WAIT = JSON.stringify(exports.O_WAIT);

  //Server send START GAME for both players, when the second player connected
  exports.T_START = "START";
  exports.O_START = {
    type: exports.T_START,
  };
  exports.S_START = JSON.stringify(exports.O_START);

  //Server send your turn/opponent turn in the start of every move
  exports.T_YOUR_TURN = "YOUR-TURN";
  exports.O_YOUR_TURN = {
    type: exports.T_YOUR_TURN,
  };
  exports.S_YOUR_TURN = JSON.stringify(exports.O_YOUR_TURN);

  exports.T_OPP_TURN = "OPP-TURN";
  exports.O_OPP_TURN = {
    type: exports.T_OPP_TURN,
  };
  exports.S_OPP_TURN = JSON.stringify(exports.O_OPP_TURN);

  //Dice rolled message, sent from client to server(response: check if the valid move and roll dice)
  exports.T_DICE_ROLLED = "DICE-ROLLED";
  exports.O_DICE_ROLLED = {
    type: exports.T_DICE_ROLLED,
  };
  exports.S_DICE_ROLLED = JSON.stringify(exports.O_DICE_ROLLED);

  //You rolled sent from the server to the client
  exports.T_YOU_ROLLED = "YOU_ROLLED";
  exports.O_YOU_ROLLED = {
    type: exports.T_YOU_ROLLED,
    data: null,
    activePositions: null,
  };

  //Sent from the client to the player about opponents rolling data
  exports.T_OPP_ROLLED = "OPP_ROLLED";
  exports.O_OPP_ROLLED = {
    type: exports.T_OPP_ROLLED,
    data: null,
  };
  //Sent from client to server with position of needed pawn to be moved
  exports.T_CLIENT_MOVE = "CMOVE";
  exports.O_CLIENT_MOVE = {
    type: exports.T_CLIENT_MOVE,
    from: null,
  };
  //Sent from server to the client about moving pawn from position x to y
  exports.T_INVALID = "INVALID-MOVE";
  exports.O_INVALID = {
    type: exports.T_INVALID,
  };
  exports.S_INVALID = JSON.stringify(exports.O_INVALID);
  //Sent from server to the client,if the provided move was invalid
  exports.T_MOVE = "MOVE";
  exports.O_MOVE = {
    type: exports.T_MOVE,
    from: null,
    to: null,
    color: null,
  };
  exports.T_SKIPPED = "SKIPPED";
  exports.O_SKIPPED = {
    type: exports.T_SKIPPED,
  };
  exports.S_SKIPPED = JSON.stringify(exports.O_SKIPPED);
  //Sent from server about win/lose/aborted
  exports.T_WIN = "WIN";
  exports.O_WIN = {
    type: exports.T_WIN,
  };
  exports.S_WIN = JSON.stringify(exports.O_WIN);

  exports.T_LOSE = "LOSE";
  exports.O_LOSE = {
    type: exports.T_LOSE,
  };
  exports.S_LOSE = JSON.stringify(exports.O_LOSE);

  exports.T_ABORTED = "ABORTED";
  exports.O_ABORTED = {
    type: exports.T_ABORTED,
  };
  exports.S_ABORTED = JSON.stringify(exports.O_ABORTED);
})(typeof exports === "undefined" ? (this.Messages = {}) : exports);
//if exports is undefined, we are on the client; else the server
