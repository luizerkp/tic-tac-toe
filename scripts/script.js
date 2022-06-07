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
        if (!checkValidSelectionsValues(weaponSelection.value, difficultySelection.value)) {
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
    // let difficulty;

    let winner = null;

    // gameBoard is an array of 9 elements, each element is a string first dimension is row, second is column
    // i.e. gameBoard[0][0] is the top left corner of the board
    let gameBoard;


    const start = (chosenWeapon, chosenDifficulty) => {
        player.setPlayer(chosenWeapon);
        computer.setComputer((chosenWeapon === 'x') ? 'o' : 'x');
        // difficulty = chosenDifficulty;
        gameBoard = board.createBoard();
        addCellEvents();
    }

    const addCellEvents = () => {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', function() {
                
                if (checkGameOver() || winner !== null) {
                    alert('oOPS! someone already won game will be reset');
                    return window.location.reload();
                }
                if (cell.textContent !== '') {
                    return;
                }  

                let row = cell.getAttribute('data-row');
                let col = cell.getAttribute('data-col');

                player.playerTurn(row, col);
                winner = checkWinner.decideWinner(gameBoard);

                // allow the computer to make a move
                if (!checkGameOver() && winner === null) {
                    computer.computerTurn(gameBoard);
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

    const checkGameOver = () => {
        // check if all cells are filled
        if (gameBoard.every(row => row.every(column => column !== null))) { 
            return true;
        }
        return false;
    }


    const end = async () => {
        // wait .5 seconds before displaying the modal
        await new Promise(resolve => setTimeout(resolve, 500));
        // end game and declare winner
        const modal = document.querySelector('.modal');
        const playAgainBtn = document.querySelector('.playAgainBtn');
        
        let playAgainText = document.querySelector('.playAgainText');
    
        if (player.getPlayerMark() === this.winner) {
            playAgainText.textContent = "You Won!";
        }
        else if (computer.getComputerMark() === this.winner) {
            playAgainText.textContent = "You Lost!";
        }
        else {
            playAgainText.textContent = "It's a Tie!";
        }
    
        modal.classList.toggle("show-modal");
        
        playAgainBtn.addEventListener('click', () => {
            window.location.reload();
        }); 
    }

    return {
        start: start,
        updateBoard: updateBoard,
        checkGameOver: checkGameOver,
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
        // console.log(winningCells);
        const first = document.querySelector(`[data-row="${winningCells["first"][0]}"][data-col="${winningCells["first"][1]}"`);
        const second = document.querySelector(`[data-row="${winningCells["second"][0]}"][data-col="${winningCells["second"][1]}"`);
        const third = document.querySelector(`[data-row="${winningCells["third"][0]}"][data-col="${winningCells["third"][1]}"`);
        first.classList.add('winning-cell');
        second.classList.add('winning-cell');
        third.classList.add('winning-cell');
    }
    
    return {
        startDisplay: startDisplay,
        displayWinningCells: displayWinningCells,
    }
})();

// test
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
    return {
        setPlayer: setPlayer,
        playerTurn: playerTurn,
        getPlayerMark: getPlayerMark
    }

})();


var computer = (function() {
   let computerMove = null;
   let computerMark = null;
    // let difficulty; // easy, medium, hard, impossible

    const setComputer = (mark) => {
        computerMark = mark.toUpperCase();
    }

    const computerTurn = (currentBoard) => {
        // get computer move
        computerMove = getComputerMove(currentBoard);
        // display computer move
        displayComputerMove(computerMove);
    }

    const getComputerMove = (currentBoard) => {
        let row = Math.floor(Math.random() * 3);
        let col = Math.floor(Math.random() * 3);

        while (currentBoard[row][col] !== null) {
            row = Math.floor(Math.random() * 3);
            col = Math.floor(Math.random() * 3);
        }

        game.updateBoard(row, col, computerMark);

        return [row, col];
        
    }

    const displayComputerMove = (computerMove) => {
        const cell = document.querySelector(`[data-row="${computerMove[0]}"][data-col="${computerMove[1]}"]`);
        const para = document.createElement('p');
        para.textContent = computerMark;
        para.classList.add('computer-mark');
        cell.appendChild(para);
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
    
    const decideWinner = (currentBoard) => {
        // check for horizontal win
        checkHorizontalWin(currentBoard);

        // check for vertical win
        checkVerticalWin(currentBoard);
        
        // check for diagonal win
        checkDiagonalWin(currentBoard);
        
        // check for draw
        checkDraw(currentBoard);

        return winner;
        
    }

    // check for horizontal win
    const checkHorizontalWin = (currentBoard) => {   
        // i = row
        for (let i = 0; i < 3; i++) {
            if (currentBoard[i][0] === currentBoard[i][1] && currentBoard[i][1] === currentBoard[i][2]) {
                winner = currentBoard[i][0];

                let j = 0;
                while (j < 3) {
                    winningCells[cells[j]] = [i, j];
                    j++;
                }
            }
        }
    };

    // check for vertical win
    const checkVerticalWin = (currentBoard) => {
        // i = column   
        for (let i = 0; i < 3; i++) {
            if (currentBoard[0][i] === currentBoard[1][i] && currentBoard[1][i] === currentBoard[2][i]) {
                winner = currentBoard[0][i];

                let j = 0;
                while (j < 3) {
                    winningCells[cells[j]] = [j, i];
                    j++;
                }
            }
        }
    }

    // check for diagonal win
    const checkDiagonalWin = (currentBoard) => {
        if (currentBoard[0][0] === currentBoard[1][1] && currentBoard[1][1] === currentBoard[2][2]) {
            winner = currentBoard[0][0];

            let j = 0;
            while (j < 3) {
                winningCells[cells[j]] = [j, j];
                j++;
            }
        } 
        // check for diagonal win top right to bottom left
        else if (currentBoard[0][2] === currentBoard[1][1] && currentBoard[1][1] === currentBoard[2][0]) {
            winner = currentBoard[0][2];

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

    return {
        decideWinner: decideWinner,
        getWinningCells: getWinningCells
    }

})();



