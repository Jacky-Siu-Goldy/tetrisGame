/*MENTAL MODEL — GRID GAME (TETRIS)

RULE #1: THREE SEPARATE LAYERS (DO NOT MIX)

1) INPUT (INTENT)
   - Keyboard events only set flags (left, right, rotate, drop)
   - Input NEVER moves the piece directly
   - Flags are consumed once per tick

2) PHYSICS / RULES (PURE LOGIC)
   - Collision checks only answer:
       "If the piece were here, would it be illegal?"
   - No DOM access
   - No key states
   - No timers
   - Uses only:
       - board[][]
       - current piece shape
       - dx, dy

   Examples:
     canMove(dx, dy)
     canRotate(testShape)

3) STATE MUTATION (COMMIT)
   - Apply exactly ONE legal action per tick
   - Order:
       a) Horizontal move (if input)
       b) Gravity
       c) Lock piece
   - Clear input flags after use

4) VIEW (DOM)
   - DOM is paint only
   - board + piece coords are the source of truth
   - DOM never influences logic

MANTRA:
Input asks → Physics answers → State commits → View paints
*/

//create the amount of div required inside the grid
 for(var i = 0; i < 250; i++){
 $(".container").append("<div></div>");
 }

 //create the id required for each div inside the grid
    $(".container > div").addClass("unit");
    for(var i = 0; i < 25; i++){
        for(var y = 0; y < 10; y++){
            $(".unit").eq((i*10 + y)).attr('id', ("row" + i +"col"+ y));

        }
    }
//hide the part of the grid you don't want shown
    for(var i =  0; i < 5; i++){
        for(var y = 0; y < 10; y ++){
            $("#row" + i + "col" + y).hide();
        }
    }
const cols = 10;
//event handler that console.log the id of the part of the grid you clicked on
$('.unit').on('click', function() {
    const index = $(this).index();
    
    const row = Math.floor(index/cols);

    const col = index % cols;

    console.log("row: " + row + " col: " + col + '\n' +$(this).attr('id'));
})

//object for the color of the tetrimino
const Color ={
        YELLOW: "yellow",
        GREEN: "green",
        ORANGE: "orange",
        BLUE: "blue",
        PURPLE: "purple",
        RED: "red",
        TURQUOISE: "turquoise",
        BLACK:"black"
    };

//board array required for tetris to work filled with zero at the beginning
const board = Array.from({length:25}, () => Array(10).fill(0));
//board array reponsible for the colors, required for tetris to work filled with the name of the color which is black at the beginning 
const board2 = Array.from({length:25}, () => Array(10).fill(Color.BLACK));

//matrices for the tetriminoes
tetrimino ={ 
    I:[
       [0,0,0,0],
       [1,1,1,1],
       [0,0,0,0],
       [0,0,0,0]
      ],
    J:[
        [1,0,0],
        [1,1,1],
        [0,0,0]
        
      ],
    L:[
        [0,0,1],
        [1,1,1],
        [0,0,0]
      ],
    S:[
        [0,1,1],
        [1,1,0],
        [0,0,0]
      ],
    Z:[
        [1,1,0],
        [0,1,1],
        [0,0,0]
      ],
    O:[
        [1,1],
        [1,1]

      ],
    T:[
        [0,1,0],
        [1,1,1],
        [0,0,0]
      ]

}

// rotate the tetrimino counter clockwise by rotating it clockwise 3 times
function returnRotatedCCWTetrimino(tetriminoRandom){
    return returnRotatedCWTetrimino(returnRotatedCWTetrimino(returnRotatedCWTetrimino(tetriminoRandom)));
}

//rotate the tetrimino clockwise
function returnRotatedCWTetrimino(tetriminoRandom){
    const length = tetriminoRandom.length;
    const result = [];

        for(let c = 0; c < length; c++){
            result[c] = [];
            for(let r = length -1; r >= 0; r--){
                result[c].push(tetriminoRandom[r][c]);
            }
        }
        return result;
}

