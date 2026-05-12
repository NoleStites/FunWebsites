// Global Variables
let has_won = false;        // Used by the onClick listener to not let user interact with game after finishing
let flags_toggled = false;
let hidden_cells = [];      // A list of string coords: x,y
let revealed_cells = [];    // A list of string coords: x,y
let rows = 0;
let cols = 0;
let num_bombs = 0;
let num_flags = 0;
let correct_flags = 0;      // The number of flags correctly placed (on a bomb)
let cell_size = 0;
let border_size = 0;
let border_spacing = "Xpx";
let chance_for_bomb = 0;

// Color Theme Variables
let color1 = "grey"; // rgb(128,,)
let color2 = "lightgrey"; // rgb(211,,)
let color3 = "rgb(200, 200, 200)";
let color4 = "rgb(148, 148, 148)"; // Cell background color
let color5 = "rgb(168, 168, 168)";
let color6 = "white" // For flag slider
let accent_color = "red";
let flag = `url("number_textures/flag.png")`;
let flag_transparent = `url("number_textures/flag_transparent.png")`;
let flag_prev = `url("number_textures/flag_blue.png")`;
let flag_transparent_prev = `url("number_textures/flag_transparent_blue.png")`;

// Will apply the colors currently assigned in the "Color Theme Variables" to the webpage
function applyColorMode() {
    // Color 1
    let table = document.getElementById("mine_table");
    table.style.borderColor = color1;
    table.style.backgroundColor = color1;

    let toggle = document.getElementById("flag_toggle");
    if (flags_toggled) {
        toggle.style.backgroundColor = accent_color;
        
        for (let i = 0; i < hidden_cells.length; i++) {
            let cell = document.getElementById(hidden_cells[i]);
            let cell_back = cell.style.backgroundImage;
            if (cell_back === flag_transparent_prev) {
                cell.style.backgroundImage = flag_transparent;
            } else {
                cell.style.backgroundImage = flag;
            }
        }
    } else {
        toggle.style.backgroundColor = color2;

        for (let i = 0; i < hidden_cells.length; i++) {
            let cell = document.getElementById(hidden_cells[i]);
            let cell_back = cell.style.backgroundImage;
            if (cell_back === flag_prev) {
                cell.style.backgroundImage = flag;
            }
        }
    }

    // Color 2
    document.getElementById("game_flex").style.backgroundColor = color2;

    // Color 3
    for (let i = 0; i < hidden_cells.length; i++) {
        let cell = document.getElementById(hidden_cells[i]);
        cell.style.borderColor = color3;
        cell.style.backgroundColor = color4;
    }
    for (let i = 0; i < revealed_cells.length; i++) {
        let cell = document.getElementById(revealed_cells[i]);
        cell.style.backgroundColor = color3;
    }

    // Color 5
    document.getElementById("counter_bar").style.backgroundColor = color5;
    document.getElementById("flag_box").style.backgroundColor = color5;

    // Color 6
    document.getElementById("toggle_circle").style.backgroundColor = color6;

    const color_buttons = document.querySelectorAll(`.color_mode`);
    color_buttons.forEach((element) => {
        element.style.backgroundColor = color6;
    });
    
    // Accent Color
    document.getElementById("counter_value").style.color = accent_color;
    document.getElementById("play_again").style.boxShadow = `0px 0px 3px 3px ${accent_color}`;

    // Flag Color
    document.getElementById("flag_icon").style.backgroundImage = flag;
}

// Light mode
function applyPreset1() {
    let c1_grey_val = 128; // Only need to adjust this value and all other grey values will stay proportional to it

    color1 = `rgb(${c1_grey_val}, ${c1_grey_val}, ${c1_grey_val})`;
    color2 = `rgb(${c1_grey_val+83}, ${c1_grey_val+83}, ${c1_grey_val+83})`;
    color3 = `rgb(${c1_grey_val+72}, ${c1_grey_val+72}, ${c1_grey_val+72})`;
    color4 = `rgb(${c1_grey_val+20}, ${c1_grey_val+20}, ${c1_grey_val+20})`;
    color5 = `rgb(${c1_grey_val+40}, ${c1_grey_val+40}, ${c1_grey_val+40})`;
    color6 = `rgb(${c1_grey_val+127}, ${c1_grey_val+127}, ${c1_grey_val+127})`;
    accent_color = "red";
    flag_prev = flag;
    flag_transparent_prev = flag_transparent;
    flag = `url("number_textures/flag.png")`;
    flag_transparent = `url("number_textures/flag_transparent.png")`;

    applyColorMode();
}

