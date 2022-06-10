var buildFooter = (function() {
    // adds footer content to the page
    const footer = document.querySelector('.footer');
    const footerPara_1 = document.createElement('p');
    const footerPara_2 = document.createElement('p');
    const a = document.createElement('a');
    a.href = "https://github.com/luizerkp";
    const githubLogo = document.createElement('img');
    githubLogo.src="imgs/GitHubMarkSmall.png"
    a.appendChild(githubLogo)
    a.setAttribute('id', 'github-log');
    const date = new Date().getFullYear();
    footerPara_1.textContent = `Copyright © ${date} Luis Tamarez`
    footerPara_2.textContent = "All Rights Reserved";
    footer.appendChild(footerPara_1);
    footer.appendChild(a);
    footer.appendChild(footerPara_2);
})();

var Selections = (function() {
    const startButton = document.querySelector('#start');
    const resetButton = document.querySelector('#reset-button');

    startButton.addEventListener('click', function() {
        const weaponSelection = document.querySelector('#weapons');
        const difficultySelection = document.querySelector('#difficulty-level');

        // if not all selections are made, alert the user
        if (weaponSelection.value === 'disabled' || difficultySelection.value === 'disabled') {
            return alert('Please select a weapon and difficulty level');
        }

        // if user changes the selection values using devtools, reload the page
        if (!validate.checkValidSelectionsValues(weaponSelection.value, difficultySelection.value)) {
            return window.location.reload();
        };

        displayController.startDisplay(weaponSelection, difficultySelection, startButton);

        return game.start(weaponSelection.value, difficultySelection.value);
    });

    resetButton.addEventListener('click', function() {
        location.reload();
    });

})();

var game = (function (){
    let difficulty = null;
    let winner = null;

    // gameBoard is an array of 9 elements, each element is a string first dimension is row, second is column
    // i.e. gameBoard[0][0] is the top left corner of the board
    let gameBoard;
    const cells = document.querySelectorAll('.cell');

    const start = (chosenWeapon, chosenDifficulty) => {
        player.setPlayer(chosenWeapon);
        computer.setComputer((chosenWeapon === 'x') ? 'o' : 'x');
        difficulty = chosenDifficulty;
        gameBoard = board.createBoard();
        addCellEvents();
    }

    const addCellEvents = () => {
        cells.forEach(cell => {
            cell.addEventListener('click', function() {
                
                if (cell.textContent !== '') {
                    return;
                }  

                let row = cell.getAttribute('data-row');
                let col = cell.getAttribute('data-col');

                player.playerTurn(row, col);
                winner = checkWinner.decideWinner(gameBoard);

                // lock click events on board while computer is making a move
                gameFlow.lockClick(cells);

                // allow the computer to make a move
                if (winner === null) {
                    computer.computerTurn(gameBoard, difficulty);
                    winner = checkWinner.decideWinner(gameBoard);
                }

                if (winner !== null) {
                    if (winner !== "tie") {
                        displayController.displayWinningCells();
                    }
                    end();
                }

            });
        });
    }
    
    const updateBoard = (row, col, mark) => {
        gameBoard[row][col] = mark;
    };

    const getCells = () => {
        return cells;
    };

    const checkGameOver = () => {
        // check if all cells are filled
        if (gameBoard.every(row => row.every(column => column !== null))) { 
            return true;
        }
        return false;
    }

    const end = async () => {
        // wait .7 seconds before displaying the modal
        await new Promise(resolve => setTimeout(resolve, 700));
        // end game and declare winner
        const modal = document.querySelector('.modal');
        const playAgainBtn = document.querySelector('.playAgainBtn');
        
        let playAgainText = document.querySelector('.playAgainText');
    
        if (player.getPlayerMark() === winner) {
            playAgainText.textContent = "You Won!";
        }
        else if (computer.getComputerMark() === winner) {
            playAgainText.textContent = "You Lost!";
        }
        else {
            playAgainText.textContent = "It's a Tie!";
        }
    
        modal.classList.add("show-modal");
        
        playAgainBtn.addEventListener('click', () => {
            modal.classList.remove("show-modal");
            return cleanUp.cleanUpBoard(player.getPlayerMark());
        }); 
    }

    const resetGame = () => {
        // reset game
        winner = null;
        gameBoard = null;
    }

    return {
        start: start,
        updateBoard: updateBoard,
        getCells: getCells,
        checkGameOver: checkGameOver,
        resetGame: resetGame
    };
})();

var board = (function() {
    let board = new Array(3).fill(null);

    const createBoard = () => {
        for (let i = 0; i < 3; i++) {
            board[i] = new Array(3).fill(null);
        }
        return board;
    }

    return {
        createBoard: createBoard
    }
})();