//check if the rotation is legal
function rotateLegalCheck(result){
    var rotationLegal = true;
    for(let r = 0; r < result.length; r++){ 
        for(let c = 0; c < result[r].length; c++){
                const y = r + dy;
                const x = c + dx;
            if(result[r][c] === 1){
                if (x < 0 || x > 9){
                    rotationLegal = false;
                }else if ( y < 0 || y > 24){
                    rotationLegal = false;
                }else if (board[y][x] === 1){
                    rotationLegal = false;
                }
            }
        }

    }
    console.log("rotateLegalCheck accessed:" + rotationLegal);
    return rotationLegal;
}

//set tetriminoRandom array to equal a random piece of terimino
function getTetriminoRandom(){
    const randomInt = Math.floor(Math.random() * 7) + 1;
    console.log(randomInt);
    switch(randomInt){
        case 1:
            tetriminoRandom = tetrimino.I;
            color = Color.BLUE;
            break;
        case 2:
            tetriminoRandom = tetrimino.J;
            color = Color.RED;
            break
        case 3:
            tetriminoRandom = tetrimino.L;
            color = Color.GREEN;
            break;
        case 4:
            tetriminoRandom = tetrimino.S;
            color = Color.ORANGE;
            break;
        case 5:
            tetriminoRandom = tetrimino.Z;
            color = Color.YELLOW;
            break;
        case 6:
            tetriminoRandom = tetrimino.O;
            color = Color.PURPLE;
            break;
        case 7:
            tetriminoRandom = tetrimino.T;
            color = Color.TURQUOISE;
            break;
        default:
            console.log("tetriminoRandom() error")
    }
}
//************************************************************************************************************************** */
const WIDTH = 10;

//return an emptyRow which is filled with  0
function emptyRow(){
    return Array(WIDTH).fill(0);
}

//return an emptyRow for color which is black
function emptyRow2(){
    return Array(WIDTH).fill(Color.BLACK);
}

//clear Completed rows
function clearRow(){
    let cleared = 0;

    for(let r = board.length - 1; r >= 0; r--){
        if(board[r].every(cell => cell !== 0)){
            board.splice(r , 1);
            board2.splice(r , 1);
            cleared++;
        }
    }
    calculateScore(cleared);
    while (cleared > 0){
        board.unshift(emptyRow());
        board2.unshift(emptyRow2());
        cleared--;
    }
    pieceActive = false;
}
//Completely clear the board removing any record previously there
function renewedBoard(){
    let cleared = 0;

    for(let r = board.length - 1; r >=0; r--){
        board.splice(r, 1);
        board2.splice(r, 1);
        cleared++
    }

    while(cleared > 0){
        board.unshift(emptyRow());
        board2.unshift(emptyRow2());
        cleared--
    }
    pieceActive = false;
}
//fill the visual representation of the board with the right information color, 1s and 0s
function refreshDrawBoard(){
      for(let r = 0; r < board.length; r++){
        for(let c = 0; c < board[r].length; c++){
            if(board[r][c] === 1){
                var color2 = board2[r][c];
                 $('#row' + r + 'col' + c).css('background-color', color2);
                 $('#row' + r + 'col' + c).text('1');
            }else{
                $('#row'+ r + 'col' + c).css('background-color','black');
                $('#row' + r + 'col' + c).text('0');
            }
        }
      }
}
//************************************************************************************************************************** */
//object for creating a lockPiece responsible for representing a unit making up a tetrimino piece, color , column and row
class LockPiece{
     constructor(row,col ,color){
        this.row = row;
        this.col = col;
        this.color = color;
     }   

     getRow(){
        return this.row;
     }

     getCol(){
        return this.col;
     }
     
     getColor(){
        return this.color;
     }
     setRow(row){
        this.row = row;
     }

     setCol(col){
        this.col = col;
     }
}
// color: Type Color eg: Color.BLACK
var color;
//tetriminoRandom: array responsible for recording the shape and it's orientation
var tetriminoRandom = [];