// Dark mode
function applyPreset2() {
    let c1_grey_val = 0; // Only need to adjust this value and all other grey values will stay proportional to it

    color1 = `rgb(${c1_grey_val}, ${c1_grey_val}, ${c1_grey_val})`;
    color2 = `rgb(${c1_grey_val+83}, ${c1_grey_val+83}, ${c1_grey_val+83})`;
    color3 = `rgb(${c1_grey_val+72}, ${c1_grey_val+72}, ${c1_grey_val+72})`;
    color4 = `rgb(${c1_grey_val+20}, ${c1_grey_val+20}, ${c1_grey_val+20})`;
    color5 = `rgb(${c1_grey_val+40}, ${c1_grey_val+40}, ${c1_grey_val+40})`;
    color6 = `rgb(${c1_grey_val+127}, ${c1_grey_val+127}, ${c1_grey_val+127})`;
    accent_color = "blue";
    flag_prev = flag;
    flag_transparent_prev = flag_transparent;
    flag = `url("number_textures/flag_blue.png")`;
    flag_transparent = `url("number_textures/flag_transparent_blue.png")`;

    applyColorMode();
}

// HELPER FUNCTION: called by generateNewGame()
// Given a cell size, returns the number of rows and columns that can fit in the game area
function calc_num_rows_and_cols(texture_dimension) {
    let grid = document.getElementById("grid");
    const gridWidth = grid.offsetWidth;
    const gridHeight = grid.offsetHeight;

    let num_rows = Math.floor(gridHeight / texture_dimension);
    let num_columns = Math.floor(gridWidth / texture_dimension);

    return {'columns':num_columns, 'rows':num_rows};
}

// HELPER FUNCTION: called by createTable()
// This function assigns the proper number to each cell surrounding a bomb, leaving the rest empty
function assignNumbersToCells() {
    let bombs = document.getElementsByClassName("bombs");
    let greatest_cell_value = 0;
    for (let i = 0; i < bombs.length; i++) {
        let curr_bomb = bombs[i];
        let bomb_coords = curr_bomb.id.split(',');
        let bomb_x = Number(bomb_coords[0]);
        let bomb_y = Number(bomb_coords[1]);

        // Find top-left and bottom-right corners of surrounding square of bomb to be incremented
        let top_left = [0,0];
        if (bomb_x > 0) {
            top_left[0] = bomb_x - 1;
        }
        if (bomb_y > 0) {
            top_left[1] = bomb_y - 1;
        }

        let bottom_right = [bomb_x, bomb_y]; // Default is farthest corner; if less, will be changed
        if (bomb_x < rows-1) {
            bottom_right[0] = bomb_x + 1;
        }
        if (bomb_y < cols-1) {
            bottom_right[1] = bomb_y + 1;
        }

        // Loop over square formed by the top_left and bottom_right coords
        for (let x = top_left[0]; x < bottom_right[0]+1; x++) {
            for (let y = top_left[1]; y < bottom_right[1]+1; y++) {
                let curr_cell = document.getElementById(`${x},${y}`);
                
                let classification = curr_cell.classList[1]; // either "bombs" or "n0-4"
                if (classification === "bombs") {
                    continue; // No value to increment for bomb cells
                }
                
                // Increment value of (class name)
                let new_value = Number(classification.split('n')[1]) + 1;
                curr_cell.classList.remove(classification);
                curr_cell.classList.add(`n${new_value}`);

                // Update greatest cell value
                if (new_value > greatest_cell_value) {
                    greatest_cell_value = new_value;
                }
            }
        }
    }
}

