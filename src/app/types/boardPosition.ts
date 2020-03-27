import { PositionComponent } from '@app/components/position/position.component';
import { DraggablePositionComponent } from '@app/components/draggablePosition/draggablePosition.component';
import { Piece } from '@app/types/piece';
import { BoardManager } from '@app/types/board';

export type GetBoardManagerFunc = () => BoardManager;
export type GetBoardPositionFunc = () => BoardPosition | undefined;

export interface BoardPositionInit extends Coords {
    getBoard: GetBoardManagerFunc;
}

export interface Coords {
    x: number;
    y: number;
}

export class BoardPosition implements Coords {
    positionComponent?: PositionComponent;
    draggablePositionComponent?: DraggablePositionComponent;
    
    public readonly x: number;
    public readonly y: number;
    showDot: boolean;
    showBigDot: boolean;

    getBoardManager: GetBoardManagerFunc;

    private _piece: Piece | undefined;

    public set piece(piece: Piece | undefined) {
        if (this._piece) {
            this._piece.getPosition = () => {
                return undefined;
            }
        }

        // Let the old piece keep its x and y values so that if we bring that piece back, we can position it properly

        this._piece = piece;

        if (this._piece) {
            this._piece.getPosition = () => {
                return this;
            }
    
            this._piece.x = this.x;
            this._piece.y = this.y;
        }
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
            return positionInit.getBoard();
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
