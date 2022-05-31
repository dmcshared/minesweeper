/**
 * @param {HTMLDivElement[][]} grid
 * @param {number} x
 * @param {number} y
 */
function getBombs(grid, x, y) {
  let bombs = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (
        x + i in grid &&
        y + j in grid[x + i] &&
        grid[x + i][y + j].classList.contains("bomb")
      )
        bombs++;
    }
  }
  return bombs;
}

/**
 * @param {HTMLDivElement[][]} grid
 * @param {number} x
 * @param {number} y
 */
function revealFromCell(grid, x, y) {
  const cell = grid[x][y];
  if (cell.classList.contains("hidden") && !cell.classList.contains("flag")) {
    cell.classList.remove("hidden");
    if (cell.getAttribute("data-real-bombs") === "0") {
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (
            x + i in grid &&
            y + j in grid[x + i] &&
            grid[x + i][y + j].classList.contains("hidden")
          )
            revealFromCell(grid, x + i, y + j);
        }
      }
    }
  }
}

/**
 * @param {HTMLDivElement[][]} grid
 * @param {number} x
 * @param {number} y
 */
function changeNeighbors(grid, x, y, n = 1, changeReal = false) {
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (x + i in grid && y + j in grid[x + i] && (i != 0 || j != 0)) {
        grid[x + i][y + j].setAttribute(
          "data-bombs",
          (+grid[x + i][y + j].getAttribute("data-bombs") + n).toString()
        );
        if (changeReal)
          grid[x + i][y + j].setAttribute(
            "data-real-bombs",
            (+grid[x + i][y + j].getAttribute("data-bombs")).toString()
          );

        if (!grid[x + i][y + j].classList.contains("flag"))
          grid[x + i][y + j].textContent =
            grid[x + i][y + j].getAttribute("data-bombs");
      }
    }
  }
}

/**
 * @param {HTMLDivElement[][]} grid
 */
function gameOver(grid) {
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      const cell = grid[x][y];
      cell.classList.remove("hidden");
    }
  }
}

/**
 *
 * @param {number} w
 * @param {number} h
 * @param {number} b
 * @returns {{
 *     w: number;
 *     h: number;
 *     topElement: HTMLDivElement;
 *     grid: HTMLDivElement[][];
 * }}
 */
function createHTMLBoard(
  w = 10,
  h = 10,
  b = 10,
  changeBombNums = false,
  verifyFlags = false
) {
  const topElement = document.createElement("div");

  topElement.classList.add("board");
  topElement.style.display = "grid";
  topElement.style.gridTemplateColumns = `repeat(${w}, 1fr)`;
  topElement.style.gridTemplateRows = `repeat(${h}, 1fr)`;
  topElement.style.width = `${w * 50}px`;
  topElement.style.height = `${h * 50}px`;

  const grid = [];
  for (let x = 0; x < w; x++) {
    grid[x] = [];
    for (let y = 0; y < h; y++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.classList.add("hidden");
      cell.style.gridColumn = `${x + 1}`;
      cell.style.gridRow = `${y + 1}`;
      grid[x][y] = cell;
      topElement.appendChild(cell);

      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        cell.classList.toggle("flag");
        if (cell.classList.contains("flag")) {
          if (!cell.classList.contains("bomb") && verifyFlags) {
            gameOver(grid);
          }
          cell.textContent = "";
          if (changeBombNums) changeNeighbors(grid, x, y, -1, true);
        } else {
          cell.textContent = cell.getAttribute("data-bombs");
          if (changeBombNums) changeNeighbors(grid, x, y, 1, true);
        }
      });

      cell.addEventListener("click", (e) => {
        if (
          cell.classList.contains("hidden") &&
          !cell.classList.contains("flag")
        ) {
          if (cell.getAttribute("data-real-bombs") === "0") {
            revealFromCell(grid, x, y);
          } else {
            cell.classList.remove("hidden");

            if (cell.classList.contains("bomb")) {
              gameOver(grid);
            }
          }
        }
      });
    }
  }

  for (let i = 0; i < b; i++) {
    const x = (Math.random() * w) | 0;
    const y = (Math.random() * h) | 0;

    if (x in grid && y in grid[x])
      // @ts-ignore
      grid[x][y].classList.add("bomb");
  }

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      /**
       * @type {HTMLDivElement}
       */
      const cell = grid[x][y];
      const bombs = getBombs(grid, x, y);
      cell.setAttribute("data-bombs", bombs.toString());
      cell.setAttribute("data-real-bombs", bombs.toString());
      cell.innerText = bombs.toString();
    }
  }

  return {
    w,
    h,
    topElement,
    grid,
  };
}