// HELPER FUNCTION: called by propagateFromCell()
// Returns the right cell if it is empty
function getAdjacentRight(cell_obj) {
    let cell_coords = cell_obj.id.split(',');
    let cell_x = Number(cell_coords[0]);
    let cell_y = Number(cell_coords[1]);

    let right = [cell_x, cell_y];
    if (cell_y < cols-1) {
        right[1] = cell_y + 1;
    } else {
        return null; // No cell to right
    }

    // Check that right cell is empty
    let right_cell = document.getElementById(`${right[0]},${right[1]}`);
    if (right_cell.classList[1] !== "n0") {
        return null;
    }

    return right_cell;
}

// HELPER FUNCTION: called by propagateFromCell()
// Returns the down cell if it is empty
function getAdjacentDown(cell_obj) {
    let cell_coords = cell_obj.id.split(',');
    let cell_x = Number(cell_coords[0]);
    let cell_y = Number(cell_coords[1]);

    let down = [cell_x, cell_y];
    if (cell_x < rows-1) {
        down[0] = cell_x + 1;
    } else {
        return null; // No cell to down
    }

    // Check that down cell is empty
    let down_cell = document.getElementById(`${down[0]},${down[1]}`);
    if (down_cell.classList[1] !== "n0") {
        return null;
    }

    return down_cell;
}

// HELPER FUNCTION: called by propagateFromCell()
// Returns the up cell if it is empty
function getAdjacentUp(cell_obj) {
    let cell_coords = cell_obj.id.split(',');
    let cell_x = Number(cell_coords[0]);
    let cell_y = Number(cell_coords[1]);

    let up = [cell_x, cell_y];
    if (cell_x > 0) {
        up[0] = cell_x - 1;
    } else {
        return null; // No cell to up
    }

    // Check that up cell is empty
    let up_cell = document.getElementById(`${up[0]},${up[1]}`);
    if (up_cell.classList[1] !== "n0") {
        return null;
    }

    return up_cell;
}

// HELPER FUNCTION: called by propagateFromCell()
// Returns the left cell if it is empty
function getAdjacentLeft(cell_obj) {
    let cell_coords = cell_obj.id.split(',');
    let cell_x = Number(cell_coords[0]);
    let cell_y = Number(cell_coords[1]);

    let left = [cell_x, cell_y];
    if (cell_y > 0) {
        left[1] = cell_y - 1;
    } else {
        return null; // No cell to left
    }

    // Check that left cell is empty
    let left_cell = document.getElementById(`${left[0]},${left[1]}`);
    if (left_cell.classList[1] !== "n0") {
        return null;
    }

    return left_cell;
}

// HELPER FUNCTION: called by createTable()
// Will assign a given group number to this cell and all cells in the same section via recursion
function propagateFromCell(cell, group_num) {
    // Assign the group to the given cell
    cell.classList.add(`group_${group_num}`);

    // Cycle from up, right, down, left and assign group to them
    let up_cell = getAdjacentUp(cell);
    if ((up_cell !== null) && (up_cell.classList[up_cell.classList.length-1].split('_')[0] !== "group")) { // Is empty and not in a group
        propagateFromCell(up_cell, group_num);
    }

    let right_cell = getAdjacentRight(cell);
    if ((right_cell !== null) && (right_cell.classList[right_cell.classList.length-1].split('_')[0] !== "group")) {
        propagateFromCell(right_cell, group_num);
    }

    let down_cell = getAdjacentDown(cell);
    if ((down_cell !== null) && (down_cell.classList[down_cell.classList.length-1].split('_')[0] !== "group")) {
        propagateFromCell(down_cell, group_num);
    }

    let left_cell = getAdjacentLeft(cell);
    if ((left_cell !== null) && (left_cell.classList[left_cell.classList.length-1].split('_')[0] !== "group")) {
        propagateFromCell(left_cell, group_num);
    }
}

