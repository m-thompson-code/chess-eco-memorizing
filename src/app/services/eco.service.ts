import { Injectable } from '@angular/core';

import { ecoOpeningsMetadata } from '@app/eco_openings_metadata';
import { BoardManager } from '@app/types/boardManager';

export interface EcoOpening {
    ecoID: string;
    text: string;
    notation: string;
    notiationMoves: string[];
    whiteMoves: number;
    blackMoves: number;
};

export type Map<T> = {
    [key: string]: {
        ecoOpenings: T[];
        map?: Map<T>;
    };
};

@Injectable()
export class ECOService {
    // ecoOpeningsMetadata: {
    //     ecoID: string;
    //     text: string;
    //     notation: string;
    // }[] = ecoOpeningsMetadata;

    ecoOpenings: EcoOpening[];
    // ecoOpeningMap: Map<EcoOpening>;

    doInc: boolean = true;

    constructor() {
        (window as any).ecoService = this;

        this.ecoOpenings = [];
        // this.ecoOpeningMap = {};

        for (const ecoOpeningMetadata of ecoOpeningsMetadata) {
            const ecoID = ecoOpeningMetadata.ecoID;
            const text = ecoOpeningMetadata.text;

            const notation = ecoOpeningMetadata.notation;
            const notiationMoves = BoardManager.getNotationMoves(notation);

            const whiteMoves = Math.ceil(notiationMoves.length / 2);
            const blackMoves = Math.floor(notiationMoves.length / 2);

            const ecoOpening: EcoOpening = {
                ecoID: ecoID,
                text: text,
                notation: notation,
                notiationMoves: notiationMoves,
                whiteMoves: whiteMoves,
                blackMoves: blackMoves,
            };

            this.ecoOpenings.push(ecoOpening);
        }
    }

    public getEcoOpeningsByNotation(notation: string, moveCountFilter?: {maxMoves?: number, minMoves?: number}, sortBy?: 'text' | 'notation' | 'whiteMoves' | 'blackMoves'): EcoOpening[] {
        console.log(notation, moveCountFilter, sortBy);
        const ecoOpenings: EcoOpening[] = [];

        for (const ecoOpening of this.ecoOpenings) {
            if (ecoOpening.notation.startsWith(notation)) {
                if (moveCountFilter) {
                    if (moveCountFilter.maxMoves) {
                        if (ecoOpening.whiteMoves + ecoOpening.blackMoves > moveCountFilter.maxMoves) {
                            continue;
                        }
                    }

                    if (moveCountFilter.minMoves) {
                        if (ecoOpening.whiteMoves + ecoOpening.blackMoves < moveCountFilter.minMoves) {
                            continue;
                        }
                    }
                }

                ecoOpenings.push(ecoOpening);
            }
        }

        if (sortBy) {
            if (sortBy === 'whiteMoves' || sortBy === 'blackMoves') {
                ecoOpenings.sort((a, b) => {
                        return  a[sortBy] - b[sortBy];
                });
            } else {
                ecoOpenings.sort((a, b) => {
                    return  a[sortBy].localeCompare(b[sortBy]);
                });
            }
        }

        return ecoOpenings;
    }
}
