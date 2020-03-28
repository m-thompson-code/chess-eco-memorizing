import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BoardManager } from '@app/types/board';
import { Piece, PromotePieceType, PieceColor } from '@app/types/piece';
import { BoardPosition, Coords } from '@app/types/boardPosition';

import { DragMoved, DragStarted, DragEnded, HoverElement } from '../position/position.component';

@Component({
    selector: 'moo-board',
    templateUrl: './board.template.html',
    styleUrls: ['./board.style.scss']
})
export class BoardComponent implements OnInit {
    @Input() public boardManager?: BoardManager;

    @Output() public dragStarted: EventEmitter<DragStarted<HoverElement>> = new EventEmitter;
    @Output() public dragMoved: EventEmitter<DragMoved<HoverElement>> = new EventEmitter;
    @Output() public dragEnded: EventEmitter<DragEnded<HoverElement>> = new EventEmitter;
        
    public yDelta?: number;
    public xDelta?: number;

    public hoverX: number = 0;
    public hoverY: number = 0;

    public hoverStartFromPosition?: BoardPosition;
    public hoverPosition?: BoardPosition;

    public draggingPiece?: Piece;

    public dragging: boolean;
    public touchDragging: boolean;

    public pointerPosition: Coords = {
        x: 0,
        y: 0,
    };

    showNotationLabels: boolean;

    verticalNotationlabels: number[];
    horizontalNotationlabels: string[];

    showPromotionSelect: boolean;
    selectPromotionResolve?: (promotePieceType?: PromotePieceType) => void;
    selectPromotionReject?: (error: any)=>void;
    promotionColor: PieceColor;

    constructor() {
        this.dragging = false;
        this.touchDragging = false;
        this.showNotationLabels = true;

        this.verticalNotationlabels = [8, 7, 6, 5, 4, 3, 2, 1];
        this.horizontalNotationlabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        this.showPromotionSelect = false;
        this.promotionColor = 'white';
    }

    public ngOnInit() {
        this.pointerPosition = {
            x: 0, y: 0
        };
    }