// This function creates a new table with the new game state
function createTable() {
    let box = document.getElementById("grid");

    // Create a new table element
    let table = document.createElement("table");
    table.id = "mine_table";
    table.style.borderSpacing = `${border_spacing}px`;
    table.style.borderColor = color1;

    // Create cells in table and assign bombs
    num_bombs = 0;
    correct_flags = 0;
    hidden_cells = [];
    revealed_cells = [];
    for (let i = 0; i < rows; i++) {
        let new_row = document.createElement("tr");
        for (let j = 0; j < cols; j++) {
            let new_cell = document.createElement("td");
            new_cell.classList.add("cells");
            new_cell.id = `${i},${j}`; // Every table cell is given a coordinate for future reference
            hidden_cells.push(`${i},${j}`);
            new_cell.style.width = `${cell_size}px`;
            new_cell.style.height = `${cell_size}px`;
            new_cell.style.minWidth = `${cell_size}px`;
            new_cell.style.minHeight = `${cell_size}px`;
            new_cell.style.border = `${border_size}px outset ${color3}`;
            new_cell.style.backgroundColor = color4;
            if (Math.random() < chance_for_bomb) { // Math.random returns value 0 to 1
                new_cell.classList.add("bombs");
                num_bombs += 1;
            } else {
                new_cell.classList.add("n0"); // to be incremented. Zero means no value in cell
            }
            new_row.appendChild(new_cell);
        }
        table.appendChild(new_row);
    }

    num_flags = num_bombs;
    box.appendChild(table);
    assignNumbersToCells();

    // For each remaining empty cell, group into sections
    // Format of group classes: 'group_X'
    let curr_group_num = 0;
    let empty_cells = document.getElementsByClassName('n0');
    for (let i = 0; i < empty_cells.length; i++) {
        let curr_cell = empty_cells[i];
        if (curr_cell.classList[curr_cell.classList.length-1].split('_')[0] === "group") {
            continue;
        }
        propagateFromCell(curr_cell, curr_group_num);
        curr_group_num += 1;
    }
}

// HELPER FUNCTION
// Because JS arrays don't have a convenient 'remove' method...
function removeFromHiddenCells(item) {
    let index = hidden_cells.indexOf(item);
    if (index > -1) { // only splice array when item is found
      hidden_cells.splice(index, 1); // 2nd parameter means remove one item only
      return 0;
    }
    else {
        return 1; // For error handling
    }
}

// This function is called when all flags have been placed correctly and ends the game
function win() {
    has_won = true;
    let win_box = document.getElementById("play_again");
    win_box.style.display = "flex";
}

// This function handles the mechanics of selecting an empty (group) tile
function handleGroupTile(element) {
    let group = element.classList[2]; // Group of tiles to be revealed
    let tiles_in_group = document.getElementsByClassName(group);

    // Loop through each tile in the group and reveal 3x3 square centered at given tile
    for (let i = 0; i < tiles_in_group.length; i++) {
        // Get coords of tile
        let curr_tile = tiles_in_group[i];
        let coords = curr_tile.id.split(',');
        let x = Number(coords[0]);
        let y = Number(coords[1]);

        // Find top-left and bottom-right corners of surrounding square to be revealed
        let top_left = [0,0];
        if (x > 0) {
            top_left[0] = x - 1;
        }
        if (y > 0) {
            top_left[1] = y - 1;
        }

        let bottom_right = [x, y]; // Default is farthest corner; if less, will be changed
        if (x < rows-1) {
            bottom_right[0] = x + 1;
        }
        if (y < cols-1) {
            bottom_right[1] = y + 1;
        }

        // Loop over square formed by the top_left and bottom_right coords
        for (let temp_x = top_left[0]; temp_x < bottom_right[0]+1; temp_x++) {
            for (let temp_y = top_left[1]; temp_y < bottom_right[1]+1; temp_y++) {
                let curr_cell = document.getElementById(`${temp_x},${temp_y}`);  

                // Find what number (or not) to display in cell and style cell
                let classification = curr_cell.classList[1]; // "n0-4" (should not be "bombs")
                let this_group = curr_cell.classList[curr_cell.classList.length-1]; // For not revealing empty tiles from nearby groups

                if ((curr_cell.classList.length === 3) && (this_group !== group)) { // Different group, so skip
                    continue;
                }

                // Remove from list of hidden cells
                if (removeFromHiddenCells(curr_cell.id) === 1) { // Already removed, so skip
                    continue;
                }

                // Add to list of revealed cells
                if (revealed_cells.indexOf(curr_cell.id) === -1) {
                    revealed_cells.push(curr_cell.id);
                }

                // Check if there is flag on tile to reveal
                if (curr_cell.style.backgroundImage === flag) { // Adjust flag count before removing
                    num_flags += 1;
                }

                // Apply basic styles
                curr_tile.style.backgroundImage = "none";
                curr_cell.style.borderColor = "transparent";
                curr_cell.style.backgroundColor = color3;

                if (classification === "n0") { // Do not assign number below
                    continue;
                }

                // Get number of tile and display
                let num = classification.split('n')[1];
                curr_cell.style.backgroundImage = `url(number_textures/${num}.png)`;
            }
        }
    }
    // Update flag count after revealing tiles
    let counter = document.getElementById("counter_value");
    counter.innerHTML = num_flags;
} // END handleGroupTile

