/*
CHANGE TO AN IMPORT
*/
function Player(ws, startingLocation) {
  this.ws = ws;
  this.positions = startingLocation;
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
  forcedEnd = false;
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
    if (from === 0) {
      // you can leave only if you rolled 6
      if (this.lastDice === 6) {
        return this.nextToMove == 0
          ? this.boardData.blueStart
          : this.boardData.blackStart;
      } else return false;
    }

    /*
      Moving the pawn in the base
      
      We must check if there are no pawns blocking our way to the desired position
      as 'jumping over pawns' is not possible in the base
    */
    if (
      typeof from === "string" &&
      (from.startsWith("black") || from.startsWith("blue"))
    ) {
      const parts = from.split("-");
      const start = +parts[1];
      if (start < 1 || start + this.lastDice > 5) return false; // out of bound

      const desiredLocation = `${parts[0]}-${start + this.lastDice}`;
      const locationsToCheck = [];
      // generate locations that we need to check
      for (let i = start + 1; i <= start + this.lastDice; i++) {
        locationsToCheck.push(`${parts[0]}-${i}`);
      }

      // check if there are any pawns that can block our move
      if (
        locationsToCheck.some((el) =>
          this.players[this.nextToMove].positions.includes(el)
        )
      ) {
        return false;
      }

      return desiredLocation; // we can move there!
    }

    /*
      Entering bases type of move

      We must check if there are no pawns blocking our way to the desired position
      as 'jumping over pawns' is not possible in the base
    */

    if (
      from + this.lastDice > this.boardData.blueBaseEntrance &&
      this.nextToMove === 0
    ) {
      // we want to enter the blue base
      const basePos = from + this.lastDice - this.boardData.blueBaseEntrance;

      const desiredLocation = `blue-${basePos}`;
      const locationsToCheck = [];
      for (let i = 1; i <= basePos; i++) {
        locationsToCheck.push(`blue-${i}`);
      }

      if (
        locationsToCheck.some((el) =>
          this.players[this.nextToMove].positions.includes(el)
        )
      ) {
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
      const locationsToCheck = [];
      for (let i = 1; i <= basePos; i++) {
        locationsToCheck.push(`black-${i}`);
      }

      if (
        locationsToCheck.some((el) =>
          this.players[this.nextToMove].positions.includes(el)
        )
      ) {
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
      opponentPositions[index] = 0;
      index = opponentPositions.findIndex((el) => el === fromPos);
    }
  };

  /*
    We assume that the server checked that the right player
    sent this request to make a move.
  */
  makeMove = (from) => {
    const to = this._validateMove(from);
    if (to === false) return "InvalidMove";

    // replace one of the pawns with a new position
    const pawnIndex = this.players[this.nextToMove].positions.findIndex(
      (el) => el === from
    );
    this.players[this.nextToMove].positions[pawnIndex] = to;
    this._removeOpponentsPawns(to);

    this._changeTurn(); // possible change

    // it's time to roll again
    this.rolled = false;
    // return the properly styled message about a correct move
    return {
      from,
      to,
    };
  };

  _changeTurn = () => {
    if (this.lastDice !== 6) {
      this.nextToMove = (this.nextToMove + 1) % 2;
    }
  };

  addPlayer = (ws) => {
    return this.players.push(new Player(ws, [0, 0, 0, 0]));
  };

  rollDice = () => {
    this.lastDice = Math.floor((Math.random() * 10000) % 6) + 1;
    this.rolled = true;

    const possibleMoves = this._getPossibleMoves();
    if (possibleMoves.length === 0) {
      // player rolled the dice and can't make any moves
      this.rolled = false;
      this._changeTurn();
    }

    return {
      number: this.lastDice,
      possibleMoves,
    };
  };

  _getPossibleMoves = () => {
    const possibleMoves = [];
    this.players[this.nextToMove].positions.forEach((p) => {
      if (this._validateMove(p) !== false) possibleMoves.push(p);
    });
    return possibleMoves;
  };

  /*
    Returns true if it's the turn of the player associated with the 'ws' WebSocket
  */
  isTurnOf = (ws) => this.players[this.nextToMove].ws === ws;

  /*
    Returns an object with the WebSockets of the players
  */
  getPlayers = () => {
    return {
      blue: this.players[0].ws,
      black: this.players[1].ws,
    };
  };

  /*
    Returns the WebSocket of the opponent of the player specified
    by the provided WebSocket
  */
  getOpponentOf = (ws) => {
    return this.players.find((p) => p.ws != ws).ws;
  };

  /*
    Forces the game to be ended - affects the isGameOver() function.
  */
  endGame = () => (this.forcedEnd = true);

  /*
    If the game was forced to be ended, returns "ForcedEnd".
    If the game is over, returns the websocket of the winner. Returns false otherwise.
  */
  isGameOver = () => {
    if (this.forcedEnd) return "ForcedEnd";
    // check if blue pawns are in the base
    let blueWin = true;
    this.players[0].positions.forEach((el) => {
      if (typeof el != "string" || !el.startsWith(this.playerColor[0]))
        blueWin = false;
    });

    if (blueWin)
      return {
        winner: this.players[0].ws,
        loser: this.player[1].ws,
      };

    // check if black pawns are in the base
    let blackWin = true;
    this.players[1].positions.forEach((el) => {
      if (typeof el != "string" || !el.startsWith(this.playerColor[1]))
        blackWin = false;
    });

    if (blackWin) return this.players[1].ws;
    return false;
  };
}

//module.exports = Game;
