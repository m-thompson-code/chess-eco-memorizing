import { PositionComponent } from '@app/components/position/position.component';
import { DraggablePositionComponent } from '@app/components/draggablePosition/draggablePosition.component';
import { Piece } from '@app/types/piece';
import { BoardManager } from '@app/types/board';

export type GetBoardManagerFunc = () => BoardManager;
export type GetBoardPositionFunc = () => BoardPosition;

export interface BoardPositionInit extends Coords {
    boardManager: BoardManager;
}

export interface Coords {
    x: number;
    y: number;
}

export class BoardPosition implements Coords {
    // These references to Componenets aren't being used. Should remove later if they are only for testing
    public positionComponent?: PositionComponent;
    public draggablePositionComponent?: DraggablePositionComponent;
    
    public readonly x: number;
    public readonly y: number;
    public showDot: boolean;
    public showBigDot: boolean;

    public getBoardManager: GetBoardManagerFunc;

    private _piece: Piece | undefined;

    public set piece(piece: Piece | undefined) {
        if (piece) {
            const oldPosition = piece.getPosition();

            if (oldPosition !== this) {
                oldPosition.piece = undefined;
            }
            
            piece._getPosition = () => {
                return this;
            }
    
            piece.x = this.x;
            piece.y = this.y;
        }

        this._piece = piece;
    }

    public get piece(): Piece | undefined {
        return this._piece;
    };

    constructor(positionInit: BoardPositionInit) {
        this.x = positionInit.x;
        this.y = positionInit.y;
        this.showDot = false;
        this.showBigDot = false;

        this.getBoardManager = () => {
            return positionInit.boardManager;
        };
    }

    public getHorizontalNotation(): string {
        const horizontalNotationlabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return horizontalNotationlabels[this.x];
    }
    
    public getVerticalNotation(): number {
        const verticalNotationlabels = [8, 7, 6, 5, 4, 3, 2, 1];
        return verticalNotationlabels[this.y];
    }
}