function startGame({
  w = 10,
  h = 10,
  b = 10,
  changeBombNums = false,
  verifyFlags = false,
} = {}) {
  const board = createHTMLBoard(w, h, b, changeBombNums, verifyFlags);

  document.querySelector(".game").appendChild(board.topElement);
}

/**
 * @param {string} name
 * @param {{ [x: string]: { background:string; border: string; solvedBg: string; bombBg: string; hiddenBg: string; bombcount0Bg: string; bombcount0Fg: string; bombcount1Fg: string; bombcount2Fg: string; bombcount3Fg: string; bombcount4Fg: string; bombcount5Fg: string; bombcount6Fg: string; bombcount7Fg: string; bombcount8Fg: string; }; }} obj
 */
function applyStyle(name, obj) {
  const styl = obj[name];

  document.documentElement.style.backgroundColor = styl.background;
  document.documentElement.style.setProperty("--col-border:", styl.border);
  document.documentElement.style.setProperty("--col-solved-bg", styl.solvedBg);
  document.documentElement.style.setProperty("--col-bomb-bg", styl.bombBg);
  document.documentElement.style.setProperty("--col-hidden-bg", styl.hiddenBg);
  document.documentElement.style.setProperty(
    "--col-bombcount-0-bg",
    styl.bombcount0Bg
  );
  document.documentElement.style.setProperty(
    "--col-bombcount-0-fg",
    styl.bombcount0Fg
  );
  document.documentElement.style.setProperty(
    "--col-bombcount-1-fg",
    styl.bombcount1Fg
  );
  document.documentElement.style.setProperty(
    "--col-bombcount-2-fg",
    styl.bombcount2Fg
  );
  document.documentElement.style.setProperty(
    "--col-bombcount-3-fg",
    styl.bombcount3Fg
  );
  document.documentElement.style.setProperty(
    "--col-bombcount-4-fg",
    styl.bombcount4Fg
  );
  document.documentElement.style.setProperty(
    "--col-bombcount-5-fg",
    styl.bombcount5Fg
  );
  document.documentElement.style.setProperty(
    "--col-bombcount-6-fg",
    styl.bombcount6Fg
  );
  document.documentElement.style.setProperty(
    "--col-bombcount-7-fg",
    styl.bombcount7Fg
  );
  document.documentElement.style.setProperty(
    "--col-bombcount-8-fg",
    styl.bombcount8Fg
  );
}

const urlParams = new URLSearchParams(location.search);

const styles = {
  default: {
    background: "white",
    border: "rgba(0, 0, 0, 0.25)",
    solvedBg: "white",
    bombBg: "#9b404f",
    hiddenBg: "#ccc",
    bombcount0Bg: "rgb(240, 240, 240)",
    bombcount0Fg: "rgb(133, 133, 133)",
    bombcount1Fg: "rgb(95, 66, 255)",
    bombcount2Fg: "rgb(70, 163, 101)",
    bombcount3Fg: "rgb(226, 77, 77)",
    bombcount4Fg: "rgb(59, 45, 134)",
    bombcount5Fg: "rgb(122, 48, 48)",
    bombcount6Fg: "rgb(50, 101, 110)",
    bombcount7Fg: "rgb(0, 0, 0)",
    bombcount8Fg: "rgb(54, 54, 54)",
  },
  dark: {
    background: "black",
    border: "rgba(255, 255, 255, 0.25)",
    solvedBg: "black",
    bombBg: "#9b404f",
    hiddenBg: "#444",
    bombcount0Bg: "rgb(15, 15, 15)",
    bombcount0Fg: "rgb(133, 133, 133)",
    bombcount1Fg: "rgb(95, 66, 255)",
    bombcount2Fg: "rgb(70, 163, 101)",
    bombcount3Fg: "rgb(226, 77, 77)",
    bombcount4Fg: "rgb(59, 45, 134)",
    bombcount5Fg: "rgb(122, 48, 48)",
    bombcount6Fg: "rgb(50, 101, 110)",
    bombcount7Fg: "rgb(0, 0, 0)",
    bombcount8Fg: "rgb(54, 54, 54)",
  },
};

applyStyle(urlParams.get("s") || "default", styles);

const rules = {
  w: +urlParams.get("w") || ((innerWidth - 16) / 52) | 0,
  h: +urlParams.get("h") || ((innerHeight - 16) / 52) | 0,
  b: +urlParams.get("b"),
  changeBombNums: (urlParams.get("cbn") || "false") === "true",
  verifyFlags: (urlParams.get("vf") || "false") === "true",
};

if (!rules.b) rules.b = (rules.w * rules.h) / 5;

startGame(rules);