// This function handles the mechanics of selecting a bomb tile
function handleBombTile(element) {
    element.style.backgroundImage = `url(number_textures/bombs.png)`;
    element.style.backgroundColor = accent_color;

    let table_obj = document.getElementById("mine_table");
    setTimeout(() => {
        table_obj.style.backgroundColor = color2;

        let cell_objs = document.getElementsByClassName("cells");
        for (let j = 0; j < cell_objs.length; j++) {
            let cur_cell = cell_objs[j];
            cur_cell.style.transform = "scale(0)";
        }
    }, 1000);

    setTimeout(() => {
        table_obj.remove();
        generateNewGame();
    }, 2000);
} // END handleBombTile

// This function handles the mechanics of selecting a numbered tile
function handleNumberedTile(element) {
    let classes = element.classList;
    let cell_value = classes[1].split('n')[1];

    // Remove from list of hidden cells
    if (removeFromHiddenCells(element.id) === 1) { // Already revealed, so do nothing
        return;
    };

    // Add to list of revealed cells
    if (revealed_cells.indexOf(element.id) === -1) {
        revealed_cells.push(element.id);
    }

    // Apply basic styles
    element.style.backgroundImage = `url(number_textures/${cell_value}.png)`;
    element.style.borderColor = "transparent";
    element.style.backgroundColor = color3;
} // END handleNumberedTile

// This function handles the mechanics of placing or removing a flag on/from a tile
function handleFlagPlacement(element) {
    if (hidden_cells.includes(element.id) === false) { // Cell not hidden, so cannot apply flag
        return;
    }
    let curr_background = element.style.backgroundImage;
    let counter = document.getElementById("counter_value");
    if (curr_background === flag) { // Remove flag
        num_flags += 1;
        counter.innerHTML = num_flags;
        element.style.backgroundImage = flag_transparent;

        // Check if placed on bomb
        if (element.classList[1] === "bombs") {
            correct_flags -= 1; // No longer placed on a bomb
        }
    }
    else { // Place flag
        if (num_flags === 0) {return;} // Cannot place any more flags
        num_flags -= 1;
        counter.innerHTML = num_flags;
        // element.style.backgroundImage = "url(number_textures/flag.png)";
        element.style.backgroundImage = flag;

        // Check if placed on bomb
        if (element.classList[1] === "bombs") {
            correct_flags += 1; 
        }
    }
    // Check win condition
    if (correct_flags === num_bombs) {
        win();
    }
} // END handleFlagPlacement

// This function will animate the game to grow into view
function showGame() {
    // Make the table visible
    setTimeout(() => {
        let cell_objs = document.getElementsByClassName("cells");
        for (let j = 0; j < cell_objs.length; j++) {
            let cur_cell = cell_objs[j];
            cur_cell.style.transform = "scale(1)";
        }
    }, 200);

    let table = document.getElementById("mine_table");
    setTimeout(() => {
        table.style.backgroundColor = color1;
    }, 1200); // This time is the animation time for the 'cells' scale plus time of previous timeout
}

