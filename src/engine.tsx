import React from "react";

type Piece = '♜' | '♞' | '♝' | '♛' | '♚' | '♟' | '♙' | '♖' | '♘' | '♗' | '♕' | '♔' | '' ;
type Board = Piece[][];
type Player = 'white' | 'black';
type Position = [number, number];
type Move = { from: Position; to: Position };

interface ChessSquareProps {
    piece: Piece;
    isLight: boolean;
    isSelected: boolean;
    isLegalMove: boolean;
    onClick: () => void;
}

interface SelectedPiece {
    piece: Piece;
    row: number;
    col: number;
}

interface PromotionModalProps {
    onPromote: (piece: Piece) => void;
    player: Player;
}

const INITIAL_BOARD: Board = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

const isWhitePiece = (piece: Piece): boolean => '♔♕♖♗♘♙'.includes(piece);
const isBlackPiece = (piece: Piece): boolean => '♚♛♜♝♞♟'.includes(piece);

const isValidPawnMove = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    piece: Piece,
    board: Board,
    enPassantTarget: Position | null
): boolean => {
    const isWhitePawn = piece === '♙';
    const direction = isWhitePawn ? -1 : 1;
    const startingRow = isWhitePawn ? 6 : 1;

    if (startCol === endCol && endRow === startRow + direction && !board[endRow][endCol]) {
        return true;
    }

    if (
        startCol === endCol &&
        startRow === startingRow &&
        endRow === startRow + 2 * direction &&
        !board[startRow + direction][startCol] &&
        !board[endRow][endCol]
    ) {
        return true;
    }

    if (Math.abs(startCol - endCol) === 1 && endRow === startRow + direction) {
        const targetPiece = board[endRow][endCol];
        return !!targetPiece && isWhitePawn !== isWhitePiece(targetPiece);
    }

    // En passant capture
    if (
        enPassantTarget &&
        Math.abs(startCol - endCol) === 1 &&
        endRow === startRow + direction
    ) {
        return endRow === enPassantTarget[0] && endCol === enPassantTarget[1];
    }

    return false;
};

const isValidKnightMove = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
): boolean => {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

const isValidBishopMove = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    board: Board
): boolean => {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);

    if (rowDiff !== colDiff) {
        return false;
    }

    const rowDirection = endRow > startRow ? 1 : -1;
    const colDirection = endCol > startCol ? 1 : -1;

    for (let i = 1; i < rowDiff; i++) {
        const row = startRow + i * rowDirection;
        const col = startCol + i * colDirection;
        if (board[row][col] !== '') {
            return false;
        }
    }

    return true;
};

const isValidRookMove = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    board: Board
): boolean => {
    if (startRow !== endRow && startCol !== endCol) {
        return false;
    }

    const rowDirection = startRow === endRow ? 0 : endRow > startRow ? 1 : -1;
    const colDirection = startCol === endCol ? 0 : endCol > startCol ? 1 : -1;

    let currentRow = startRow + rowDirection;
    let currentCol = startCol + colDirection;

    while (currentRow !== endRow || currentCol !== endCol) {
        if (board[currentRow][currentCol] !== '') {
            return false;
        }
        currentRow += rowDirection;
        currentCol += colDirection;
    }

    return true;
};

const isValidQueenMove = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    board: Board
): boolean => {
    return (
        isValidRookMove(startRow, startCol, endRow, endCol, board) ||
        isValidBishopMove(startRow, startCol, endRow, endCol, board)
    );
};

const isSquareUnderAttack = (
    row: number,
    col: number,
    board: Board,
    attackingColor: Player
): boolean => {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (
                piece &&
                (attackingColor === 'white' ? isWhitePiece(piece) : isBlackPiece(piece))
            ) {
                let isAttacking = false;
                switch (piece) {
                    case '♙':
                    case '♟':
                        const direction = attackingColor === 'white' ? -1 : 1;
                        isAttacking =
                            Math.abs(j - col) === 1 && i + direction === row;
                        break;
                    case '♘':
                    case '♞':
                        isAttacking = isValidKnightMove(i, j, row, col);
                        break;
                    case '♗':
                    case '♝':
                        isAttacking = isValidBishopMove(i, j, row, col, board);
                        break;
                    case '♖':
                    case '♜':
                        isAttacking = isValidRookMove(i, j, row, col, board);
                        break;
                    case '♕':
                    case '♛':
                        isAttacking = isValidQueenMove(i, j, row, col, board);
                        break;
                    case '♔':
                    case '♚':
                        const rowDiff = Math.abs(row - i);
                        const colDiff = Math.abs(col - j);
                        isAttacking = rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff) > 0;
                        break;
                }
                if (isAttacking) return true;
            }
        }
    }
    return false;
};

