// adds footer content to the page
var buildFooter = (function() {
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

// handles header content logic
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
        if (!validate.checkValidSelectionsValues(weaponSelection, difficultySelection)) {
            return window.location.reload();
        };

        displayController.startDisplay(weaponSelection, difficultySelection, startButton);

        return game.start(weaponSelection.value, difficultySelection.value);
    });

    resetButton.addEventListener('click', function() {
        location.reload();
    });

})();

// handles game events and keeps track of the game state
var game = (function (){
    let difficulty = null;
    let winner = null;

    // gameBoard is an array of 9 elements that represent the 9 boxes on the game board i.e. gameBoard[0] = top left box
    let gameBoard = null;
    const cells = document.querySelectorAll('.cell');

    const start = (chosenWeapon, chosenDifficulty) => {
        player.setPlayer(chosenWeapon);
        computer.setComputer((chosenWeapon === 'x') ? 'o' : 'x');
        gameBoard = board.createBoard();
        difficulty = chosenDifficulty;
        addCellEvents();
    }

    const addCellEvents = () => {
        cells.forEach(cell => {
            cell.addEventListener('click', function() {
                if (cell.textContent !== '') {
                    return;
                }

                let cellNumber = cell.getAttribute('data-cell');
                cellNumber = parseInt(cellNumber, 10);

                player.playerTurn(cellNumber);
                winner= checkWinner.decideWinner(gameBoard);       

                // lock click events on board while computer is making a move
                gameFlow.lockClick(cells);
     
                // allow the computer to make a move if a winner has not been decided
                if (winner === null) {
                    computer.computerTurn(gameBoard, difficulty);
                    winner = checkWinner.decideWinner(gameBoard);
                } 

                // if a winner has been decided, display the winner then display the play again modal
                if (winner !== null) {
                    if (winner !== 'tie') {
                        displayController.displayWinningCells();
                    } else {
                        displayController.displayTie();
                    }
                    end(winner);
                }
            });
        });
    }
    
    // unpdates the game board with the latest move
    const updateBoard = (number, mark) => {
        gameBoard[number] = mark;
    };

    // returns the cells NodeList representing all the cells on the game board
    const getCells = () => {
        return cells;
    };

    // handles displaying the winner or tie and the modal that asks the user if they want to play again
    const end = async (mark) => {
        // wait .7 seconds before displaying the modal
        await new Promise(resolve => setTimeout(resolve, 700));

        const modal = document.querySelector('.modal');
        const playAgainBtn = document.querySelector('.playAgainBtn');
        
        let playAgainText = document.querySelector('.playAgainText');
    
        if (player.getPlayerMark() === mark) {
            playAgainText.textContent = "You Won!";
        }
        else if (computer.getComputerMark() === mark) {
            playAgainText.textContent = "You Lost!";
        }
        else {
            playAgainText.textContent = "It's a Tie!";
        }
    
        modal.classList.add("show-modal");
        
        // triggers the cleanUp module to restart the game
        playAgainBtn.addEventListener('click', () => {
            modal.classList.remove("show-modal");
            return cleanUp.cleanUpBoard(player.getPlayerMark(), difficulty);
        }); 
    }

    return {
        start: start,
        updateBoard: updateBoard,
        getCells: getCells,
        getGameBoard: () => gameBoard
    };
})();

var board = (function() {
    let board = new Array(9).fill(null);

    const createBoard = () => {
        for (let i = 0; i < 9; i++) {
            board[i] = i;
        }
        return board;
    }

    return {
        createBoard: createBoard
    }
})();

