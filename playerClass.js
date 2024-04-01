export class Player{
    constructor(color, name){
        this.color = color;
        this.name = name;
        this.turn = false;
        this.eatenPieceArray = [];
    }
    static changeTurns(lastPlayedPlayer, nextPlayingPlayer, gameBoard){
        lastPlayedPlayer.turn = !lastPlayedPlayer.turn;
        nextPlayingPlayer.turn = !nextPlayingPlayer.turn;
        document.getElementById('playerOneInfo').classList.toggle('active-player', nextPlayingPlayer === gameBoard.playerOne);
        document.getElementById('playerTwoInfo').classList.toggle('active-player', nextPlayingPlayer === gameBoard.playerTwo);
    }
    addEatenPieceToEatArr(eatenPiece, gameBoard){
        this.eatenPieceArray.push(eatenPiece);
        const playerInfoId = this === gameBoard.playerOne ? 'playerOneInfo' : 'playerTwoInfo';
        document.getElementById(playerInfoId).textContent = `${this.name}: ${this.eatenPieceArray.length}`;
    }
}