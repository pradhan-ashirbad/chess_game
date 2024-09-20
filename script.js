// Chess piece Unicode characters
const PIECES = {
    'white': { 'pawn': '♙', 'rook': '♖', 'knight': '♘', 'bishop': '♗', 'queen': '♕', 'king': '♔' },
    'black': { 'pawn': '♟', 'rook': '♜', 'knight': '♞', 'bishop': '♝', 'queen': '♛', 'king': '♚' }
};

let isBotActive = false;
let isProcessingMove = false;

let selectedPiece = null;
let currentPlayer = 'white';
let capturedPieces = {
    'white': [],
    'black': []
};

document.addEventListener('DOMContentLoaded', () => {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', handleSquareClick);
    });
    document.getElementById('toggle-bot').addEventListener('click', toggleBot);
    updateTurnDisplay();
});

function debugLog(message) {
    console.log(`[DEBUG] ${message}`);
}

function handleSquareClick(event) {
    if (isBotActive && currentPlayer === 'black') return;

    const square = event.target;
    removeHighlights();

    if (selectedPiece === null) {
        if (square.textContent !== '' && isPieceOfCurrentPlayer(square.textContent)) {
            selectedPiece = square;
            square.classList.add('selected');
            highlightValidMoves(square);
        }
    } else {
        if (isValidMove(selectedPiece, square)) {
            if (movePiece(selectedPiece, square)) {
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
            }
        } else if (square === selectedPiece) {
            square.classList.remove('selected');
            selectedPiece = null;
        } else if (isPieceOfCurrentPlayer(square.textContent)) {
            selectedPiece.classList.remove('selected');
            selectedPiece = square;
            square.classList.add('selected');
            highlightValidMoves(square);
        }
    }
}


function highlightValidMoves(square) {
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach(targetSquare => {
        if (isValidMove(square, targetSquare)) {
            if (targetSquare.textContent === '') {
                targetSquare.classList.add('valid-move');
            } else {
                targetSquare.classList.add('valid-capture');
            }
        }
    });
}

function removeHighlights() {
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach(square => {
        square.classList.remove('valid-move', 'valid-capture');
    });
}

function isPieceOfCurrentPlayer(piece) {
    return (currentPlayer === 'white' && Object.values(PIECES.white).includes(piece)) ||
           (currentPlayer === 'black' && Object.values(PIECES.black).includes(piece));
}

function isValidMove(fromSquare, toSquare) {
    const piece = fromSquare.textContent;
    const fromRow = getRow(fromSquare);
    const fromCol = getCol(fromSquare);
    const toRow = getRow(toSquare);
    const toCol = getCol(toSquare);

    // Basic move validation
    if (toSquare.textContent !== '' && isPieceOfCurrentPlayer(toSquare.textContent)) {
        return false; // Can't capture own piece
    }

    switch (piece) {
        case PIECES.white.pawn:
        case PIECES.black.pawn:
            return isValidPawnMove(fromRow, fromCol, toRow, toCol, piece);
        case PIECES.white.rook:
        case PIECES.black.rook:
            return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case PIECES.white.knight:
        case PIECES.black.knight:
            return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case PIECES.white.bishop:
        case PIECES.black.bishop:
            return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case PIECES.white.queen:
        case PIECES.black.queen:
            return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case PIECES.white.king:
        case PIECES.black.king:
            return isValidKingMove(fromRow, fromCol, toRow, toCol);
        default:
            return false;
    }
}

function isValidPawnMove(fromRow, fromCol, toRow, toCol, piece) {
    const direction = piece === PIECES.white.pawn ? -1 : 1;
    const startRow = piece === PIECES.white.pawn ? 6 : 1;

    // Move forward
    if (fromCol === toCol && toRow === fromRow + direction && getSquare(toRow, toCol).textContent === '') {
        return true;
    }

    // Initial two-square move
    if (fromRow === startRow && fromCol === toCol && toRow === fromRow + 2 * direction &&
        getSquare(fromRow + direction, fromCol).textContent === '' &&
        getSquare(toRow, toCol).textContent === '') {
        return true;
    }

    // Capture diagonally
    if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction &&
        getSquare(toRow, toCol).textContent !== '' &&
        !isPieceOfCurrentPlayer(getSquare(toRow, toCol).textContent)) {
        return true;
    }

    return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;

    const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);

    for (let i = 1; i < Math.max(Math.abs(fromRow - toRow), Math.abs(fromCol - toCol)); i++) {
        if (getSquare(fromRow + i * rowStep, fromCol + i * colStep).textContent !== '') {
            return false;
        }
    }

    return true;
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;

    const rowStep = toRow > fromRow ? 1 : -1;
    const colStep = toCol > fromCol ? 1 : -1;

    for (let i = 1; i < Math.abs(fromRow - toRow); i++) {
        if (getSquare(fromRow + i * rowStep, fromCol + i * colStep).textContent !== '') {
            return false;
        }
    }

    return true;
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol) ||
           isValidBishopMove(fromRow, fromCol, toRow, toCol);
}