// validates that a user has not change the values of the selections in devtools
var validate = (function() {
    // current selection values for #weapons and #difficulty-level
    const difficulties = ['easy', 'medium', 'hard', 'impossible'];
    const weapons = ['x', 'o'];
    let valid = true;

    // helper functions to check if a user has changed the selection values via devtools
    function checkValidSelectionsValues(weaponSelection, difficultySelection) {
        let selections = {
            weaponValue: weaponSelection.value.toLowerCase(),
            difficultyValue: difficultySelection.value.toLowerCase(),
            weaponText: weaponSelection.options[weaponSelection.selectedIndex].text.toLowerCase(),
            difficultyText: difficultySelection.options[difficultySelection.selectedIndex].text.toLowerCase()
        }

        checkSelectionValues(selections.weaponValue, selections.difficultyValue);
        checkSelectionText(selections);

        return valid;
    }

    const checkSelectionValues = (weaponSelectionValue, difficultySelectionValue) => {
        if (!difficulties.includes(difficultySelectionValue)){
            valid = false;
            alert("Please do not change selection values for difficulty level. This page will be reloaded");
        }
        if (!weapons.includes(weaponSelectionValue)) {
            valid = false;
            alert("Please do not change selection values for weapon. This page will be reloaded");
        }
    }

    const checkSelectionText = (selections) => {
        if (selections.weaponText !== selections.weaponValue) {
            valid = false;
            alert("Please do not change selection text for weapon. This page will be reloaded");
        }
        if (selections.difficultyText !== selections.difficultyValue) {
            valid = false;
            alert("Please do not change selection text for difficulty level. This page will be reloaded");
        }
    }

    return {
        checkValidSelectionsValues: checkValidSelectionsValues
    }
})();

var displayController = (function() {
    const board = document.querySelector('.board');
    const placeHolder = document.querySelector('#placeholder');
    const cells = game.getCells();
    
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
        const first = document.querySelector(`[data-cell="${winningCells["first"]}"]`);
        const second = document.querySelector(`[data-cell="${winningCells["second"]}"]`);
        const third = document.querySelector(`[data-cell="${winningCells["third"]}"]`);
        first.classList.add('winning-cell');
        second.classList.add('winning-cell');
        third.classList.add('winning-cell');
    }

    const displayTie = () => {
        cells.forEach(cell => {
            cell.classList.add('tie');
        });
    }

    const removeWinningCells = () => {
        cells.forEach((cell) => {
            cell.classList.remove('winning-cell');
            cell.classList.remove('tie');
        });
    }

    const getBoard = () => {
        return board;
    }
    
    return {
        startDisplay: startDisplay,
        displayWinningCells: displayWinningCells,
        displayTie: displayTie,
        removeWinningCells: removeWinningCells,
        getBoard: getBoard
    }
})();

var player = (function() {
    let playerMark = null;

    const setPlayer = (mark) => {
        playerMark = mark.toUpperCase();
    }

    const playerTurn = (number) => {
        const cell = document.querySelector(`[data-cell="${number}"]`);
        const para = document.createElement('p');
        para.textContent = playerMark;
        para.classList.add('player-mark');
        cell.appendChild(para);
        game.updateBoard(number, playerMark);
    }

    const getPlayerMark = () => {
        return playerMark;
    }

    return {
        setPlayer: setPlayer,
        playerTurn: playerTurn,
        getPlayerMark: getPlayerMark
    }
})();

