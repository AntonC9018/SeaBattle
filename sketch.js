const SIZE = 50;
const OFFSET = SIZE / 8;
const HALFSIZE = SIZE / 2;
const WIDTH = 10;
const HEIGHT = 10;
const SM = 5;
var createSketch = function() {
  return function(p) {
    p.setup = function() {
      p.offSet = [0, 0]; // offset of the grid off left and top
      p.ships = [];
      p.turn = 0;
      p.ingame; // making ships / destroying ships

      // holds 1-2 arrays that indicate the 'start' and 'finish'
      // coordinates of the future (currently being born) ship
      p.shipCreation = [];

      p.gaps = []; // shot empty spaces

      // hint the form of the future ship while making it
      p.shipSilhouette = null;
      p.drawSilhouette = false;
      p.createCanvas(WIDTH * SIZE + 1 + p.offSet[0], HEIGHT * SIZE + 1 + p.offSet[1]);
      p.ingame = false;
      document.getElementById('btn').addEventListener('click', function(event) {
        p.ingame = true; // change game state when button is clicked
      })
    }
    // this function draws everything to the canvas ~60 times a second
    p.draw = function() {
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
      // draw ships
      for (let ship of p.ships) {
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
      { // check if mouse is off canvas
        if (p.mouseX > 0 && p.mouseX < p.width
          && p.mouseY > 0 && p.mouseY < p.height) {

          // get row and column
          let x = ~~((p.mouseX - p.offSet[0]) / SIZE);
          let y = ~~((p.mouseY - p.offSet[1]) / SIZE);

          // create half-transparent ship silhouette while making a ship
          if (p.drawSilhouette) {
            let ends = p.matchEnds([p.shipCreation[0], [x, y]]);
            p.shipSilhouette = new Ship(ends.start, ends.finish, true);
          }
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
      }
    }

    p.mouseClicked = function() {
      // check if inside canvas
      if (p.mouseX < 0 || p.mouseY < 0 ||
        p.mouseX > p.width || p.mouseY > p.height) return;

      // get row and column
      let I = ~~((p.mouseX - p.offSet[0]) / SIZE);
      let J = ~~((p.mouseY - p.offSet[1]) / SIZE);

      // check if hit a ship
      if (p.ingame) {
        for (let ship of p.ships) {
          if (ship.check(p.mouseX - p.offSet[0], p.mouseY - p.offSet[1])) {
            p.turn++;
            return;
          }
        }

        let notHitYet = true;

        // check if hit a gap
        for (let g of p.gaps) {
          if (g[0] === I && g[1] === J) {
            notHitYet = false; // it did
          }
        }

        // make the gap
        if (notHitYet) {
          p.gaps.push([I, J]);
        }

      } else {
        // select ends of the future ship
        if (p.shipCreation.length < 2) {
          p.shipCreation.push([I, J]);
          p.drawSilhouette = true;
        }
        // create the actual ship
        if (p.shipCreation.length >= 2) {
          p.drawSilhouette = false;

          let ends = p.matchEnds(p.shipCreation);

          p.ships.push(new Ship(ends.start, ends.finish));
          p.shipCreation = [];
        }
      }
    }
    // finds out if the space is empty
    p.isEmpty = function(x, y) {
      // check for ships
      for (let ship of p.ships) {
        if (x >= ship.start[0] && x <= ship.finish[0]
          && y >= ship.start[1] && y <= ship.finish[1]) {
          return false;
        }
      }
      if (p.shipSilhouette &&
        x >= p.shipSilhouette.start[0] && x <= p.shipSilhouette.finish[0]
        && y >= p.shipSilhouette.start[1] && y <= p.shipSilhouette.finish[1]) {
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
      let finish = [];
      { // ensure the start has the least coordinates and
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
  }
}
