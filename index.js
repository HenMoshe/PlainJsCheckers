import { Tile } from "./tileClass.js"; 
import { Piece } from "./pieceClass.js";
import { Player } from "./playerClass.js";

class Board{
    constructor(board, playerOne, playerTwo){
        this.board = board;
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.tiles = [];
        this.pieces = [];
        this.markedTilesRight = [];
        this.markedTilesLeft = [];
        this.couldBeEatenRight = [];
        this.couldBeEatenLeft = [];
        this.justEatenPiece = null;
        this.curRow = -1;
        this.curCol = -1;
    }
    createNewGame() {
        for (let i = 0; i < 64; i++) {
            const divTile = document.createElement('div');
            const row = Math.floor(i / 8);
            const col = i % 8;
            const tile = new Tile(divTile, row, col);
            const piece = tile.newGameTile();
            if(piece !== undefined) this.pieces.push(piece);
            this.board.appendChild(divTile);
            this.tiles.push(tile);
            this.playerOne.turn = true;
        }
        this.addPossibleMovesListener();
    }
    checkIfTilesMakred(){
        return this.curCol > -1 && this.curRow > -1;
    }
    checkWhosTurnIsIt(){
        return this.playerOne.turn ? this.playerOne : this.playerTwo;
    }
    checkWhosTurnIsNext(){
        return this.playerOne.turn ? this.playerTwo : this.playerOne;
    }
    calcPossibleMovesAndMarkTiles(piece, col, row, justEaten = false){
        const possibleMoveObject = Piece.showPiecePossibleMoves(piece, this, justEaten);
        const tiles = [...possibleMoveObject.reqTilesLeft, ...possibleMoveObject.reqTilesRight];
        if(tiles.length < 1) return this.resetTilesMove();
        this.setTilesMove(possibleMoveObject, col, row);
        return tiles.forEach((tile)=> Tile.switchTileClass(tile));
    }
    calcPossibleEatMove(col, row){
        const fromTile = this.tiles.filter((item)=> item.row == this.curRow && item.col == this.curCol)[0];
        const toTile = this.tiles.filter((item)=> item.row == row && item.col == col)[0];
        const isToTileCorrectLeft = this.markedTilesLeft.filter((tile)=> tile.row === toTile.row && tile.col === toTile.col);
        const isToTileCorrectRight = this.markedTilesRight.filter((tile)=> tile.row === toTile.row && tile.col === toTile.col);
        return { fromTile, toTile, isToTileCorrectLeft, isToTileCorrectRight }    
    }
    addPossibleMovesListener(){
        const listenToBlur = (e) => {
            e.target.removeEventListener(e.type, listenToBlur);
            const row = parseInt(e.target.getAttribute('data-row'));
            const col = parseInt(e.target.getAttribute('data-col'));
            const didTilesMark = this.checkIfTilesMakred();
            const tile = this.tiles.filter((item)=> item.row == row && item.col == col)[0];
            const piece = this.pieces.filter((item)=> item.curRow == row && item.curCol == col)[0];
            const whosTurnIsIt = this.checkWhosTurnIsIt();
            
            if(tile.color === 'white') return;
            if(!didTilesMark){
                if(tile && !piece) return;
                if(tile && piece.color !== whosTurnIsIt.color && !piece.justEaten) return;
                if(tile && piece && !piece.justEaten){
                    return this.calcPossibleMovesAndMarkTiles(piece, col, row);
                }
                if(tile && piece && piece.justEaten){
                    return this.calcPossibleMovesAndMarkTiles(piece, col, row, piece.justEaten);
                }
            }
            if(didTilesMark){
                const tiles = [...this.markedTilesRight, ...this.markedTilesLeft];
                if(this.curCol === col && this.curRow === row){
                    return this.switchTilesAndResetMoves(tiles);
                };
                if(!piece){
                    //if marked and requested tile is free to recieve piece
                    const { fromTile, toTile, isToTileCorrectLeft, isToTileCorrectRight } = this.calcPossibleEatMove(col, row);                    
                    if(isToTileCorrectLeft.length < 1 && isToTileCorrectRight.length < 1){
                        return this.switchTilesAndResetMoves(tiles);
                    }
                    const whosTurnIsItNext = this.checkWhosTurnIsNext();
                    if(isToTileCorrectLeft.length > 0){
                        if(this.couldBeEatenLeft.length > 0){
                            const justEaten = Board.eatAndMovePieceThenResetMoves(gameBoard, this.couldBeEatenLeft, fromTile, toTile, tiles);
                            whosTurnIsIt.addEatenPieceToEatArr(justEaten, gameBoard);
                            Player.changeTurns(whosTurnIsIt, whosTurnIsItNext, gameBoard);
                            return justEaten
                        } 
                    }
                    if(isToTileCorrectRight.length > 0){
                        if(this.couldBeEatenRight.length > 0){
                            const justEaten = Board.eatAndMovePieceThenResetMoves(gameBoard, this.couldBeEatenRight, fromTile, toTile, tiles);
                            whosTurnIsIt.addEatenPieceToEatArr(justEaten, gameBoard);
                            Player.changeTurns(whosTurnIsIt, whosTurnIsItNext, gameBoard);
                            return justEaten
                        } 
                    }
                    const newPiece = Tile.movePieceBetweenTiles(fromTile, toTile);
                    this.switchTilesAndResetMoves(tiles);
                    Player.changeTurns(whosTurnIsIt, whosTurnIsItNext, gameBoard);
                    return newPiece;
            }
               
            }
              
        }
        document.body.addEventListener('click', listenToBlur);
    }
    resetTilesMove(){
        this.curCol = -1;
        this.curRow = -1;
        this.couldBeEatenLeft = [];
        this.couldBeEatenRight = [];
        this.markedTilesLeft = [];
        this.markedTilesRight = [];
    }
    setTilesMove(possibleMoveObject, col, row){
        this.couldBeEatenLeft = [...possibleMoveObject.couldBeEatenLeft];
        this.couldBeEatenRight = [...possibleMoveObject.couldBeEatenRight];
        this.markedTilesRight = [...possibleMoveObject.reqTilesRight];
        this.markedTilesLeft = [...possibleMoveObject.reqTilesLeft];
        this.curCol = col;
        return this.curRow = row;
    }
    switchTilesAndResetMoves(tiles){
        Tile.switchArrayOfTiles(tiles);
        return this.resetTilesMove();
    }
    static eatAndMovePieceThenResetMoves(gameBoard, couldBeEatenArr, fromTile, toTile, tiles){
        if(couldBeEatenArr.length > 0){
            const movedPiece = Tile.movePieceBetweenTiles(fromTile, toTile);
            movedPiece.justEaten = true;
            couldBeEatenArr[0].removePiece();
            gameBoard.switchTilesAndResetMoves(tiles);
            return movedPiece; 
        }
        else return ;
    }
    getRequestedTile(ind){
        const tile = this.tiles[ind];
        return tile;
    }
    canTileReceivePiece(ind){
        const tile = this.tiles[ind];
        if(tile.tile.innerHTML){
            return false;
        }
        else {
            return true;
        }
    }
    
}

let gameBoard;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startGame').addEventListener('click', function() {
        const playerOneName = document.getElementById('playerOneName').value || 'Player 1';
        const playerTwoName = document.getElementById('playerTwoName').value || 'Player 2';

        // Hide the setup div
        document.getElementById('player-setup').style.display = 'none';
        document.getElementById('game-info').style.display = 'block';
        document.getElementById('playerOneInfo').textContent = `${playerOneName}: 0`;
        document.getElementById('playerTwoInfo').textContent = `${playerTwoName}: 0`;
        document.getElementById('restartGame').style.display = 'inline';
        // Create player instances
        const playerOne = new Player('red-piece', playerOneName);
        const playerTwo = new Player('black-piece', playerTwoName);

        // Initialize the board with players
        const board = document.querySelector('.board');
        gameBoard = new Board(board, playerOne, playerTwo);
        gameBoard.createNewGame();
        document.getElementById('restartGame').addEventListener('click', function() {
            board.innerHTML = "";
            const playerOne = new Player('red-piece', playerOneName);
            const playerTwo = new Player('black-piece', playerTwoName);
            gameBoard = new Board(board, playerOne, playerTwo);
            gameBoard.createNewGame();
    });
    });
}); 