interface MovedPieces {
    whiteKingMoved: boolean;
    whiteKingRookMoved: boolean;
    whiteQueenRookMoved: boolean;
    blackKingMoved: boolean;
    blackKingRookMoved: boolean;
    blackQueenRookMoved: boolean;
}

const isValidKingMove = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    board: Board,
    kingColor: Player,
    movedPieces: MovedPieces
): boolean => {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);

    const isBasicMoveValid = rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff) > 0;

    if (isBasicMoveValid) {
        const oppositeColor = kingColor === 'white' ? 'black' : 'white';
        return !isSquareUnderAttack(endRow, endCol, board, oppositeColor);
    }

    // Castling logic
    if (rowDiff === 0 && colDiff === 2) {
        // Cannot castle out of check
        if (isSquareUnderAttack(startRow, startCol, board, kingColor === 'white' ? 'black' : 'white')) {
            return false;
        }

        if (kingColor === 'white') {
            if (endCol === 6) { // King-side castling
                if (movedPieces.whiteKingMoved || movedPieces.whiteKingRookMoved) return false;
                if (board[7][5] !== '' || board[7][6] !== '') return false;
                if (isSquareUnderAttack(7, 5, board, 'black') || isSquareUnderAttack(7, 6, board, 'black')) return false;
                return true;
            } else if (endCol === 2) { // Queen-side castling
                if (movedPieces.whiteKingMoved || movedPieces.whiteQueenRookMoved) return false;
                if (board[7][1] !== '' || board[7][2] !== '' || board[7][3] !== '') return false;
                if (isSquareUnderAttack(7, 3, board, 'black') || isSquareUnderAttack(7, 2, board, 'black')) return false;
                return true;
            }
        } else {
            if (endCol === 6) { // King-side castling
                if (movedPieces.blackKingMoved || movedPieces.blackKingRookMoved) return false;
                if (board[0][5] !== '' || board[0][6] !== '') return false;
                if (isSquareUnderAttack(0, 5, board, 'white') || isSquareUnderAttack(0, 6, board, 'white')) return false;
                return true;
            } else if (endCol === 2) { // Queen-side castling
                if (movedPieces.blackKingMoved || movedPieces.blackQueenRookMoved) return false;
                if (board[0][1] !== '' || board[0][2] !== '' || board[0][3] !== '') return false;
                if (isSquareUnderAttack(0, 3, board, 'white') || isSquareUnderAttack(0, 2, board, 'white')) return false;
                return true;
            }
        }
    }

    return false;
};

const getAllLegalMoves = (board: Board, color: Player, enPassantTarget: Position | null): Move[] => {
    const moves: Move[] = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if ((color === 'white' && isWhitePiece(piece)) || (color === 'black' && isBlackPiece(piece))) {
                const pieceMoves = getLegalMoves(piece, row, col, board, enPassantTarget, {
                    whiteKingMoved: true,
                    whiteKingRookMoved: true,
                    whiteQueenRookMoved: true,
                    blackKingMoved: true,
                    blackKingRookMoved: true,
                    blackQueenRookMoved: true,
                });
                pieceMoves.forEach(move => {
                    const newBoard = board.map(r => [...r]);
                    newBoard[move[0]][move[1]] = newBoard[row][col];
                    newBoard[row][col] = '';

                    if (!isInCheck(newBoard, color)) {
                        moves.push({from: [row, col], to: move});
                    }
                });
            }
        }
    }
    return moves;
};

