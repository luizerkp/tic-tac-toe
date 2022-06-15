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
                cellNumber = parseInt(cellNumber);

                player.playerTurn(cellNumber);
                winner= checkWinner.decideWinner(gameBoard, player.getPlayerMark());       

                // lock click events on board while computer is making a move
                gameFlow.lockClick(cells);
                // console.log(winner);
                // allow the computer to make a move
                if (winner === null) {
                    computer.computerTurn(gameBoard, difficulty);
                    winner = checkWinner.decideWinner(gameBoard, computer.getComputerMark());
                } 

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
    
    const updateBoard = (number, mark) => {
        gameBoard[number] = mark;
        // console.log(gameBoard);
    };

    const getCells = () => {
        return cells;
    };

    const end = async (mark) => {
        // wait .7 seconds before displaying the modal
        await new Promise(resolve => setTimeout(resolve, 700));

        // console.log(mark);
        // end game and declare winner
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
        resetGame: resetGame,
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
        // console.log(`Player ${playerMark} has chosen cell ${number}`);
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
        // console.log(`Computer move: ${move[0]}, ${move[1]}`);
        // console.log(computerMark);
        game.updateBoard(move, computerMark);
        return move;
    }

    const displayComputerMove = async (computerMove) => {
        // console.log(`Computer move: ${computerMove}`);
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
    
    const decideWinner = (currentBoard, currentPlayer) => {
        // console.log(currentBoard);
        for (let i = 0; i < 3; i++) {

            // loads the current row
            let horizontal = [currentBoard[winningHorizontalCombos[i][0]], currentBoard[winningHorizontalCombos[i][1]], currentBoard[winningHorizontalCombos[i][2]]];

            // checks if player has won horizontally
            let horizontalWin= horizontal.every(function(value) { return value === currentPlayer ? true : false; });

            // loads the current column
            let vertical = [currentBoard[winningVerticalCombos[i][0]], currentBoard[winningVerticalCombos[i][1]], currentBoard[winningVerticalCombos[i][2]]]; 

            // checks if player has won vertically
            let verticalWin = vertical.every(function(value) { return value === currentPlayer ? true : false; });

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

        // checks if player has won top left to bottom right diagonal
        let diagonalTopLeftBottomRightWin = diagonalTopLeftBottomRight.every(function(value) { return value === currentPlayer ? true : false; });

        // loads top right to bottom left diagonal
        let diagonalTopRightBottomLeft = [currentBoard[2], currentBoard[4], currentBoard[6]];

        // checks if player has won top right to bottom left diagonal
        let diagonalTopRightBottomLeftWin = diagonalTopRightBottomLeft.every(function(value) { return value === currentPlayer ? true : false; });

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

        // console.log(`Winner: ${this.winner}`);
        return winner;
    }
        
    // check for draw
    const checkDraw = (currentBoard) => {
        // draw = game is not over and no winner
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

var cleanUp = (function() {
    // clears the board while keeping selected options
    const cleanUpBoard = (mark, level) => {
        cleanUpGameFlow();
        cleanUpWinningCells();
        cleanUpCheckWinner();
        cleanUpComputer();
        cleanUpPlayer();
        cleanUpGame();
        cleanUpAiLogic();
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

    const cleanUpAiLogic = () => {
        aiLogic.resetAiLogic();
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
        let cell = Math.floor(Math.random() * 9);

        while (typeof(currentBoard[cell]) !== "number") {
            cell = Math.floor(Math.random() * 9);
        }
        return cell;
    }

    const getImpossibleMove = (currentBoard, mark) => {
        let move = aiLogic.getMinimaxMove(currentBoard, mark);
        // console.log(move);
        return move;
    }


    return {
        getEasyMove: getEasyMove,
        getImpossibleMove: getImpossibleMove
    }
})();

var aiLogic = (function() {
    let humanPlayer = null;
    let computerPlayer = null;

    const getMinimaxMove = (currentBoard, mark) => {
        humanPlayer= player.getPlayerMark();
        computerPlayer = computer.getComputerMark();
        let minimaxMove = minimax(currentBoard, mark);
        console.log(minimaxMove);
        return minimaxMove["index"];
    }

    const minimax = (newBoard, currentPlayer) => {
          //available spots
        let possibleMoves = emptySpots(newBoard);
        let winner = checkWinner.decideWinner(newBoard, currentPlayer);
        let bestMove = {};
        // console.log(newBoard);
        // console.log(winner);
        // checks for the terminal states such as win, lose, and tie and returning a value accordingly
        if (winner === "tie" || possibleMoves.length === 0) {
            return {score: 0};
        }
        else if (winner !== null) {
            if (winner === computerPlayer){
                return {score:10};
            }
            else{
                return {score:-10};
            }
        }

        // an array to collect all the objects
        let moves = [];

        // loop through available spots
        for (let i = 0; i < possibleMoves.length; i++){
            //create an object for each and store the index of that spot that was stored as a number in the object's index key
            var move = {};
            move.index = newBoard[possibleMoves[i]];

            // set the empty spot to the current player
            newBoard[possibleMoves[i]] = currentPlayer;

            //if collect the score resulted from calling minimax on the opponent of the current player
            if (currentPlayer == computerPlayer){
                var result = minimax(newBoard, humanPlayer);
                move.score = result.score;
            }
            else{
                var result = minimax(newBoard, computerPlayer);
                move.score = result.score;
            }

            //reset the spot to empty
            newBoard[possibleMoves[i]] = move.index;
            checkWinner.resetCheckWinner();
            // push the object to the array
            moves.push(move);
        }
        // console.log(moves);
        // return the chosen move (object) from the array to the higher depth
        bestMove = getBestMove(moves, currentPlayer);
        
        // console.log(bestMove);
        return bestMove;
    }

    const emptySpots = (board) => {
        return board.filter(spot => typeof spot === "number");
    }

    const getBestMove = (moves, mark) => {
        // console.log(moves);
        // get the best move
        let bestMove;
        // console.log(mark === computer.getComputerMark())
        if(mark === computerPlayer) {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            };
        }
        // console.log(moves[bestMove]);
        return moves[bestMove];
    }
    const resetAiLogic = () => {
        humanPlayer = null;
        computerPlayer = null;
    }
    return {
        resetAiLogic: resetAiLogic,
        getMinimaxMove: getMinimaxMove
    }

})();