// lockPieceArray: array resposible for recording the shape and it's position, orientation when it's being locked
var lockPieceArray = [];

//dy: y displacement on the board
var dy = 0;

//dx: x displacement on the board
var dx = 3;

//dxLeft: set to true when "a" is pressed and false immediately afterward
var dxLeft = false;

//dxRight: set to true when "d" is pressed and false immediately afterward
var dxRight = false;

//rotateCWIntend: set to true when "n" is pressed and false immediately afterward
var rotateCWIntend = false;

//rotateCCWIntend: set to true when "m" is pressed and false immediately afterward
var rotateCCWIntend = false;
var score = 0;

// speed: the number for setTimeOut(function(), speed); responsible for game loop timing
var speed = 500;

// hardDropPressed: if true quickly drop the piece into place and locked
var hardDropPressed = false; 

// softDropPressed: if true slowly drop the piece faster than natural speed
var softDropPressed = false;  
//initializing the visual representation of the board with the text 0 indicating an empty unit and setting the text color white
for (let r = 0; r < board.length; r++){
    for(let c = 0; c < board[r].length; c++){
        $('#row' + r + 'col' + c).text('0');
        $('#row' + r + 'col' + c).css('color', 'white');
    }
}
// renewBoard: if true it means the boards need to be renewed 
var renewBoard = true;
// movedHorizontally: tetrimino can only move down if it hasn't rotated and movedHorizontally
var movedHorizontally = false;
//rotated: tetrimino can only move down if it hasn't rotated and movedHorizontally
var rotated = false;
//leftRightRotateNowLocked: Can not go left or right or rotate while true
var leftRightRotateNowLocked = false
//ticksToLock: depending on the number of ticks currently, if it's at or below zero leftRightRotateNowLocked will be true
var ticksToLock = 6;

//startGame: true if Start Game button or Restart Game Button is pressed
var startGame = false;
//calculating the score depending on the number of rows cleared
function calculateScore(total){
  switch(total){
    case 0:
        break;
    case 1:
        score = score + 100;
        break;
    case 2:
        score = score + 300;
        break;
    case 3:
        score = score + 500;
        break;
    case 4:
        score = score + 800;
        break;
    default:
        console.log("calculateScore(total) accessed Error");
        break;
  }
  $("p").text("Score: " + score);
}
$("p").text("Score: " + score);

//gameLocked: lock game before startgame button is pressed or when Game Over happens
var gameLocked = true;

//pieceActive: temporary guard; engine should work without this once timing is fully deterministic
var pieceActive = false;

//running: always set to true
let running = true;

//gameLoop() responsible for running the game engine
function gameloop(){
    if(!running) return;
    generatingTetrimino();
    setTimeout(gameloop, speed);
}


/**
 * Main game engine tick.
 * 
 * Runs once per interval:
 * - Clears the previous frame
 * - Applies player input (left/right/rotate/drop)
 * - Applies gravity
 * - Checks collisions and bounds
 * - Locks piece when it can no longer move
 * - Spawns next tetrimino when needed
 * - Triggers line clear and game over checks
 */