const getLegalMoves = (
    piece: Piece,
    row: number,
    col: number,
    board: Board,
    enPassantTarget: Position | null,
    movedPieces: MovedPieces
): Position[] => {
    const legalMoves: Position[] = [];
    const isWhite = isWhitePiece(piece);

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const targetPiece = board[i][j];

            if (targetPiece && isWhite === isWhitePiece(targetPiece)) {
                continue;
            }

            let isLegalMove = false;

            switch (piece) {
                case '♙':
                case '♟':
                    isLegalMove = isValidPawnMove(row, col, i, j, piece, board, enPassantTarget);
                    break;
                case '♘':
                case '♞':
                    isLegalMove = isValidKnightMove(row, col, i, j);
                    break;
                case '♗':
                case '♝':
                    isLegalMove = isValidBishopMove(row, col, i, j, board);
                    break;
                case '♖':
                case '♜':
                    isLegalMove = isValidRookMove(row, col, i, j, board);
                    break;
                case '♕':
                case '♛':
                    isLegalMove = isValidQueenMove(row, col, i, j, board);
                    break;
                case '♔':
                case '♚':
                    isLegalMove = isValidKingMove(row, col, i, j, board, isWhite ? 'white' : 'black', movedPieces);
                    break;
            }

            if (isLegalMove) {
                legalMoves.push([i, j]);
            }
        }
    }

    // En passant handling
    if ((piece === '♙' || piece === '♟') && enPassantTarget) {
        const direction = piece === '♙' ? -1 : 1;
        if (row + direction === enPassantTarget[0] && Math.abs(col - enPassantTarget[1]) === 1) {
            legalMoves.push(enPassantTarget);
        }
    }

    return legalMoves;
};

const isInCheck = (board: Board, color: Player): boolean => {
    let kingRow: number | undefined, kingCol: number | undefined;
    const kingSymbol = color === 'white' ? '♔' : '♚';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] === kingSymbol) {
                kingRow = i;
                kingCol = j;
                break;
            }
        }
        if (kingRow !== undefined) break;
    }

    if (kingRow === undefined || kingCol === undefined) {
        throw new Error("King not found on the board");
    }

    const oppositeColor = color === 'white' ? 'black' : 'white';
    return isSquareUnderAttack(kingRow, kingCol, board, oppositeColor);
};

const isCheckmate = (board: Board, color: Player, enPassantTarget: Position | null): boolean => {
    if (!isInCheck(board, color)) return false;

    const allMoves = getAllLegalMoves(board, color, enPassantTarget);
    for (const move of allMoves) {
        const newBoard = board.map(row => [...row]);
        const [fromRow, fromCol] = move.from;
        const [toRow, toCol] = move.to;
        newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = '';

        if (!isInCheck(newBoard, color)) {
            return false;
        }
    }

    return true;
};

const isStalemate = (board: Board, color: Player, enPassantTarget: Position | null): boolean => {
    if (isInCheck(board, color)) return false;

    const allMoves = getAllLegalMoves(board, color, enPassantTarget);
    return allMoves.length === 0;
};

const ChessSquare: React.FC<ChessSquareProps> = ({ piece, isLight, isSelected, isLegalMove, onClick }) => (
    <div
        onClick={onClick}
        style={{
            width: '50px',
            height: '50px',
            backgroundColor: isSelected ? '#7bccf7' : isLegalMove ? '#90EE90' : isLight ? '#f0d9b5' : '#b58863',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '2rem',
        }}
    >
        {piece}
    </div>
);

const PromotionModal: React.FC<PromotionModalProps> = ({ onPromote, player }) => {
    const promotionPieces = player === 'white' ? ['♕', '♖', '♗', '♘'] : ['♛', '♜', '♝', '♞'];
    return (
        <div className="promotion-modal">
            <div className="promotion-options">
                {promotionPieces.map((piece, index) => (
                    <div key={index} className="promotion-option" onClick={() => onPromote(piece)}>
                        {piece}
                    </div>
                ))}
            </div>
        </div>
    );
};

