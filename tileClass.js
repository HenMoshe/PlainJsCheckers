import { Piece } from './pieceClass.js'
export class Tile{
    constructor(tile, row, col){
        this.tile = tile;
        this.row = row;
        this.col = col;
        this.piece = [];
        this.color = (row + col) % 2 === 0 ? 'white' : 'black';
    }
    static switchTileClass(tile){
        if(tile.tile.classList.contains('tile-possible-move')){
            tile.tile.classList.remove('tile-possible-move');
            tile.tile.classList.add('tile');
        }
        else{
            tile.tile.classList.remove('tile');
            tile.tile.classList.add('tile-possible-move');
        }
        
    }
    static switchArrayOfTiles(tilesArray){
        tilesArray.forEach((tile)=>{
            Tile.switchTileClass(tile);
        })
    }
    static isValidTile(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    static movePieceBetweenTiles(fromTile, toTile){
        const removed = fromTile.removePiece();
        if(!removed) return;
        return toTile.addPiece(removed);
    }
    newTileClasses(){
        this.tile.classList.add('tile');
        this.tile.classList.add(this.color);
        this.tile.setAttribute('data-row', this.row);
        this.tile.setAttribute('data-col', this.col);
    }
    removePiece(){
        let piece;
        if(this.tile.innerHTML){
            piece = this.piece[0];
            piece.setRowAndColAttAfterMove(-2, -2);
            this.piece = [];
            this.tile.innerHTML = '';
            return piece;
        }
        else return false;
    }
    addPiece(piece){
        if(this.piece.length === 0){
            piece.setRowAndColAttAfterMove(this.row, this.col);
            this.piece.push(piece);
            this.tile.appendChild(piece.piece);
            return piece;
        }
        return false;
    }
    newTilePiece(pieceColor){
        const pieceDiv = document.createElement('div');
        const piece = new Piece(pieceDiv, this.row, this.col, pieceColor);
        piece.addClassesAndAtt();
        this.tile.appendChild(pieceDiv);
        this.piece.push(piece);
        return piece;
    }
    newGameTile(){
        this.newTileClasses();
        const shouldTileHavePiece = this.row < 3 && this.color === 'black' || this.row > 4 && this.color === 'black';    
        if(shouldTileHavePiece){
            const pieceColor = this.row < 3 ? 'red-piece' : 'black-piece';
            const piece = this.newTilePiece(pieceColor);
            return piece;
        }
    } 
}