    public async movePiece(piece: Piece, newPosition: BoardPosition): Promise<void> {
        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            };
        }

        // Promotion check
        if (piece.pieceType === 'pawn' && (newPosition.showDot || newPosition.showBigDot)) {
            if (piece.color === 'white' && newPosition.y === 0 || piece.color === 'black' && newPosition.y === 7) {
                return this.getPromotionPieceType(piece.color).then(promotionPieceType => {
                    // console.log(promotionPieceType);
                    if (promotionPieceType) {
                        return this._movePiece(piece, newPosition, promotionPieceType);
                    }

                    this.draggingPiece = undefined;
                    this.hoverPosition = undefined;
                    this.hoverStartFromPosition = undefined;
                
                    piece.dragging = false;
                    piece.touchDragging = false;

                    piece.resetBoardPositionStyles();
                    const oldPosition = piece.getPosition();

                    if (oldPosition) {
                        this.activatePosition(oldPosition);
                    }
                });
            }
        }

        // For everything else
        return Promise.resolve().then(() => {
            this._movePiece(piece, newPosition);
        });
    }

    public getPromotionPieceType(promotionColor: PieceColor): Promise<PromotePieceType | undefined> {
        this.showPromotionSelect = true;
        this.promotionColor = promotionColor;
        return new Promise((resolve, reject) => {
            this.selectPromotionResolve = resolve;
            this.selectPromotionReject = reject;
        });
    }

    public selectPromotion(promotionPieceType?: PromotePieceType): PromotePieceType | undefined {
        try {
            this.showPromotionSelect = false;

            if (this.selectPromotionResolve) {
                this.selectPromotionResolve(promotionPieceType);
            }
        }catch(error) {
            console.error(error);

            if (this.selectPromotionReject) {
                this.selectPromotionReject(error);
            } else {
                throw error;
            }
        }
        
        return promotionPieceType;
    }

    private _movePiece(piece: Piece, newPosition: BoardPosition, promotionPieceType?: PromotePieceType): void {
        this.draggingPiece = undefined;
        this.hoverPosition = undefined;
        this.hoverStartFromPosition = undefined;
    
        piece.dragging = false;
        piece.touchDragging = false;

        // Exit early / activate other position with same team piece
        if (newPosition.piece && newPosition.piece.color === piece.color && !newPosition.showDot && !newPosition.showBigDot) {
            piece.resetBoardPositionStyles();
            this.activatePosition(newPosition);
            return;
        }

        const moved = piece.moveToPosition(newPosition, true, promotionPieceType);

        if (!moved) {
            piece.resetBoardPositionStyles();
        }
    }

    dragPiece(piece: Piece, dragMovedEvent: DragMoved): void {
        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            }
        }

        const width = dragMovedEvent.cdkDragMove.source.element.nativeElement.offsetWidth;

        let positionOffsetX = (this.boardManager.boardOrientation === 'flipped' ? (7 - dragMovedEvent.position.x) : dragMovedEvent.position.x) * width;
        let positionOffsetY = (this.boardManager.boardOrientation === 'flipped' ? (7 - dragMovedEvent.position.y) : dragMovedEvent.position.y) * width;

        const draggedPositionOffsetX = positionOffsetX + dragMovedEvent.cdkDragMove.distance.x;
        const draggedPositionOffsetY = positionOffsetY + dragMovedEvent.cdkDragMove.distance.y;

        if (dragMovedEvent.cdkDragMove.event.type === 'touchmove') {
            piece.touchDragging = true;

            const pointerOffsetX = draggedPositionOffsetX + (this.xDelta || 0) - width / 2;
            const pointerOffsetY = draggedPositionOffsetY + (this.yDelta || 0) - width / 2;

            const left = pointerOffsetX;
            const top = pointerOffsetY;

            piece.top = `${top}px`;
            piece.left = `${left}px`;
        } else {
            const left = draggedPositionOffsetX;
            const top = draggedPositionOffsetY;

            piece.top = `${top}px`;
            piece.left = `${left}px`;
        }

        piece.dragging = true;        
    }

    public updateHoverPosition(dragMovedEvent: DragMoved): void {
        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            };
        }

        const event = dragMovedEvent.cdkDragMove;

        const width = event.source.element.nativeElement.offsetWidth;

        let _x = this.hoverStartFromPosition && this.hoverStartFromPosition.x || 0;
        let _y = this.hoverStartFromPosition && this.hoverStartFromPosition.y || 0;

        let _xDelta = 0;
        let _yDelta = 0;

        if (dragMovedEvent.cdkDragMove.event.type === 'touchmove') {
            _xDelta = Math.round((event.distance.x + (this.xDelta || 0) - width / 2) / width);
            _yDelta = Math.round((event.distance.y + (this.yDelta || 0) - width / 2) / width);
        } else {
            _xDelta = Math.round(event.distance.x / width);
            _yDelta = Math.round(event.distance.y / width);
        }

        if (this.boardManager.boardOrientation === 'flipped') {
            _x -= _xDelta;
            _y -= _yDelta;
        } else {
            _x += _xDelta;
            _y += _yDelta;
        }

        if (_x < 0) {
            _x = 0;
        } else if (_x > 7) {
            _x = 7;
        }

        if (_y < 0) {
            _y = 0;
        } else if (_y > 7) {
            _y = 7;
        }

        this.hoverX = _x;
        this.hoverY = _y;

        const hoverPosition = this.boardManager.getPosition(_x, _y);

        if (!hoverPosition) {
            throw {
                message: "Unexpected hoverPosition",
                _x: _x,
                _y: _y,
            }
        }

        this.hoverPosition = hoverPosition;
    }

    public activatePosition(position: BoardPosition): void {
        if (!this.boardManager) {
            throw {
                message: 'Unexpected missing message',
            }
        }

        this.boardManager.activePosition = position;

        if (position.piece) {
            this.boardManager.showMovementDots(position.piece);
        }
    }
    
    public deactivatePosition(): void {
        if (!this.boardManager) {
            throw {
                message: 'Unexpected missing message',
            }
        }

        if (this.boardManager.activePosition) {
            this.boardManager.activePosition = undefined;

            this.boardManager.hideMovementDots();
        }
    }

    public handleDragStarted(dragStartedEvent: DragStarted): void {
        if (!this.boardManager) {
            throw {
                message: 'Unexpected missing message',
            };
        }

        this.hoverStartFromPosition = undefined;
        this.hoverPosition = undefined;

        if (!dragStartedEvent.position || !dragStartedEvent.position.piece || dragStartedEvent.position.piece.color !== this.boardManager.turn) {
            this.hoverStartFromPosition = undefined;
            this.hoverPosition = undefined;
            this.dragging = false;
            this.touchDragging = false;
            this.deactivatePosition();
            return;
        }

        const event = dragStartedEvent.cdkDragStart;

        event.source.element.nativeElement.classList.add('active');

        this.hoverStartFromPosition = dragStartedEvent.position;
        this.hoverPosition = undefined;

        this.activatePosition(dragStartedEvent.position);

        return this.dragStarted.emit(dragStartedEvent);
    }

    public handleDragMoved(dragMovedEvent: DragMoved): void {
        if (!this.boardManager) {
            throw {
                message: 'Unexpected missing message',
            }
        }

        if (!dragMovedEvent.position || !dragMovedEvent.position.piece || dragMovedEvent.position.piece.color !== this.boardManager.turn) {
            this.hoverStartFromPosition = undefined;
            this.hoverPosition = undefined;
            this.dragging = false;
            this.touchDragging = false;
            this.deactivatePosition();
            return;
        }

        const event = dragMovedEvent.cdkDragMove;

        if (event.pointerPosition && typeof this.xDelta === 'undefined') {
            const clientRect = event.source.element.nativeElement.getBoundingClientRect();

            const xDelta = event.pointerPosition.x - clientRect.left;
            const yDelta = event.pointerPosition.y - clientRect.top;

            this.xDelta = xDelta || 0;
            this.yDelta = yDelta || 0;
        }

        this.updateHoverPosition(dragMovedEvent);

        this.dragging = true;

        if (dragMovedEvent.cdkDragMove.event.type === 'touchmove') {
            this.touchDragging = true;
        }

        this.pointerPosition = event.pointerPosition;

        this.draggingPiece = dragMovedEvent.position.piece;

        if (this.draggingPiece) {
            this.dragPiece(this.draggingPiece, dragMovedEvent);
        }

        return this.dragMoved.emit(dragMovedEvent);
    }
    
    public async handleDragEnded(dragEndedEvent: DragEnded): Promise<void> {
        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            };
        }

        this.dragging = false;
        this.touchDragging = false;

        if (!dragEndedEvent.position || !dragEndedEvent.position.piece || dragEndedEvent.position.piece.color !== this.boardManager.turn) {
            this.hoverStartFromPosition = undefined;
            this.hoverPosition = undefined;
            this.dragging = false;
            this.touchDragging = false;
            this.deactivatePosition();
            return;// Promise.resolve();
        }

        const event = dragEndedEvent.cdkDragEnd;

        event.source.element.nativeElement.classList.remove('active');

        if (this.draggingPiece && this.hoverPosition) {
            await this.movePiece(this.draggingPiece, this.hoverPosition);
        }

        this.hoverPosition = undefined;
        this.hoverStartFromPosition = undefined;

        this.xDelta = undefined;
        this.yDelta = undefined;

        return this.dragEnded.emit(dragEndedEvent);
    }

    public async handleClickingDraggable(position: BoardPosition): Promise<void> {
        if (!this.boardManager) {
            throw {
                message: "Unexpected missing board",
            };
        }

        if (this.boardManager.activePosition && this.boardManager.activePosition.piece) {
            return await this.movePiece(this.boardManager.activePosition.piece, position);
        }

        if (!position.piece) {
            return;
        }

        if (this.boardManager.turn === position.piece.color) {
            this.activatePosition(position);
        }
    }
}