var validate = (function() {
    // helper functions to check if user has changed the selection values via devtools
    function checkValidSelectionsValues(weaponScelectionValue, difficultySelectionValue) {
        let valid = true;
        
        weaponScelectionValue = weaponScelectionValue.toLowerCase();
        difficultySelectionValue = difficultySelectionValue.toLowerCase();

        // current selection values for #weapons and #difficulty-level
        const difficulties = ['easy', 'medium', 'hard', 'impossible'];
        const weapons = ['x', 'o'];
        
        if (!difficulties.includes(difficultySelectionValue)){
            valid = false;
            alert("Please do not change selection values for difficulty level. This page will be reloaded");
        } else if (!weapons.includes(weaponScelectionValue)) {
            valid = false;
            alert("Please do not change selection values for weapon. This page will be reloaded");
        }

        return valid;
    }
    return {
        checkValidSelectionsValues: checkValidSelectionsValues
    }
})();

var displayController = (function() {
    const board = document.querySelector('.board');
    const placeHolder = document.querySelector('#placeholder');
    
    const startDisplay = (weaponSelection, difficultySelection, startButton) => {
        displayBoard();
        lockSelections(weaponSelection, difficultySelection, startButton);
    }

    const displayBoard = () => {
        board.classList.toggle('inactive');
        placeHolder.classList.toggle('inactive');
    }

    const lockSelections = (weaponSelection, difficultySelection, startButton) => {
        weaponSelection.disabled = true;
        difficultySelection.disabled = true;
        startButton.disabled = true;
    }
    const displayWinningCells = () => {
        const winningCells = checkWinner.getWinningCells();
        const first = document.querySelector(`[data-row="${winningCells["first"][0]}"][data-col="${winningCells["first"][1]}"`);
        const second = document.querySelector(`[data-row="${winningCells["second"][0]}"][data-col="${winningCells["second"][1]}"`);
        const third = document.querySelector(`[data-row="${winningCells["third"][0]}"][data-col="${winningCells["third"][1]}"`);
        first.classList.add('winning-cell');
        second.classList.add('winning-cell');
        third.classList.add('winning-cell');
    }

    const removeWinningCells = () => {
        const winningCells = document.querySelectorAll('.winning-cell');
        winningCells.forEach((cell) => {
            cell.classList.remove('winning-cell');
        });
    }

    const getBoard = () => {
        return board;
    }
    
    return {
        startDisplay: startDisplay,
        displayWinningCells: displayWinningCells,
        removeWinningCells: removeWinningCells,
        getBoard: getBoard
    }
})();

var player = (function() {
    let playerMark = null;

    const setPlayer = (mark) => {
        playerMark = mark.toUpperCase();
    }

    const playerTurn = (row, col) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const para = document.createElement('p');
        para.textContent = playerMark;
        para.classList.add('player-mark');
        cell.appendChild(para);
        game.updateBoard(row, col, playerMark);
    }

    const getPlayerMark = () => {
        return playerMark;
    }

    const resetPlayer = () => {
        playerMark = null;
    }
    return {
        setPlayer: setPlayer,
        playerTurn: playerTurn,
        getPlayerMark: getPlayerMark,
        resetPlayer: resetPlayer
    }
})();

var computer = (function() {
   let computerMove = null;
   let computerMark = null;
    // let difficulty; // easy, medium, hard, impossible

    const setComputer = (mark) => {
        computerMark = mark.toUpperCase();
    }

    const computerTurn = (currentBoard, difficulty) => {
        // get computer move
        computerMove = getComputerMove(currentBoard, difficulty);
        
        // return;
        // display computer move
        displayComputerMove(computerMove);
    }

    const getComputerMove = (currentBoard, difficulty) => {
        let move = null;
        switch (difficulty) {
            case 'easy':
                move = moves.getEasyMove(currentBoard);
                break;
            // case 'medium':
            //     move = moves.getMediumMove(currentBoard);
            //     break;
            // case 'hard':
            //     move = moves.getHardMove(currentBoard);
            //     break;
            case 'impossible':
                move = moves.getImpossibleMove(currentBoard, computerMark);
                break;
            default:
                move = moves.getEasyMove(currentBoard);
                break;
        }

        // move[0] = row, move[1] = col
        console.log(`Computer move: ${move[0]}, ${move[1]}`);
        console.log(computerMark);
        game.updateBoard(move[0], move[1], computerMark);
        return move;
    }

    const displayComputerMove = async (computerMove) => {
        // wait .5 seconds before displaying the modal
        await new Promise(resolve => setTimeout(resolve, 500));

        // display computer move
        const cell = document.querySelector(`[data-row="${computerMove[0]}"][data-col="${computerMove[1]}"]`);
        const para = document.createElement('p');
        para.textContent = computerMark;
        para.classList.add('computer-mark');
        cell.appendChild(para);
        gameFlow.unlockClick();
    }

    const getComputerMark = () => {
        return computerMark;
    }

    const resetComputer = () => {
        computerMove = null;
        computerMark = null;
    }

    return {
        computerTurn: computerTurn,
        setComputer: setComputer,
        getComputerMark: getComputerMark,
        resetComputer: resetComputer
    };
})();

