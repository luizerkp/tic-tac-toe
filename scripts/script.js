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
            return location.reload();
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
    let winner = "";
    let gameBoard;


    const start = (chosenWeapon, chosenDifficulty) => {
        console.log(chosenWeapon, chosenDifficulty);
        player.setPlayer(chosenWeapon);
        computer.setComputer((chosenWeapon === 'x') ? 'o' : 'x');
        // difficulty = chosenDifficulty;
        gameBoard = board.createBoard();
        // computer.setComputerMark(computer);
        addCellEvents();
        console.log(gameBoard);
    }

    const addCellEvents = () => {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', function() {
                if (checkGameOver()) {
                    console.log('game over');
                    return;
                }
                if (cell.textContent !== '') {
                    console.log(checkGameOver());
                    return;
                }  

                let row = cell.getAttribute('data-row');
                let col = cell.getAttribute('data-col');

                player.playerTurn(row, col);


                // check game status
                // checkWinnerHorizontally();
                // checkWinnerVertically();
                // checkWinnerDiagonally();
                // checkDraw();
            
            

                // allow the computer to make a move
                if (!checkGameOver()) {
                    computer.computerTurn(gameBoard);
                }
            });
        });
    }
    
    const updateBoard = (row, col, mark) => {
        gameBoard[row][col] = mark;
        console.log(gameBoard);
    };

    const checkGameOver = () => {
        if (gameBoard.every(row => row.every(column => column !== null))) { 
            console.log('draw');
            return true;
        }
        return false;
    }


    // checkWinnerHorizontally = () => {
    //     // check for horizontal win
    // }
    
    // checkWinnerVertically = () => {
    //     // check for vertical win
    // }

    // checkWinnerDiagonally = () => {
    //     // check for diagonal win
    // }

    // checkDraw = () => {
    //     // check for draw
    // }

    // end = () => {
    //     // end game and declare winner
    // }

    return {
        start: start,
        updateBoard: updateBoard
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
    return {
        startDisplay: startDisplay
    }
})();

// test
var player = (function() {
    let playerMark;

    const setPlayer = (playerMark) => {
        this.playerMark = playerMark.toUpperCase();
    }

    const playerTurn = (row, col) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const para = document.createElement('p');
        console.log(this.playerMark);
        para.textContent = this.playerMark;
        para.classList.add('player-mark');
        cell.appendChild(para);
        game.updateBoard(row, col, this.playerMark);
    }
    return {
        setPlayer: setPlayer,
        playerTurn: playerTurn
    }

})();


var computer = (function() {
   let computerMove;
   let computerMark;
    // let difficulty; // easy, medium, hard, impossible

    const setComputer = (computerMark) => {
        this.computerMark = computerMark.toUpperCase();
        console.log(this.computerMark);
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
        para.textContent = this.computerMark;
        para.classList.add('computer-mark');
        cell.appendChild(para);
    }
    return {
        computerTurn: computerTurn,
        setComputer: setComputer
    };
})();