const Chessboard: React.FC = () => {
    const [board, setBoard] = React.useState<Board>(INITIAL_BOARD);
    const [selectedPiece, setSelectedPiece] = React.useState<SelectedPiece | null>(null);
    const [legalMoves, setLegalMoves] = React.useState<Position[]>([]);
    const [currentPlayer, setCurrentPlayer] = React.useState<Player>('white');
    const [status, setStatus] = React.useState<string>("White's turn to move");
    const [gameOver, setGameOver] = React.useState<boolean>(false);
    const [showPromotion, setShowPromotion] = React.useState<boolean>(false);
    const [promotionPosition, setPromotionPosition] = React.useState<Position | null>(null);
    const [enPassantTarget, setEnPassantTarget] = React.useState<Position | null>(null);
    const isAIMoving = React.useRef<boolean>(false);

    // Added state for tracking moved pieces
    const [movedPieces, setMovedPieces] = React.useState<MovedPieces>({
        whiteKingMoved: false,
        whiteKingRookMoved: false,
        whiteQueenRookMoved: false,
        blackKingMoved: false,
        blackKingRookMoved: false,
        blackQueenRookMoved: false,
    });

    const checkGameState = React.useCallback((board: Board, player: Player) => {
        const oppositePlayer = player === 'white' ? 'black' : 'white';
        if (isCheckmate(board, player, enPassantTarget)) {
            setStatus(`Checkmate! ${oppositePlayer.charAt(0).toUpperCase() + oppositePlayer.slice(1)} wins!`);
            setGameOver(true);
        } else if (isStalemate(board, player, enPassantTarget)) {
            setStatus("Stalemate! The game is a draw.");
            setGameOver(true);
        } else if (isInCheck(board, player)) {
            setStatus(`${player.charAt(0).toUpperCase() + player.slice(1)} is in check!`);
        } else {
            setStatus(`${player.charAt(0).toUpperCase() + player.slice(1)}'s turn to move`);
        }
    }, [enPassantTarget]);

    const makeAIMove = React.useCallback(() => {
        if (isAIMoving.current || gameOver) return;
        isAIMoving.current = true;

        try {
            const legalMoves = getAllLegalMoves(board, 'black', enPassantTarget);
            if (legalMoves.length === 0) {
                checkGameState(board, 'black');
                isAIMoving.current = false;
                return;
            }

            const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            const newBoard = board.map(row => [...row]);
            const [fromRow, fromCol] = randomMove.from;
            const [toRow, toCol] = randomMove.to;

            const movedPiece = newBoard[fromRow][fromCol];
            newBoard[toRow][toCol] = movedPiece;
            newBoard[fromRow][fromCol] = '';

            // Check for pawn promotion
            if (movedPiece === '♟' && toRow === 7) {
                // Choose promotion piece (90% queen, 10% random other piece)
                const promotionPieces = ['♛', '♜', '♝', '♞'];
                const promotedPiece = Math.random() < 0.9 ? '♛' : promotionPieces[Math.floor(Math.random() * promotionPieces.length)];
                newBoard[toRow][toCol] = promotedPiece;
            }

            setBoard(newBoard);
            setCurrentPlayer('white');
            checkGameState(newBoard, 'white');
        } catch (error) {
            console.error("Error during AI move:", error);
            setStatus("An error occurred during Black's move");
        } finally {
            isAIMoving.current = false;
        }
    }, [board, checkGameState, gameOver, enPassantTarget]);

    React.useEffect(() => {
        if (currentPlayer === 'black' && !gameOver && !showPromotion) {
            const timeoutId = setTimeout(() => {
                makeAIMove();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [currentPlayer, makeAIMove, gameOver, showPromotion, enPassantTarget]);

    const handlePromotion = (promotedPiece: Piece) => {
        if (promotionPosition) {
            const [row, col] = promotionPosition;
            const newBoard = board.map(r => [...r]);
            newBoard[row][col] = promotedPiece;
            setBoard(newBoard);
            setShowPromotion(false);
            setPromotionPosition(null);
            setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
            checkGameState(newBoard, currentPlayer === 'white' ? 'black' : 'white');
        }
    };

    const handleSquareClick = (row: number, col: number) => {
        if (currentPlayer !== 'white' || gameOver || showPromotion) return;

        if (selectedPiece) {
            const { piece, row: startRow, col: startCol } = selectedPiece;
            const isLegalMove = legalMoves.some(move => move[0] === row && move[1] === col);

            if (isLegalMove) {
                const newBoard = board.map(r => [...r]);
                const movedPiece = newBoard[startRow][startCol];
                newBoard[startRow][startCol] = '';
                newBoard[row][col] = movedPiece;

                // Handle castling move
                if (piece === '♔' && Math.abs(startCol - col) === 2) {
                    if (col === 6) { // King-side castling
                        newBoard[startRow][5] = newBoard[startRow][7];
                        newBoard[startRow][7] = '';
                        setMovedPieces(prev => ({ ...prev, whiteKingRookMoved: true }));
                    } else if (col === 2) { // Queen-side castling
                        newBoard[startRow][3] = newBoard[startRow][0];
                        newBoard[startRow][0] = '';
                        setMovedPieces(prev => ({ ...prev, whiteQueenRookMoved: true }));
                    }
                }

                // Update moved pieces state
                if (piece === '♔') {
                    setMovedPieces(prev => ({ ...prev, whiteKingMoved: true }));
                } else if (piece === '♖') {
                    if (startRow === 7 && startCol === 7) {
                        setMovedPieces(prev => ({ ...prev, whiteKingRookMoved: true }));
                    } else if (startRow === 7 && startCol === 0) {
                        setMovedPieces(prev => ({ ...prev, whiteQueenRookMoved: true }));
                    }
                }

                // Handle en passant capture
                if (piece === '♙' && enPassantTarget && row === enPassantTarget[0] && col === enPassantTarget[1]) {
                    newBoard[row + 1][col] = ''; // Remove the captured pawn
                }

                // Check for pawn promotion
                if (piece === '♙' && row === 0) {
                    setShowPromotion(true);
                    setPromotionPosition([row, col]);
                } else {
                    setCurrentPlayer('black');
                    checkGameState(newBoard, 'black');
                }

                // Update en passant target
                if (piece === '♙' && Math.abs(startRow - row) === 2) {
                    setEnPassantTarget([row + 1, col]);
                } else {
                    setEnPassantTarget(null);
                }

                setBoard(newBoard);
                setSelectedPiece(null);
                setLegalMoves([]);
            } else {
                setSelectedPiece(null);
                setLegalMoves([]);
            }
        } else if (board[row][col]) {
            const piece = board[row][col];
            if (isWhitePiece(piece)) {
                setSelectedPiece({ piece, row, col });
                setLegalMoves(getLegalMoves(piece, row, col, board, enPassantTarget, movedPieces).filter(move => {
                    const newBoard = board.map(r => [...r]);
                    newBoard[move[0]][move[1]] = newBoard[row][col];
                    newBoard[row][col] = '';

                    // Handle castling in simulation
                    const newMovedPieces = { ...movedPieces };
                    if (piece === '♔') {
                        if (Math.abs(col - move[1]) === 2) {
                            newMovedPieces.whiteKingMoved = true;
                            if (move[1] === 6) {
                                newBoard[row][5] = newBoard[row][7];
                                newBoard[row][7] = '';
                                newMovedPieces.whiteKingRookMoved = true;
                            } else if (move[1] === 2) {
                                newBoard[row][3] = newBoard[row][0];
                                newBoard[row][0] = '';
                                newMovedPieces.whiteQueenRookMoved = true;
                            }
                        } else {
                            newMovedPieces.whiteKingMoved = true;
                        }
                    }

                    return !isInCheck(newBoard, 'white');
                }));
            } else {
                setStatus("It's White's turn. Please select a white piece.");
            }
        }
    };

    return (
        <div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 50px)',
                gridTemplateRows: 'repeat(8, 50px)',
                width: '400px',
                height: '400px',
                border: '4px solid #333',
                margin: '20px auto'
            }}>
                {board.map((row, rowIndex) =>
                    row.map((piece, colIndex) => (
                        <ChessSquare
                            key={`${rowIndex}-${colIndex}`}
                            piece={piece}
                            isLight={(rowIndex + colIndex) % 2 === 0}
                            isSelected={selectedPiece !== null && selectedPiece.row === rowIndex && selectedPiece.col === colIndex}
                            isLegalMove={legalMoves.some(move => move[0] === rowIndex && move[1] === colIndex)}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                        />
                    ))
                )}
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '18px' }}>
                {status}
            </div>
            {showPromotion && <PromotionModal onPromote={handlePromotion} player={currentPlayer} />}
        </div>
    );
};

export default Chessboard