function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
}

function movePiece(fromSquare, toSquare) {
    debugLog(`Moving piece from ${getSquareNotation(fromSquare)} to ${getSquareNotation(toSquare)}`);
    const capturedPiece = toSquare.textContent;
    toSquare.textContent = fromSquare.textContent;
    fromSquare.textContent = '';

    removeHighlights();

    if (capturedPiece !== '') {
        const capturedColor = currentPlayer === 'white' ? 'black' : 'white';
        capturedPieces[capturedColor].push(capturedPiece);
        updateCapturedPiecesDisplay();
    }

    if (isPawnPromotion(toSquare)) {
        if (isBotActive && currentPlayer === 'black') {
            toSquare.textContent = PIECES.black.queen;
        } else {
            promotePawn(toSquare);
            return true;
        }
    }

    if (capturedPiece === PIECES.white.king || capturedPiece === PIECES.black.king) {
        endGame(currentPlayer);
        return true;
    }

    const opponentColor = currentPlayer === 'white' ? 'black' : 'white';
    if (isKingInCheck(opponentColor)) {
        if (isCheckmate(opponentColor)) {
            endGame(currentPlayer);
            return true;
        } else {
            alert('Check!');
        }
    }

    isProcessingMove = false;
    debugLog('Move completed, switching player');
    switchPlayer();
    return true;
}

// Modify the switchPlayer function
function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTurnDisplay();
    debugLog(`Switched to ${currentPlayer}'s turn. Bot active: ${isBotActive}`);

    if (isBotActive && currentPlayer === 'black' && !isProcessingMove) {
        debugLog('Triggering bot move...');
        setTimeout(triggerBotMove, 100); // Add a small delay before triggering the bot move
    } else {
        debugLog(`Not triggering bot move. Bot active: ${isBotActive}, Current player: ${currentPlayer}, Processing move: ${isProcessingMove}`);
    }
}

function updateTurnDisplay() {
    const turnDisplay = document.getElementById('turn-display');
    if (turnDisplay) {
        turnDisplay.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
    } else {
        debugLog("Turn display element not found");
    }
}

function getRow(square) {
    return Math.floor(Array.from(square.parentNode.children).indexOf(square) / 8);
}

function getCol(square) {
    return Array.from(square.parentNode.children).indexOf(square) % 8;
}

function getSquare(row, col) {
    return document.querySelector(`.chessboard > :nth-child(${row * 8 + col + 1})`);
}

function isKingInCheck(player) {
    const kingPiece = player === 'white' ? PIECES.white.king : PIECES.black.king;
    const kingSquare = findKing(player);
    
    if (!kingSquare) return false;  // King not found (shouldn't happen in a valid game state)

    const opponentPlayer = player === 'white' ? 'black' : 'white';
    const allSquares = document.querySelectorAll('.square');

    for (let square of allSquares) {
        if (isPieceOfPlayer(square.textContent, opponentPlayer)) {
            if (isValidMove(square, kingSquare)) {
                return true;
            }
        }
    }

    return false;
}

function findKing(player) {
    const kingPiece = player === 'white' ? PIECES.white.king : PIECES.black.king;
    const allSquares = document.querySelectorAll('.square');
    
    for (let square of allSquares) {
        if (square.textContent === kingPiece) {
            return square;
        }
    }

    return null;  // King not found (shouldn't happen in a valid game state)
}

function isPieceOfPlayer(piece, player) {
    return (player === 'white' && Object.values(PIECES.white).includes(piece)) ||
           (player === 'black' && Object.values(PIECES.black).includes(piece));
}

function isCheckmate(player) {
    const allSquares = document.querySelectorAll('.square');
    
    for (let fromSquare of allSquares) {
        if (isPieceOfPlayer(fromSquare.textContent, player)) {
            for (let toSquare of allSquares) {
                if (isValidMove(fromSquare, toSquare)) {
                    // Try the move
                    const originalFromContent = fromSquare.textContent;
                    const originalToContent = toSquare.textContent;
                    toSquare.textContent = fromSquare.textContent;
                    fromSquare.textContent = '';

                    const stillInCheck = isKingInCheck(player);

                    // Undo the move
                    fromSquare.textContent = originalFromContent;
                    toSquare.textContent = originalToContent;

                    if (!stillInCheck) {
                        return false;  // Found a valid move that escapes check
                    }
                }
            }
        }
    }

    return true;  // No valid moves found to escape check
}

function endGame(winner) {
    alert(`Checkmate! ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`);
    isBotActive = false;
    document.getElementById('toggle-bot').textContent = 'Activate Bot';
    document.getElementById('toggle-bot').classList.remove('active');
    disableBoard();
}
function disableBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.removeEventListener('click', handleSquareClick);
    });
}

function isPawnPromotion(square) {
    const piece = square.textContent;
    const row = getRow(square);
    return (piece === PIECES.white.pawn && row === 0) || (piece === PIECES.black.pawn && row === 7);
}