function generatingTetrimino(){
  
    if (startGame && !gameLocked && !pieceActive){
        if(renewBoard){
            score = 0;
           $("button").text("Restart Game");
            renewedBoard();
            refreshDrawBoard();
            $("p").text("Score: " + score);
            renewBoard = false;
            playtheme();
       } 
        dx = 3;
        dy =0;
        speed = 500;
        hardDropPressed = false;
        getTetriminoRandom();
        pieceActive = true;
    }   
    
       
    erasePiece();
     movedHorizontally = false;
     rotated = false;
        if (rotateCCWIntend && rotateCWIntend){
            rotateCCWIntend = false;
            rotateCWIntend = false;
        }
        if (rotateCWIntend && !leftRightRotateNowLocked){
            const rotatedTetrimino = returnRotatedCWTetrimino(tetriminoRandom);
           if(rotateLegalCheck(rotatedTetrimino)){
            tetriminoRandom = rotatedTetrimino;
            speed = 450;
            rotateCWIntend= false;
            rotated = true;
            --ticksToLock
           }
        }else if (rotateCCWIntend &&!leftRightRotateNowLocked){
            const rotatedTetrimino = returnRotatedCCWTetrimino(tetriminoRandom);
            if(rotateLegalCheck(rotatedTetrimino)){
                tetriminoRandom = rotatedTetrimino;
                speed = 450;
                rotateCCWIntend= false;
                rotated = true;
            }
            --ticksToLock
        } 
        
        if(dxLeft && dxRight){
            dxLeft = false;
            dxRight = false;
        }
        if (canMove(-1,0)&& dxLeft && !leftRightRotateNowLocked){
            dx--
            speed = 50;
            dxLeft = false;
            
            movedHorizontally = true;
            --ticksToLock
        }else if ( canMove(1,0) && dxRight && !leftRightRotateNowLocked){
            dx++
            speed = 50;
            dxRight = false;
            movedHorizontally = true;
            --ticksToLock
        }
        var downCollision = canMove(0,1);
           
        if( (!rotated && !movedHorizontally || leftRightRotateNowLocked) && !gameLocked){
           
           
            if(downCollision){
                
                if(!hardDropPressed && !softDropPressed) speed = 500;
                
                dy++;
            }else{
                lockPiece();
                clearRow();
                refreshDrawBoard();
                
                 
            }
                 gameOver();
              ticksToLock = 6;
               leftRightRotateNowLocked = false;
        }else{

            if (ticksToLock <= 0){
                console.log("ticksToLock <= 0 Accessed");
              leftRightRotateNowLocked = true; 
              
            }
        }
    
    
        drawPiece();
    
   
}


document.addEventListener("keydown", function(event){
     keyDownEvent(event.key);
});

document.addEventListener("keyup", function (event){
    keyUpEvent(event.key);
});

function keyUpEvent(key){
    switch (key){
        case "h":
            
            break;
        case "s":
            softDropPressed = false;
            break;
        default:
            console.log("keyUpEvent(key) accessed something might have gone wrong.");
    }
}


gameloop();

function keyDownEvent(key){
    switch (key){
        case "h":
            hardDropPressed = true;
            speed = 20;
            break;
        case "s":
            softDropPressed = true;
            speed = 90;
            console.log("keyDownEvent(key) softDropPressed accessed");
            break;
         case "a":
            
            changeDxToTheLeft();
            break;
        case "d":
            
            changeDxToTheRight();
            break;
        case"m":
            
            setRotateCWIntend();
            break;
        case"n":
            
            setRotateCCWIntend();
            break;
        default:
            console.log("keydownEvent(key) accessed something might have gone wrong.");
        break;
    }
}

//Start Game or Restart Game Button
$("button").click(function(){ $("#gameOver").css("display","none"); startGame = true; renewBoard = true; gameLocked = false; pieceActive = false;})
function keyEvent(key){
    switch (key){
       
        case "a":
            
            changeDxToTheLeft();
            break;
        case "d":
            
            changeDxToTheRight();
            break;
        case"m":
            
            setRotateCWIntend();
            break;
        case"n":
            
            setRotateCCWIntend();
            break;
        default:
            console.log("Didn't Work: " + key);
            break;
    }
}

function setRotateCCWIntend(){
    rotateCCWIntend = true;

}
function setRotateCWIntend(){
    rotateCWIntend = true;

}
function changeDxToTheLeft(){ 
  dxLeft = true;          
        
}

function changeDxToTheRight(){
    dxRight = true;          
    
}

