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
  rolled = false;
  boardData = {
    blueBaseEntrance: 36,
    blackBaseEntrance: 18,
    blueStart: 1,
    blackStart: 20,
  };

  _validateMove = (from) => {
    if (
      this.players.length < 2 ||
      !this.rolled ||
      !this.players[this.nextToMove].positions.includes(from)
    ) {
      return false;
    }

    // leaving base
    if (from === 0)
      return this.nextToMove == 0
        ? this.boardData.blueStart
        : this.boardData.blackStart;

    // safe base moves
    if (
      typeof from === "string" &&
      (from.startsWith("black") || from.startsWith("blue"))
    ) {
      const parts = from.split("-");
      const start = +parts[1];
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

    return from + this.lastDice > 36
      ? (from + this.lastDice) % 36
      : from + this.lastDice;
  };

  _removeOpponentsPawns = (fromPos) => {
    const opponentPositions = this.players[(this.nextToMove + 1) % 2].positions;

    let index = opponentPositions.findIndex((el) => el === fromPos);

    while (index != -1) {
      console.log("Killing...");
      opponentPositions[index] = 0;
      index = opponentPositions.findIndex((el) => el === fromPos);
    }
  };

  /*
    We assume that the server checked that the right player
    sent this request to make a move.
  */
  makeMove = (from) => {
    // **** REMOVE *****
    // TESTING ONLY
    this.rollDice();

    const to = this._validateMove(from);
    if (to === false) return "InvalidMove";

    // replace one of the pawns with a new position
    const pawnIndex = this.players[this.nextToMove].positions.findIndex(
      (el) => el === from
    );
    this.players[this.nextToMove].positions[pawnIndex] = to;
    this._removeOpponentsPawns(to);

    // DEBUG MESSAGES:
    // console.log(
    //   `Current positions: ${this.players[this.nextToMove].positions}`
    // );
    // console.log(
    //   `Opponent positions: ${this.players[(this.nextToMove + 1) % 2].positions}`
    // );

    if (this.lastDice !== 6) {
      // change turn
      this.nextToMove = (this.nextToMove + 1) % 2;
    }
    // it's time to roll again
    this.rolled = false;
    // return the properly styled message about a correct move
    return `MOVE-${from}-${to}`;
  };

  addPlayer = (ID, location) => {
    return this.players.push(new Player(ID, location));
  };

  rollDice = () => {
    this.lastDice = Math.floor((Math.random() * 10000) % 6) + 1;
    this.rolled = true;
    return this.lastDice;
  };

  isTurnOf = (ID) => this.players[this.nextToMove].ID === ID;

  isGameOver = () => {
    // check if blue pawns are in the base
    let blueWin = true;
    this.players[0].positions.forEach((el) => {
      if (typeof el != "string" || !el.startsWith(this.playerColor[0]))
        blueWin = false;
    });

    if (blueWin) return this.players[0].ID;

    // check if black pawns are in the base
    let blackWin = true;
    this.players[1].positions.forEach((el) => {
      if (typeof el != "string" || !el.startsWith(this.playerColor[1]))
        blackWin = false;
    });

    if (blackWin) return this.players[1].ID;
    return false;
  };
}

//module.exports = Game;