var computer = (function() {
   let computerMove = null;
   let computerMark = null;

    const setComputer = (mark) => {
        computerMark = mark.toUpperCase();
    }

    const computerTurn = (currentBoard, difficulty) => {
        // get computer move
        computerMove = getComputerMove(currentBoard, difficulty);
    
        // display computer move
        displayComputerMove(computerMove);
    }

    const getComputerMove = (currentBoard, difficulty) => {
        let move = moves.getMove(currentBoard, difficulty, computerMark);
        game.updateBoard(move, computerMark);
        return move;
    }

    const displayComputerMove = async (computerMove) => {
        // wait .5 seconds before displaying the modal
        await new Promise(resolve => setTimeout(resolve, 500));

        // display computer move
        const cell = document.querySelector(`[data-cell="${computerMove}"]`);
        const para = document.createElement('p');
        para.textContent = computerMark;
        para.classList.add('computer-mark');
        cell.appendChild(para);
        gameFlow.unlockClick();
    }

    const getComputerMark = () => {
        return computerMark;
    }

    return {
        computerTurn: computerTurn,
        setComputer: setComputer,
        getComputerMark: getComputerMark
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

    const winningHorizontalCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8]
    ];

    const winningVerticalCombos = [
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8]
    ];
    
    const decideWinner = (currentBoard) => {
        for (let i = 0; i < 3; i++) {
            // loads the current row
            let horizontal = [currentBoard[winningHorizontalCombos[i][0]], currentBoard[winningHorizontalCombos[i][1]], currentBoard[winningHorizontalCombos[i][2]]];

            // checks if anyone has won horizontally
            let horizontalWin= horizontal.every(function(value) { return value === horizontal[0] ? true : false; });

            // loads the current column
            let vertical = [currentBoard[winningVerticalCombos[i][0]], currentBoard[winningVerticalCombos[i][1]], currentBoard[winningVerticalCombos[i][2]]]; 

            // checks if anyone has won vertically
            let verticalWin = vertical.every(function(value) { return value === vertical[0] ? true : false; });

            if (horizontalWin === true) {
                winner = horizontal[0];
                winningCells.first = winningHorizontalCombos[i][0];
                winningCells.second = winningHorizontalCombos[i][1];
                winningCells.third = winningHorizontalCombos[i][2];
            };

            if (verticalWin === true) {
                winner = vertical[0];
                winningCells.first = winningVerticalCombos[i][0];
                winningCells.second = winningVerticalCombos[i][1];
                winningCells.third = winningVerticalCombos[i][2];
            } 
        }   
 
        // loads top left to bottom right diagonal
        let diagonalTopLeftBottomRight = [currentBoard[0], currentBoard[4], currentBoard[8]];

        // checks if anyone has won top left to bottom right diagonal
        let diagonalTopLeftBottomRightWin = diagonalTopLeftBottomRight.every(function(value) { return value === diagonalTopLeftBottomRight[0] ? true : false; });

        // loads top right to bottom left diagonal
        let diagonalTopRightBottomLeft = [currentBoard[2], currentBoard[4], currentBoard[6]];

        // checks if anyone has won top right to bottom left diagonal
        let diagonalTopRightBottomLeftWin = diagonalTopRightBottomLeft.every(function(value) { return value === diagonalTopRightBottomLeft[0] ? true : false; });

        if (diagonalTopLeftBottomRightWin === true) {
            winner = diagonalTopLeftBottomRight[0];

            // top left to bottom right = [0, 4, 8]
            winningCells.first = 0;
            winningCells.second = 4;
            winningCells.third = 8;
        };

        if (diagonalTopRightBottomLeftWin === true) {
            winner = diagonalTopRightBottomLeft[0];

            // top right to bottom left = [2, 4, 6]
            winningCells.first = 2;
            winningCells.second = 4;
            winningCells.third = 6;
        };

        // only check for draw if no winner has been found
        if (winner === null) {
            checkDraw(currentBoard);
        }

        return winner;
    }
        
    // check for draw
    const checkDraw = (currentBoard) => {
        // draw = game is over and no winner
        if (currentBoard.every(function(value) { return typeof(value) === "string" ? true : false; })) {
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

// clears the board while keeping selected options
var cleanUp = (function() {
    const cleanUpBoard = (mark, level) => {
        cleanUpGameFlow();
        cleanUpWinningCells();
        cleanUpCheckWinner();
        game.start(mark.toLowerCase(), level);
    }

    const cleanUpCheckWinner = () => {
        checkWinner.resetCheckWinner();
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
})();

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

// handles the how the ai will make its move depending on the difficulty level
var moves = (function() {
    const getMove = (currentBoard, difficulty, mark) => {
        let move = moveHandler(currentBoard, difficulty, mark);
        return move;
    }

    const getRandomMove = (currentBoard) => {
        let cell = Math.floor(Math.random() * 9);

        while (typeof(currentBoard[cell]) !== "number") {
            cell = Math.floor(Math.random() * 9);
        }
        return cell;
    }

    const getBestMove = (currentBoard, mark) => {
        let move = aiLogic.getMinimaxMove(currentBoard, mark);
        return move;
    }

    const moveHandler = (currentBoard, difficulty, mark) => {
        let bestMove = getBestMove(currentBoard, mark);
        let randomMove = getRandomMove(currentBoard);

        let moves = {
            bestMove: bestMove,
            randomMove: randomMove
        }
        
        // store move based on difficulty
        let move;

        // chose move based on difficulty
        switch (difficulty) {
            // easy = random move
            case "easy":
                move = moves.randomMove;
                break;
            case "medium":
                // in medium difficulty the AI will have a ~70% chance of choosing the best move
                 move = Math.random() < 0.7 ? moves.bestMove : moves.randomMove;
                break;
            case "hard":
                // in hard difficulty the AI will have a ~90% chance to choose the best move
                move = Math.random() < 0.9 ? moves.bestMove : moves.randomMove;
                break;
            case "impossible":             
                // in impossible difficulty the AI will always choose the best move
                move = moves.bestMove;
                break;
            default:
                move = moves.randomMove;
        }

        return move;
    }

    return {
        getMove: getMove,
    }
})();

// handles minimax algorithm
var aiLogic = (function() {
    let humanPlayer = null;
    let computerPlayer = null;

    const getMinimaxMove = (currentBoard, mark) => {
        humanPlayer= player.getPlayerMark();
        computerPlayer = computer.getComputerMark();
        let minimaxMove = minimax(currentBoard, mark);
        return minimaxMove["index"];
    }

    const minimax = (newBoard, currentPlayer) => {
        // stores all available spots
        let possibleMoves = getEmptySpots(newBoard);

        // checks if a winner or tie exists
        let winner = checkWinner.decideWinner(newBoard);

        //store the best move object
        let bestMove = {};

        // checks for the terminal states such as win, lose, and tie and returning a value accordingly
        if (winner === humanPlayer) {           
            return {score:-10};
        } else if (winner === computerPlayer) {
                return {score:10};
        } else if (possibleMoves.length === 0 || winner === 'tie') {
            return {score: 0};
        }

        // store all the move objects in an array
        let moves = [];

        // loop through available empty spots
        for (let i = 0; i < possibleMoves.length; i++){
            //create an object for each move 
            let move = {};

            // store in each move's index property the 'data-cell' location aka the idx on the board array of the current empty spot
            move.index = newBoard[possibleMoves[i]];

            // set the empty spot to the current player
            newBoard[possibleMoves[i]] = currentPlayer;

            // if it is the computer's turn, run the minimax algorithm using humanPlayer as the current player
            // otherwise run it using the computerPlayer
            if (currentPlayer == computerPlayer){
                let result = minimax(newBoard, humanPlayer);
                move.score = result.score;
            }
            else{
                let result = minimax(newBoard, computerPlayer);
                move.score = result.score;
            }

            //reset the current spot to empty on the board array
            newBoard[possibleMoves[i]] = move.index;
            
            // reset checkWinner to default to avoid declaring a winner during the minimax algorithm
            checkWinner.resetCheckWinner();

            // push the object to the array
            moves.push(move);
        }
        
        bestMove = getBestMove(moves, currentPlayer);
        
        return bestMove;
    }

    const getEmptySpots = (board) => {
        return board.filter(spot => typeof spot === "number");
    }

    const getBestMove = (moves, mark) => {
        let bestMove;
        let bestScore;

        // if the mark is the computer's mark, get the highest score
        // otherwise get the lowest score
        if(mark === computerPlayer) {
            bestScore = Number.NEGATIVE_INFINITY;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            bestScore = Number.POSITIVE_INFINITY;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            };
        }

        return moves[bestMove];
    }

    return {
        getMinimaxMove: getMinimaxMove
    }
})();