//unify collision detection by using displacement in the x direction or in the y direction as the determinant of how this function would respond
function canMove(dx,dy){

    if (dx === -1){
        return leftCollisionDetect() ;
    }else if (dx === 1){
        return rightCollisionDetect() ;
    }else if (dy === 1){
        return downCollisionDetect();
    }
}
//leftCollisionDetect(): detect wall to the left or blocks to the left
function leftCollisionDetect(){
    var leftCollision = false;
    for(let r = 0; r < tetriminoRandom.length; r++){
            for(let c = 0; c< tetriminoRandom[r].length; c++){
                if(tetriminoRandom[r][c] === 1){
                        const row = dy + r;
                        const col = dx + c;
                        
                        if( col -1 < 0){
                            leftCollision = true;
                        } else if(board[row][col - 1] === 1){
                            leftCollision = true;   
                        }
                }
                    
                
            }
        }
    return !leftCollision;
}

//rightCollisionDetect(): detect wall to the right or blocks to the right 
function rightCollisionDetect(){
  
    
    var rightCollision = false;
     for(let r = 0; r < tetriminoRandom.length; r++){
        for(let c = 0; c < tetriminoRandom[r].length; c++){
            if(tetriminoRandom[r][c] === 1){ 
                const row = dy + r;
                const col = dx + c;
                
                if(col + 1 > 9){
                    rightCollision = true

                }else if (board[row][col+1] === 1 ){
                     rightCollision = true;
                }
            }
        } 
    }
    return !rightCollision
}

//downCollisionDetect(): detect floor or block in the downward position
function downCollisionDetect(){
    var canMoveDown = true;
    for(let r = 0; r < tetriminoRandom.length; r++){
        for(let c = 0; c< tetriminoRandom[r].length; c++){
            if(tetriminoRandom[r][c] === 1){
                const row = dy + r;
                const col = dx + c;    
               
                if (row + 1 > 24    ){

                   canMoveDown = false;
                    
                }else if(board[row + 1][col] === 1){
                     
                   canMoveDown = false;
                   
                }
            }
        }
    }
    return canMoveDown;
}


//drawPiece(): draw the piece at where it's currently at
function drawPiece(){
    lockPieceArray =[];
    for(let r = 0; r < tetriminoRandom.length; r++){
        for(let c = 0; c< tetriminoRandom[r].length; c++){
            if(tetriminoRandom[r][c] === 1){
                const y = dy + r;
                const x = dx + c;

                if (y >=0){
                    
                    $('#row'+y+'col'+x).css('background-color', color);
                    
                    var lockPiece2 =  new LockPiece(y,x, color);
                    lockPieceArray.push(lockPiece2);
                    
                }
                

            }
        }
    }
    
}
//lockPiece(): Create the visual representation of the locked piece and update the 2 boards
function lockPiece(){
    lockPieceArray.forEach(element =>{
                    var y = element.getRow();
                    var x = element.getCol();
                    board[y][x] = 1;
                    board2[y][x] = color;
                     $('#row' + y + 'col' + x).css('background-color', color);
                     $('#row' + y + 'col' + x).text('1');
                    console.log(board[y][x] + " x:" + x + " y:" + y);
                    
                   })
                   
                   pieceActive = false;
                   dy = 0;
                   
}

//erasePiece() erase the spot where the piece has been by painting it black
function erasePiece(){
    
    for(let r = 0; r < tetriminoRandom.length; r++){
        for(let c= 0; c < tetriminoRandom[r].length; c++){
            if(tetriminoRandom[r][c] === 1){
                const y = dy + r;
                const x = dx + c;
                if (y >= 0 ){
                    
                      $('#row' + y + 'col' + x).css('background-color', Color.BLACK);
                        
                }

            }
        }
       
    }
   
}

function gameOver(){
    for(let c = 0; c < board[4].length; c++){
        if(board[4][c] === 1){
             startGame = false;
             gameLocked = true;
             pieceActive = false;
            
        }
    }
   if(gameLocked){
     $("#gameOver").css("display", "flex");
     stopTheme();
   }
}

function playtheme(){
    const videoId ="HS5M1gm0KH0&t=81s"
    const src =
        "https://www.youtube.com/embed/" + videoId +
        "?autoplay=1&loop&playlist=" + videoId;
    $("#tetrisThemeYT").attr("src", src);
}

function stopTheme(){
    $("#tetrisThemeYT").attr("src", "");
}
 

   

