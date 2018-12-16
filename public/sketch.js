const SIZE = 35;
const OFFSET = SIZE / 8;
const HALFSIZE = SIZE / 2;
const WIDTH = 10;
const HEIGHT = 10;
const SM = 5;
var ingame; // making ships / destroying ships
var sketch = function(myboard) { // myboard indicates if it is your board or your opponent's

  return function(p) {
    p.setup = function() {
      p.offSet = [0, 0]; // offset of the grid off left and top

      p.drawGrid = function() {
        p.translate(p.offSet[0], p.offSet[1]);
        p.background(255);
        p.noFill();
        p.stroke(0);
        p.strokeWeight(1);

        // draw grid
        for (let j = 0; j < HEIGHT + 1; j++) {
          p.line(0, j * SIZE, SIZE * WIDTH, j * SIZE);
        }
        for (let i = 0; i < WIDTH + 1; i++) {
          p.line(i * SIZE, 0, i * SIZE, SIZE * HEIGHT);
        }
      }

      p.calcAdjacent = function(ship) {
        console.log('The ship: ');
        console.log(ship);
        let inds = ship.inds;
        console.log('The indeces: ');
        console.log(inds);
        let result = [];
        if (ship.length === 1) {
          {
            let i0 = inds[0];

            let x0 = i0.x > 0;
            let y0 = i0.y > 0;
            let xw = i0.x < WIDTH;
            let yh = i0.y < HEIGHT;

            if (x0)       result.push([i0.x - 1, i0.y    ]);
            if (y0)       result.push([i0.x,     i0.y - 1]);
            if (x0 && y0) result.push([i0.x - 1, i0.y - 1]);
            if (xw)       result.push([i0.x + 1, i0.y    ]);
            if (xw && y0) result.push([i0.x + 1, i0.y - 1]);
            if (yh)       result.push([i0.x,     i0.y + 1]);
            if (xw && yh) result.push([i0.x + 1, i0.y + 1]);
            if (x0 && yh) result.push([i0.x - 1, i0.y + 1]);
          }
        }
        else if (ship.h > 1) {

            let x0 = inds[0].x > 0;
            let xw = inds[0].x < WIDTH;

            {
              let i0 = inds[0];

              let y0 = i0.y > 0;

              if (x0)       result.push([i0.x - 1, i0.y    ]);
              if (y0)       result.push([i0.x,     i0.y - 1]);
              if (x0 && y0) result.push([i0.x - 1, i0.y - 1]);
              if (xw)       result.push([i0.x + 1, i0.y    ]);
              if (xw && y0) result.push([i0.x + 1, i0.y - 1]);
            }

            {
              let i1 = inds[inds.length - 1];

              let yh = i1.y < HEIGHT;

              if (x0)       result.push([i1.x - 1, i1.y    ]);
              if (xw)       result.push([i1.x + 1, i1.y    ]);
              if (yh)       result.push([i1.x,     i1.y + 1]);
              if (xw && yh) result.push([i1.x + 1, i1.y + 1]);
              if (x0 && yh) result.push([i1.x - 1, i1.y + 1]);
            }

            for (let i = 1; i < inds.length - 1; i++) {
              if (x0) result.push([inds[i].x - 1, inds[i].y]);
              if (xw) result.push([inds[i].x + 1, inds[i].y]);
            }
          }
          else if (ship.w > 1) {


            let yh = inds[0].y < HEIGHT;
            let y0 = inds[0].y > 0;

            {
              let i0 = inds[0];

              let x0 = i0.x > 0;

              if (x0)       result.push([i0.x - 1, i0.y    ]);
              if (y0)       result.push([i0.x,     i0.y - 1]);
              if (x0 && y0) result.push([i0.x - 1, i0.y - 1]);
              if (yh)       result.push([i0.x,     i0.y + 1]);
              if (x0 && yh) result.push([i0.x - 1, i0.y + 1]);
          }

          {
            let i1 = inds[inds.length - 1];

            let xw = inds[0].x < WIDTH;

            if (y0)       result.push([i1.x,     i1.y - 1]);
            if (xw)       result.push([i1.x + 1, i1.y    ]);
            if (xw && y0) result.push([i1.x + 1, i1.y - 1]);
            if (yh)       result.push([i1.x,     i1.y + 1]);
            if (xw && yh) result.push([i1.x + 1, i1.y + 1]);

          }

          for (let i = 1; i < inds.length - 1; i++) {
            if (y0) result.push([inds[i].x, inds[i].y - 1]);
            if (yh) result.push([inds[i].x, inds[i].y + 1]);
          }
        }

      return result;
    }

      // bind different functions and variables depending on the board type
      // (your or your opponent's)

      if (myboard) {

        p.ships = [];

        p.deadShips = [];

        // holds 1-2 arrays that indicate the 'start' and 'finish'
        // coordinates of the future (currently being born) ship
        p.shipCreation = [];

        p.gaps = []; // shot empty spaces

        p.turn = 0;

        // hint the form of the future ship while making it
        p.shipSilhouette = null;
        p.silhouette = false;


        // draw your navy and the gaps
        p.navy = function() {
          // draw ships
          for (let ship of p.ships) {
            ship.show(p);
          }
          for (let ship of p.deadShips) {
            ship.show(p);
          }
          if (p.shipSilhouette) {
            p.shipSilhouette.show(p);
          }
          p.fill(6, 167, 109);
          p.noStroke();

          // change color of shot tiles
          for (let g of p.gaps) {
            p.rect(g[0] * SIZE + 1, g[1] * SIZE + 1, SIZE - 1, SIZE - 1)
          }
        }

        // draw ship's silhouette that hints the player the size of the ships
        // while it is being created
        p.drawSilhouette = function(x, y) {
          if (p.silhouette) {
            let ends = p.matchEnds([p.shipCreation[0],
              [x, y]
            ]);
            p.shipSilhouette = new Ship(ends.start, ends.finish, true);
          }
          p.noStroke();
        }

        // resolve mouse click event
        p.handleClick = function(I, J) {
          if (!ingame) {
            // select ends of the future ship
            if (p.shipCreation.length < 2) {
              p.shipCreation.push([I, J]);
              p.silhouette = true;
            }

            // create the actual ship
            if (p.shipCreation.length >= 2) {
              p.silhouette = false;

              let ends = p.matchEnds(p.shipCreation);

              p.ships.push(new Ship(ends.start, ends.finish));
              p.shipCreation = [];
            }
          }
        }

        // finds out if the space is empty
        p.isEmpty = function(x, y) {
          if (x > WIDTH || y > HEIGHT || x < 0 || y < 0) return;
          // check for ships
          for (let ship of p.ships) {
            if (x >= ship.start[0] && x <= ship.finish[0] &&
              y >= ship.start[1] && y <= ship.finish[1]) {
              return false;
            }
          }
          if (p.shipSilhouette &&
            x >= p.shipSilhouette.start[0] && x <= p.shipSilhouette.finish[0] &&
            y >= p.shipSilhouette.start[1] && y <= p.shipSilhouette.finish[1]) {
            return false;
          }
          // sheck for gaps
          for (let gap of p.gaps) {
            if (x === gap[0] && y === gap[1]) {
              return false;
            }
          }
          return true;
        }


        p.matchEnds = function(sc) {
            let start = [];
            let finish = []; { // ensure the start has the least coordinates and
              // the finish has the greatest ones

              // check X coordinates (indeces)
              if (sc[0][0] > sc[1][0]) {
                start[0] = sc[1][0];
                finish[0] = sc[0][0];
              } else {
                start[0] = sc[0][0];
                finish[0] = sc[1][0];
              }

              // check Y coordinates (indeces)
              if (sc[0][1] > sc[1][1]) {
                start[1] = sc[1][1];
                finish[1] = sc[0][1];
              } else {
                start[1] = sc[0][1];
                finish[1] = sc[1][1];
              }
            }
            return {
              start,
              finish
            }
          }


        p.shoot = function(x, y) {

          let result = null;

          // check if hit a ship
          p.ships.forEach((ship, i, arr) => {
            let eff = ship.check(x * SIZE + 1, y * SIZE + 1);
            console.log('check for ' + i + 'th ship. effect: ');
            console.log(eff);
            if (eff.hit) {
              if (eff.kill !== null) {
                let deadShip = arr.splice(i, 1)[0];
                p.deadShips.push(deadShip);
                p.end(deadShip);
                if (arr.length === 0) {
                  eff.win = true;
                  lose();
                }
              }
              result = eff;
              return;
            }
          })

          if (result) return result;

          let notHitYet = true;

          // check if hit a gap
          for (let g of p.gaps) {
            if (g[0] === x && g[1] === y) {
              notHitYet = false; // it did
            }
          }

          // make the gap
          if (notHitYet) {
            p.gaps.push([x, y]);
            return {
              hit: false,
              kill: null,
              win: false
            };
          }

          return 'error';
        }

        p.has = function(arr, el) {
          for (let i = 0; i < arr.length; i++) {
            if (arr[i][0] === el[0] && arr[i][1] === el[1]){
              return i;
            }
          }
          return -1;
        }

        p.end = function(ship) {
          let cells = p.calcAdjacent(ship);

          for (let cell of cells) {
            if (p.has(p.gaps, cell) === -1)
              p.gaps.push(cell);
          }
        }

      } else {

        const EMPTYCELL = 0
        GAPCELL = 1
        SHIPCELL = 2;


        p.cells = new Array(WIDTH + 1);
        let space = new Array(HEIGHT + 1);
        space.fill(0);
        for (let i = 0; i < WIDTH + 1; i++) {
          p.cells[i] = space.slice();
        }

        // draw crosses and gaps
        p.navy = function() {
          for (let i = 0; i < WIDTH; i++) {
            for (let j = 0; j < HEIGHT; j++) {
              switch (p.cells[i][j]) {
                case EMPTYCELL: // empty cell
                  break;

                case GAPCELL: // a gap
                  p.fill(6, 167, 109);
                  p.noStroke();
                  p.rect(i * SIZE + 1, j * SIZE + 1, SIZE - 1, SIZE - 1);
                  break;

                case SHIPCELL: // a ship
                  p.stroke(184, 23, 23);
                  p.strokeWeight(3);
                  let x = i * SIZE + 1;
                  let y = j * SIZE + 1;
                  p.line(x + SM, y + SM,
                    x + SIZE - SM, y + SIZE - SM);
                  p.line(x + SIZE - SM, y + SM,
                    x + SM, y + SIZE - SM);
                  break;

                default:
                  break;
              }
            }
          }
        }

        // do nothing
        p.drawSilhouette = function() {}

        // resolve mouse click event
        p.handleClick = function(I, J) {
          if (p.cells[I][J] === 0 && initiative === 0) {
            cycle(I, J);
          }
        }

        // finds out if the space is empty
        p.isEmpty = function(x, y) {
          if (x > WIDTH || y > HEIGHT || x < 0 || y < 0) return;

          return p.cells[x][y] === 0;
          console.log(p.cells);
        }

        p.kill = function(start, finish) {
          let cs = p.calcAdjacent(new Ship(start, finish, false));
          for (let c of cs) {
            p.cells[c[0]][c[1]] = GAPCELL;
          }
        }

      }

      p.createCanvas(WIDTH * SIZE + 1 + p.offSet[0], HEIGHT * SIZE + 1 + p.offSet[1]);
    },



    // this function draws everything to the canvas ~60 times a second
    p.draw = function() {

      p.drawGrid();

      // draw the navy / enemy's navy (if hit)
      // and the gaps
      p.navy()

      // check if mouse is off canvas
      if (p.mouseX > 0 && p.mouseX < p.width &&
        p.mouseY > 0 && p.mouseY < p.height) {

        // get row and column
        let x = ~~((p.mouseX - p.offSet[0]) / SIZE);
        let y = ~~((p.mouseY - p.offSet[1]) / SIZE);

        // create half-transparent ship silhouette (while making a ship)
        p.drawSilhouette(x, y);

        p.noStroke();

        // Hovering
        if (x <= WIDTH && y <= HEIGHT &&
          x >= 0 && y >= 0)
          if (p.isEmpty(x, y)) {
            p.fill(240, 238, 24);
            p.rect(x * SIZE + 1, y * SIZE + 1,
              SIZE - 1, SIZE - 1);
          } else {
            p.fill(240, 238, 24, 90);
            p.rect(x * SIZE + 1, y * SIZE + 1,
              SIZE - 1, SIZE - 1);
          }
      }
    },


    p.mouseClicked = function() {
        // check if inside canvas
        if (p.mouseX < 0 || p.mouseY < 0 ||
          p.mouseX > p.width || p.mouseY > p.height) return;

        // get row and column
        let I = ~~((p.mouseX - p.offSet[0]) / SIZE);
        let J = ~~((p.mouseY - p.offSet[1]) / SIZE);

        p.handleClick(I, J);
      }

  }
}
