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

        lockSelections(weaponSelection, difficultySelection, startButton);
        displayBoard();

        return Game.start(weaponSelection.value, difficultySelection.value);
    });

    resetButton.addEventListener('click', function() {
        location.reload();
    });

})();

var Game = (function (){
    let player;
    let computer;
    let difficulty;
    
    let winner = "";
    let gameBoard = [];
    let gameOver = false;

    start = (chosenWeapon, chosenDifficulty) => {
        console.log(chosenWeapon, chosenDifficulty);
        player = chosenWeapon;
        computer = (chosenWeapon === 'x') ? 'o' : 'x';
        difficulty = chosenDifficulty;
        addCellEvents();
      
    }

    addCellEvents = () => {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', function() {
                if (gameOver) {
                    return;
                }
                if (cell.textContent !== '') {
                    return;
                }
                const para = document.createElement('p');
                para.textContent = player.toUpperCase();
                para.classList.add('player-mark');
                cell.appendChild(para);
                // convert data to int for array index
                // let row = parseInt(cell.getAttribute('data-row'));
                // let col = parseInt(cell.getAttribute('data-col'));
                // gameBoard[row][col].push(player);
                // console.log(gameBoard);

                // check game status
                // checkWinnerHorizontally();
                // checkWinnerVertically();
                // checkWinnerDiagonally();
                // checkDraw();

                // allow the computer to make a move
                // if (!gameOver) {
                //     computerTurn();
                // }
            });
        });
    }


    checkWinnerHorizontally = () => {
        // check for horizontal win
    }
    
    checkWinnerVertically = () => {
        // check for vertical win
    }

    checkWinnerDiagonally = () => {
        // check for diagonal win
    }

    checkDraw = () => {
        // check for draw
    }

    end = () => {
        // end game and declare winner
    }

    return {
        start: start,
    }

})();

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

function displayBoard () {
    const board = document.querySelector('.board');
    const placeHolder = document.querySelector('#placeholder');
    board.classList.toggle('inactive');
    placeHolder.classList.toggle('inactive');
}

function lockSelections(weaponSelection, difficultySelection, startButton) {
    weaponSelection.disabled = true;
    difficultySelection.disabled = true;
    startButton.disabled = true;
}


