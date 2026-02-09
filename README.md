# tetrisGame
Tetris Game Engine (JavaScript) This project implements a Tetris game using a custom tick-based engine.
The game separates horizontal input, rotation, gravity, and locking into controlled update phases to prevent diagonal or phantom movement. A lock-delay system allows limited player adjustment before gravity forces a drop. The board includes a hidden spawn buffer above the visible playfield to safely handle piece entry and collision validation. State guards are used to control piece lifecycle, ensuring deterministic behavior across movement, locking, row clearing, and spawning.

1. Diagonal / Phantom Movement Bug
Symptoms
    • Pressing left or right caused the piece to slide diagonally
    • Pieces sometimes clipped into cemented blocks
    • Pieces could “drag” against blocks and settle one row lower than expected
Root Cause
    • Horizontal movement and gravity were applied in the same tick
    • dx and dy were mutated before collision checks were fully validated
    • When dx and dy occurred together, diagonal movement was unintentionally allowed
Solution
    • Introduced a boolean movedHorizontally
    • If movedHorizontally === true, downward movement is skipped for that tick
    • movedHorizontally is reset to false at the start of the next tick
This enforces one axis of movement per tick, eliminating diagonal drift.

2. TypeError: Board Out-of-Bounds Access
Symptoms
    • TypeError when assigning 1, 0, or color strings to board[row][col]
    • Occurred when row was negative
Root Cause
    • Tetrimino logic attempted to write to board positions above the visible playfield
    • Board bounds were not strict enough
Solution
    • Applied stricter bounds checking on board access
    • Increased board size from 200 → 250 cells
    • Hid the first 50 rows to simulate pieces entering from above the board
This prevents invalid array access while preserving proper spawn behaviour.

3. Left / Right / Rotate Delay Locking Issue
Goal
    • Allow the player a limited number of movements or rotations
    • Gravity should eventually force the piece downward even if inputs continue
Problem
    • Immediate locking or delayed gravity felt wrong
Solution
    • Introduced ticksToLock (default = 6)
Logic
    • Horizontal movement or rotation decrements ticksToLock
    • If no movement or rotation occurs, or if leftRightRotateNowLocked === true:
        ◦ ticksToLock resets to 6
        ◦ leftRightRotateNowLocked = false
    • If ticksToLock <= 0:
        ◦ leftRightRotateNowLocked = true
        ◦ Gravity or lockPiece() is allowed to occur
This creates a grace window where players can adjust pieces, but not indefinitely stall gravity.

4. Hard Drop / Soft Drop Speed Reset Bug
Symptoms
    • Drop speed failed to reset correctly after releasing keys
Initial (Incorrect) Logic
if (!hardDropPressed || !softDropPressed) speed = 500;
Root Cause
    • OR condition was always true when either key wasn’t pressed
Correct Solution
if (!hardDropPressed && !softDropPressed) speed = 500;
Both keys must be released before resetting speed.
Once fixed, hard and soft drop behaved correctly.
