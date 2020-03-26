import { SpaceComponent } from '@app/components/space/space.component';
import { DraggableSpaceComponent } from '@app/components/draggableSpace/draggableSpace.component';
import { Piece } from '@app/types/piece';
import { BoardManager, BoardPosition } from '@app/types/board';

export type GetBoardManagerFunc = () => BoardManager;
export type GetPositionFunc = () => BoardPosition;

export interface SpaceInit extends Coords {
    getBoard: GetBoardManagerFunc;
}

export interface Coords {
    x: number;
    y: number;
}

export class Space implements Coords {
    spaceComponent?: SpaceComponent;
    draggableSpaceComponent?: DraggableSpaceComponent;

    x: number;
    y: number;
    showDot: boolean;
    showBigDot: boolean;

    getBoardManager: GetBoardManagerFunc;
    getPosition: GetPositionFunc;
    piece?: Piece;

    constructor(spaceInit: SpaceInit) {
        this.x = spaceInit.x;
        this.y = spaceInit.y;
        this.showDot = false;
        this.showBigDot = false;

        this.getBoardManager = () => {
            return spaceInit.getBoard();
        };

        this.getPosition = () => {
            const _position = this.getBoardManager().getPosition(spaceInit.x, spaceInit.y);
            
            if (!_position) {
                throw {
                    message: "Unexpected _position",
                    x: spaceInit.x,
                    y: spaceInit.y,
                };
            }

            return _position;
        };
    }

    public setPiece(piece: Piece): void {
        piece.setPosition(this.getPosition());
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