// This function is called anytime that a new game should be created, reseting all variables
function generateNewGame() {
    has_won = false; 

    // Set cell size to 10% of smallest dimension (width or height) of game box
    let game_box = document.getElementById("grid");
    let viewWidth = game_box.offsetWidth;
    let viewHeight = game_box.offsetHeight;
    let smallDimension = Math.min(viewWidth, viewHeight);
    cell_size = Math.floor(smallDimension * 0.10);

    // Determine cell properties
    border_size = Math.ceil(cell_size*(4/50)); // Because 4px was good for cell_size 50, use as ratio for other sizes
    border_spacing = Math.ceil(cell_size*(2/50));
    
    // Calculate game board dimensions
    const table_dimensions = calc_num_rows_and_cols(cell_size + (2*border_size) + border_spacing);
    rows = table_dimensions['rows'];
    cols = table_dimensions['columns'];
    
    // Calculate bomb stats
    const max_bombs = Math.floor(Math.sqrt(rows*cols)); // square root of the total number of cells
    chance_for_bomb = max_bombs / (rows*cols);

    createTable();

    // Flag count displayed is equal to number of bombs
    document.getElementById("counter_value").innerHTML = num_bombs;

    // Reset the flag toggle
    flags_toggled = false;
    let toggle = document.getElementById("flag_toggle");
    toggle.style.justifyContent = "flex-start";
    toggle.style.backgroundColor = color2;

    // Apply colors
    document.getElementById("counter_value").style.color = accent_color;
    document.getElementById("counter_bar").style.backgroundColor = color5;
    document.getElementById("flag_box").style.backgroundColor = color5;
    document.getElementById("game_flex").style.backgroundColor = color2;
    document.getElementById("toggle_circle").style.backgroundColor = color6;
    document.getElementById("play_again").style.boxShadow = `0px 0px 3px 3px ${accent_color}`;

    const color_buttons = document.querySelectorAll(`.color_mode`);
    color_buttons.forEach((element) => {
        element.style.backgroundColor = color6;
    });

    // Create the event listeners for all of the cells
    const all_cells = document.querySelectorAll(`.cells`);
    all_cells.forEach((element) => {
        element.addEventListener('click', () => {
            // Three types of class lists:
            // 1. ["cells", "n1-X"]             (numbered tile)
            // 2. ["cells", "bombs"]            (bomb tile)
            // 3. ["cells", "n0", "group_X"]    (group tile)
            let classes = element.classList;

            if (has_won) {return;} // Do not let user interact with game after they have won

            if (flags_toggled) { // placing flags takes priority over everything
                handleFlagPlacement(element);
            }
            else if (element.style.backgroundImage === flag) { // Trying to reveal flag tile, so don't
                return;
            }
            else if (classes[1] === "bombs") { // bomb tile
                handleBombTile(element);
            }
            else if (classes.length === 3) { // group tile
                handleGroupTile(element);
            }
            else { // numbered tile
                handleNumberedTile(element);
            }
        });
    });

    showGame();
}

// Called by the HTML code
function toggleFlag() {
    let toggle = document.getElementById("flag_toggle");

    if (flags_toggled) {
        toggle.style.justifyContent = "flex-start";
        toggle.style.backgroundColor = color2;

        // Remove flag icon from unflagged tiles
        for (let i = 0; i < hidden_cells.length; i++) {
            let cell = document.getElementById(hidden_cells[i]);
            if (cell.style.backgroundImage !== flag) { // no flag, so remove background
                cell.style.backgroundImage = "none";
            }
        }

        flags_toggled = false;
    } else {
        toggle.style.justifyContent = "flex-end";
        toggle.style.backgroundColor = accent_color;

        // Display flag icon on cells
        for (let i = 0; i < hidden_cells.length; i++) {
            let cell = document.getElementById(hidden_cells[i]);
            if (cell.style.backgroundImage !== flag) { // no flag, so add background
                cell.style.backgroundImage = flag_transparent;
            }
        }

        flags_toggled = true;
    }
}

// Called by HTML
function playAgain() {
    // has_won = false;
    document.getElementById("play_again").style.display = "none";

    // The following is just about the same as the code executed by the bomb handler
    let table_obj = document.getElementById("mine_table");
    table_obj.style.backgroundColor = color2;

    let cell_objs = document.getElementsByClassName("cells");
    for (let j = 0; j < cell_objs.length; j++) {
        let cur_cell = cell_objs[j];
        cur_cell.style.transform = "scale(0)";
    }

    setTimeout(() => {
        table_obj.remove();
        generateNewGame();
    }, 1000);

}

// Called by HTML
// Brings the user back to the landing page
function goHome() {
    location.href = "/Landing_Page";
}

generateNewGame();