function promotePawn(square) {
    const promotionPieces = currentPlayer === 'white' 
        ? [PIECES.white.queen, PIECES.white.rook, PIECES.white.bishop, PIECES.white.knight]
        : [PIECES.black.queen, PIECES.black.rook, PIECES.black.bishop, PIECES.black.knight];

    const pieceNames = ['Queen', 'Rook', 'Bishop', 'Knight'];

    const promotionDiv = document.createElement('div');
    promotionDiv.className = 'promotion-selection';
    promotionDiv.style.position = 'fixed';
    promotionDiv.style.top = '50%';
    promotionDiv.style.left = '50%';
    promotionDiv.style.transform = 'translate(-50%, -50%)';
    promotionDiv.style.background = 'white';
    promotionDiv.style.padding = '20px';
    promotionDiv.style.border = '2px solid black';
    promotionDiv.style.display = 'flex';
    promotionDiv.style.flexDirection = 'column';
    promotionDiv.style.alignItems = 'center';

    const promptText = document.createElement('p');
    promptText.textContent = 'Choose a piece for pawn promotion:';
    promotionDiv.appendChild(promptText);

    promotionPieces.forEach((piece, index) => {
        const button = document.createElement('button');
        button.textContent = `${piece} ${pieceNames[index]}`;
        button.style.margin = '5px';
        button.style.padding = '10px';
        button.style.fontSize = '20px';
        button.addEventListener('click', () => {
            square.textContent = piece;
            document.body.removeChild(promotionDiv);
            // Switch player after pawn promotion
            switchPlayer();
        });
        promotionDiv.appendChild(button);
    });

    document.body.appendChild(promotionDiv);
}


function updateCapturedPiecesDisplay() {
    const whiteCapturedElement = document.getElementById('captured-white-pieces');
    const blackCapturedElement = document.getElementById('captured-black-pieces');

    whiteCapturedElement.innerHTML = '';
    blackCapturedElement.innerHTML = '';

    capturedPieces.white.forEach(piece => {
        const pieceElement = document.createElement('span');
        pieceElement.className = 'captured-piece';
        pieceElement.textContent = piece;
        whiteCapturedElement.appendChild(pieceElement);
    });

    capturedPieces.black.forEach(piece => {
        const pieceElement = document.createElement('span');
        pieceElement.className = 'captured-piece';
        pieceElement.textContent = piece;
        blackCapturedElement.appendChild(pieceElement);
    });
}

function toggleBot() {
    isBotActive = !isBotActive;
    const toggleButton = document.getElementById('toggle-bot');
    toggleButton.textContent = isBotActive ? 'Deactivate Bot' : 'Activate Bot';
    toggleButton.classList.toggle('active', isBotActive);
    debugLog(`Bot ${isBotActive ? 'activated' : 'deactivated'}`);
    
    if (isBotActive && currentPlayer === 'black' && !isProcessingMove) {
        debugLog('Triggering bot move after activation...');
        triggerBotMove();
    } else {
        debugLog(`Not triggering bot move after toggle. Current player: ${currentPlayer}, Processing move: ${isProcessingMove}`);
    }
}

// Implement bot move selection
function selectBotMove() {
    const allSquares = document.querySelectorAll('.square');
    const validMoves = [];

    allSquares.forEach(fromSquare => {
        if (isPieceOfCurrentPlayer(fromSquare.textContent)) {
            allSquares.forEach(toSquare => {
                if (isValidMove(fromSquare, toSquare)) {
                    validMoves.push({ from: fromSquare, to: toSquare });
                }
            });
        }
    });

    if (validMoves.length > 0) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    return null;
}

function triggerBotMove() {
    debugLog('triggerBotMove called');
    if (isProcessingMove) {
        debugLog('Already processing a move, skipping...');
        return;
    }
    if (!isBotActive || currentPlayer !== 'black') {
        debugLog(`Bot move cancelled. Active: ${isBotActive}, Current player: ${currentPlayer}`);
        return;
    }
    isProcessingMove = true;
    debugLog('Scheduling bot move...');
    setTimeout(() => {
        debugLog('Executing bot move...');
        makeBotMove();
        isProcessingMove = false;
    }, 500);
}

function makeBotMove() {
    debugLog(`makeBotMove called. Bot active: ${isBotActive}, Current player: ${currentPlayer}`);
    if (!isBotActive || currentPlayer !== 'black') {
        debugLog(`Bot move cancelled. Active: ${isBotActive}, Current player: ${currentPlayer}`);
        return;
    }

    debugLog('Bot is selecting a move...');
    const move = selectBotMove();
    if (move) {
        debugLog(`Bot moving from ${getSquareNotation(move.from)} to ${getSquareNotation(move.to)}`);
        movePiece(move.from, move.to);
    } else {
        debugLog("No valid moves for the bot");
        endGame('white');
    }
}



function getSquareNotation(square) {
    const col = String.fromCharCode('a'.charCodeAt(0) + getCol(square));
    const row = 8 - getRow(square);
    return `${col}${row}`;
}