var checkWinner = (function() {
    let winner = null;
    const cells = ["first", "second" , "third"];
    let winningCells = {
        first: null,
        second: null,
        third: null,
    }
    
    const decideWinner = (currentBoard) => {
        for (let i = 0; i < 3; i++) {
            // loads the current row
            let horizontal = [currentBoard[i][0], currentBoard[i][1], currentBoard[i][2]];

            // checks if current row is a potential winner
            let possibleHorizontalWin= horizontal.every(function(value) { return value !== null ? true : false; });

            // loads the current column
            let vertical = [currentBoard[0][i], currentBoard[1][i], currentBoard[2][i]];

            // checks if current column is a potential winner
            let possibleVerticalWin = vertical.every(function(value) { return value !== null ? true : false; });

            // i = 0 => first row
            if (possibleHorizontalWin === true) {
                // check for horizontal win
                checkHorizontalWin(horizontal, i);
            };

            // i = 0 => first column
            if (possibleVerticalWin === true) {
                // check for vertical win
                checkVerticalWin(vertical, i);
            } 
        }   
 
        // check for a possbile diagonal win top left to bottom right
        let diagonalTopLeftBottomRight = [currentBoard[0][0], currentBoard[1][1], currentBoard[2][2]];
        let possibleDiagonalTopLeftBottomRightWin = diagonalTopLeftBottomRight.every(function(value) { return value !== null ? true : false; });

        // check for a possbile diagonal win top right to bottom left
        let diagonalTopRightBottomLeft = [currentBoard[0][2], currentBoard[1][1], currentBoard[2][0]];
        let possibleDiagonalTopRightBottomLeftWin = diagonalTopRightBottomLeft.every(function(value) { return value !== null ? true : false; });

        if (possibleDiagonalTopLeftBottomRightWin === true) {
            checkDiagonalWinTopLeftToBottomRight(diagonalTopLeftBottomRight);
        };

        if (possibleDiagonalTopRightBottomLeftWin === true) {
            checkDiagonalWinTopRightToBottomLeft(diagonalTopRightBottomLeft);
        };
        
        // check for draw
        checkDraw(currentBoard);

        return winner;
        
    }

    // check for horizontal win
    const checkHorizontalWin = (horizontalWin, row) => {   
        if (horizontalWin[0] === horizontalWin[1] && horizontalWin[1] === horizontalWin[2]) {
            winner = horizontalWin[0];

            // populate winning cells 
            let j = 0;

            while (j < 3) {
                winningCells[cells[j]] = [row, j];
                j++;
            }
        }

    };

    // check for vertical win
    const checkVerticalWin = (verticalWin, col) => {
        if (verticalWin[0] === verticalWin[1] && verticalWin[1] === verticalWin[2]) {
            winner = verticalWin[0];

            let j = 0;
            while (j < 3) {
                winningCells[cells[j]] = [j, col];
                j++;
            }
        }
    
    }

    // check for diagonal win
    const checkDiagonalWinTopLeftToBottomRight = (diagonalWin) => {
        if (diagonalWin[0] === diagonalWin[1] && diagonalWin[1] === diagonalWin[2]) {
            winner = diagonalWin[0];

            let j = 0;

            while (j < 3) {
                winningCells[cells[j]] = [j, j];
                j++;
            }
        } 
    }

    const checkDiagonalWinTopRightToBottomLeft = (diagonalWin) => {
        if (diagonalWin[0] === diagonalWin[1] && diagonalWin[1] === diagonalWin[2]) {
            winner = diagonalWin[0];

            let j = 0;

            while (j < 3) {
                winningCells[cells[j]]= [j, (2 - j)];
                j++;
            }
        } 
    }

    // check for draw
    const checkDraw = () => {
        // draw = game is not over and no winner
        if (game.checkGameOver() && winner === null) {
            winner = 'tie';
        }
    }

    const getWinningCells = () => {
        return winningCells;
    }

    const resetCheckWinner = () => {
        winningCells = {
            first: null,
            second: null,
            third: null,
        }

        winner = null;
    }

    return {
        decideWinner: decideWinner,
        getWinningCells: getWinningCells,
        resetCheckWinner: resetCheckWinner
    }
})();

