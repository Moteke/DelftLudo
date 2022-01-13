/*
CHANGE TO AN IMPORT
*/
function Player(ID, location) {
  this.ID = ID;
  this.positions = location;
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
    blueBaseEntrance: 36,
    blackBaseEntrance: 18,
  };

  _validateMove = (from) => {
    console.log(
      `Current positions: ${this.players[this.nextToMove].positions}`
    );
    console.log(
      `Is ${from} in there ^^^? ${this.players[
        this.nextToMove
      ].positions.includes(from)}`
    );
    if (!this.players[this.nextToMove].positions.includes(from)) {
      return false;
    }

    // leaving base
    if (from === 0) return 1;
    // if (from === 0) {
    //   if (from in this.players[this.nextToMove].positions) return 1;
    //   else return false;
    // }

    // safe base moves
    if (
      typeof from === "string" &&
      (from.startsWith("black") || from.startsWith("blue"))
    ) {
      const parts = from.split("-")[1];
      const start = +parts[0];
      if (start < 1 || start + this.lastDice > 5) return false; // out of bound

      const desiredLocation = `${parts[0]}-${start + this.lastDice}`;
      if (this.players[this.nextToMove].positions.includes(desiredLocation)) {
        // there is a pawn in this place
        return false;
      }

      return desiredLocation; // we can move there!
    }

    // entering bases
    if (
      from + this.lastDice > this.boardData.blueBaseEntrance &&
      this.nextToMove === 0
    ) {
      // we want to enter the blue base
      const basePos = from + this.lastDice - this.boardData.blueBaseEntrance;

      const desiredLocation = `blue-${basePos}`;
      if (this.players[this.nextToMove].positions.includes(desiredLocation)) {
        // there is a pawn in this place
        return false;
      }
      return desiredLocation;
    }
    if (
      from <= this.boardData.blackBaseEntrance &&
      from + this.lastDice > this.boardData.blackBaseEntrance &&
      this.nextToMove === 1
    ) {
      // we want to enter the black base
      const basePos = from + this.lastDice - this.boardData.blackBaseEntrance;

      const desiredLocation = `black-${basePos}`;
      if (this.players[this.nextToMove].positions.includes(desiredLocation)) {
        // there is a pawn in this place
        return false;
      }
      return desiredLocation;
    }

    // normal move
    // if (!(from in this.players[this.nextToMove].positions)) return false;

    return from + this.lastDice > 36
      ? from + (this.lastDice % 36)
      : from + this.lastDice;
  };

  /*
    We assume that the server checked that the right player
    sent this request to make a move.
  */
  makeMove = (from) => {
    // **** REMOVE
    this.lastDice = Math.floor((Math.random() * 10000) % 6) + 1;
    console.log(`ROLLED: ${this.lastDice}`);

    const to = this._validateMove(from);
    if (to === false) return "InvalidMove";

    console.log(`CORRECT MOVE: ${to}`);
  };

  addPlayer = (ID, location) => {
    return this.players.push(new Player(ID, location));
  };
}

//module.exports = Game;
