/*
CHANGE TO AN IMPORT
*/
function Player(ID) {
  this.ID = ID;
  this.positions = [0, 0, 0, 0];
}

class Game {
  /*
    Valid positions:
      0 - base
      2, 20 - 'safe' steps - no killing there
      1-36 - normal steps
      black-1 to black-5 - black base steps
      blue-1 to blue-5 - blue base steps

    players[0] is blue, players[1] is black
  */
  playerColor = ["blue", "black"];
  players = [];
  nextToMove = 0;
  lastDice = 0;
  boardData = {
    blueBaseEntrance = 36,
    blackBaseEntrance = 18
  }

  _validateMove = (from) => {
    if (!(from in this.players[nextToMove].positions)) {
      return false;
    }

    // leaving base is always possible
    if (from === 0) return 1;

    // safe base moves
    if (from.startsWith("black") || from.startsWith("blue")) {
      const parts = from.split("-")[1];
      const start = +parts[0];
      if (start < 1 || start + lastDice > 5) return false; // out of bound

      const desiredLocation = `${parts[0]}-${start + lastDice}`;
      if (desiredLocation in players[nextToMove].positions) {
        // there is a pawn in this place
        return false;
      }

      return desiredLocation; // we can move there!
    }

    // entering bases
    if (from + lastDice > this.boardData.blueBaseEntrance && this.nextToMove === 0) {
      // we want to enter the blue base
      const basePos = from + lastDice - 19;

      const desiredLocation = `blue-${basePos}`;
      if (desiredLocation in players[nextToMove].positions) {
        // there is a pawn in this place
        return false;
      }
      return desiredLocation;
    }
    if (from <= this.boardData.blackBaseEntrance && from + lastDice > this.boardData.blackBaseEntrance && this.nextToMove === 1) {
      // we want to enter the black base
      const basePos = from + lastDice - 19;

      const desiredLocation = `black-${basePos}`;
      if (desiredLocation in players[nextToMove].positions) {
        // there is a pawn in this place
        return false;
      }
      return desiredLocation;
    }

    // normal move
    return from + this.lastDice > 36 ? from + this.lastDice % 36 : from + this.lastDice;
  };

  /*
    We assume that the server checked that the right player
    sent this request to make a move.
  */
  makeMove = (from) => {
    const to = this._validateMove(from);
    if(to === false) return 'InvalidMove';

    console.log(`CORRECT MOVE: ${to}`);

  };

  addPlayer = (ID) => {
    return this.players.push(new Player(ID));
  };
}

module.exports = Game;
