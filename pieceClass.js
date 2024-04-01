export class Piece{
    constructor(piece, row, col, color){
        this.piece = piece;
        this.curRow = row;
        this.curCol = col;
        this.color = color;
        this.justEaten = false;
        this.rightOffsets = color == 'red-piece' ? [[1,-1],[2, -2]] : [[-1, 1],[-2, 2 ]];
        this.leftOffsets = color == 'red-piece' ? [[1,1],[2,2]] : [[-1, -1], [-2, -2]];
    }
    addClassesAndAtt(){
        this.piece.classList.add('piece');
        this.piece.classList.add(this.color);
        this.piece.setAttribute('data-row', this.curRow);
        this.piece.setAttribute('data-col', this.curCol);
    }
    setRowAndColAttAfterMove(row, col){
        this.piece.setAttribute('data-row', row);
        this.piece.setAttribute('data-col', col);
        this.curRow = row;
        this.curCol = col;
    }
    static getOffsetsAfterEating(){
        const rightOffsets = [[1, -1], [2, -2], [-1, 1], [-2, 2]];
        const leftOffsets = [[1, 1], [2, 2], [-1, -1], [-2, -2]];
        return {
            rightOffsets,
            leftOffsets
        }
    }
    static calcPossibleMove(gameBoard, pieceColor, targetRow, targetCol, eatenArr, reqTilesArr, numOfAllowedMoves){
        const isTargetWithinBoard = targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8;
        if(isTargetWithinBoard){
            const canTileReceivePiece = gameBoard.getRequestedTile(targetRow * 8 + targetCol);
            const doesTileHavePiece = canTileReceivePiece && canTileReceivePiece.piece[0];
            const isSameColor = canTileReceivePiece && canTileReceivePiece.piece && canTileReceivePiece.piece[0] && canTileReceivePiece.piece[0].color === pieceColor;
            if(doesTileHavePiece){
                if(isSameColor) return 0;
                else if(!isSameColor){
                   return eatenArr.push(canTileReceivePiece); 
                }
            }
            if(numOfAllowedMoves === 1){
                if(eatenArr.length && eatenArr.length - 1 === reqTilesArr.length && reqTilesArr.length <= numOfAllowedMoves) return reqTilesArr.push(canTileReceivePiece);
            }
            else if(reqTilesArr.length <= numOfAllowedMoves) return reqTilesArr.push(canTileReceivePiece);
        }

    }
    static showPiecePossibleMoves(piece, gameBoard, afterEating = false){
        let couldBeEatenRight = [];
        let couldBeEatenLeft = [];
        let reqTilesRight = [];
        let reqTilesLeft = [];
        let offSets = afterEating ? Piece.getOffsetsAfterEating() : { rightOffsets: piece.rightOffsets, leftOffsets: piece.leftOffsets };
        let numOfAllowedMoves = afterEating ? 1 : 0;
        for(let i = 0; i < offSets.rightOffsets.length; i++){
                if(reqTilesRight.length > numOfAllowedMoves) break;
                const targetRowRight = piece.curRow + offSets.rightOffsets[i][0];
                const targetColRight = piece.curCol + offSets.rightOffsets[i][1];
                const calc = Piece.calcPossibleMove(gameBoard, piece.color, targetRowRight, targetColRight, couldBeEatenRight, reqTilesRight, numOfAllowedMoves);
                if(calc === 0) break; 
            }
        for(let i = 0; i < offSets.leftOffsets.length; i++){ 
            if(reqTilesLeft.length > numOfAllowedMoves) break;
                const targetRowLeft = piece.curRow + offSets.leftOffsets[i][0];
                const targetColLeft = piece.curCol + offSets.leftOffsets[i][1];
                const calc = Piece.calcPossibleMove(gameBoard, piece.color, targetRowLeft, targetColLeft, couldBeEatenLeft, reqTilesLeft, numOfAllowedMoves);
                if(calc === 0) break;
        }
        if(afterEating) piece.justEaten = false;        
        const possibleMoveObject = {
            couldBeEatenLeft: couldBeEatenLeft,
            reqTilesLeft: reqTilesLeft,
            couldBeEatenRight: couldBeEatenRight,
            reqTilesRight: reqTilesRight
        }
        return possibleMoveObject;
    }


}