var cleanUp = (function() {
    // clears the board while keeping selected options
    const cleanUpBoard = (mark, level) => {
        cleanUpGameFlow();
        cleanUpWinningCells();
        cleanUpCheckWinner();
        cleanUpComputer();
        cleanUpPlayer();
        cleanUpGame();
        game.start(mark.toLowerCase(), level);
    }

    const cleanUpCheckWinner = () => {
        checkWinner.resetCheckWinner();
    }

    const cleanUpComputer = () => {
        computer.resetComputer();
    }

    const cleanUpPlayer = () => {
        player.resetPlayer();
    }

    const cleanUpGame = () => {
        game.resetGame();
    }

    const cleanUpGameFlow = () => {
        gameFlow.gameFlowReset();
    }
        
    const cleanUpWinningCells = () => {
        displayController.removeWinningCells();
    }

    return {
        cleanUpBoard: cleanUpBoard
    }
})()

// locks out clicks on the board while computer is making a move or while winner is being decided
var gameFlow = (function() {
    const cells = game.getCells();
    const board = displayController.getBoard();
    // locks out clicks on the board while computer is making a move
    const lockClick = () => {
        board.classList.add("wait");
        cells.forEach((cell) => {
            cell.classList.add('locked');

        });
    }

    // unlocks clicks on the board after computer has made a move
    const unlockClick = () => { 
        cells.forEach((cell) => {
            cell.classList.remove('locked');
        });
        board.classList.remove("wait");
    }

    const gameFlowReset = () => {
        cells.forEach((cell) => {
            cell.classList.remove('locked');
            cell.innerHTML = "";
        });
        board.classList.remove("wait");
    }

    return {
        lockClick: lockClick,
        unlockClick: unlockClick,
        gameFlowReset: gameFlowReset
    }
})();

var moves = (function() {

    const getEasyMove = (currentBoard) => {
        let row = Math.floor(Math.random() * 3);
        let col = Math.floor(Math.random() * 3);

        while (currentBoard[row][col] !== null) {
            row = Math.floor(Math.random() * 3);
            col = Math.floor(Math.random() * 3);
        }
        return [row, col];
    }

    const getImpossibleMove = (currentBoard, mark) => {
        let move = minimax.getMinimaxMove(currentBoard, mark);
        console.log(move);
        return move;
    }


    return {
        getEasyMove: getEasyMove,
        getImpossibleMove: getImpossibleMove
    }
})()

var minimax = (function() {
    
    const getMinimaxMove = (currentBoard, mark) => {    
        let humanPlayer = player.getPlayerMark();
        let computerPlayer = computer.getComputerMark();
        let bestMove = null;
        let availableMoves = getMoves(currentBoard);
        console.log(availableMoves);

        let winner = checkWinner.decideWinner(currentBoard) 
        // console.log(winner === humanPlayer);
        if (winner === humanPlayer) {
            return {score: -10};
        } else if (winner === computerPlayer) {
            return {score: 10};
        } else if (availableMoves.length === 0) {
            return {score: 0};
        }
        let moves = [];
        availableMoves.forEach((availabelMove) => {
            let move = {};
            move.row = availabelMove[0];
            move.col = availabelMove[1];
            currentBoard[move.row][move.col] = player;
            if (mark === computerPlayer) {
                let result = getMinimaxMove(currentBoard, humanPlayer);
                move.score = result.score;
            } else {
                let result = getMinimaxMove(currentBoard, computerPlayer);
                move.score = result.score;
            }
            currentBoard[move.row][move.col] = null;
            moves.push(move);
        });

        bestMove = getBestMove(moves, mark);
        console.log(bestMove);
        return bestMove;
    }
    
    const getMoves = (currentBoard) => {
        // get all available moves
        let moves = [];

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (currentBoard[i][j] === null) {
                    moves.push([i, j]);
                }
            }
        }

        console.log("moves: " + moves);
        return moves;
    }
    
    const getBestMove = (moves, mark) => {
        // get the best move
        let bestMove = null;
        if(mark === computer.getComputerMark()) {
            let bestScore = -Infinity;
            moves.forEach((move) => {
                if (move.score > bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            });
        } else {
            let bestScore = Infinity;
            moves.forEach((move) => {
                if (move.score < bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            });
        }
        return bestMove;
    }

    return {
        getMinimaxMove: getMinimaxMove
    }
})()
