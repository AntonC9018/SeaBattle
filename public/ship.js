class Ship {
  constructor(start, finish, silhouette) {
    if (silhouette) { // if half transparent
      this.silhouette = true;
    } else {
      this.silhouette = false;
    }
    this.start = start;
    this.finish = finish;
    this.w = finish[0] - start[0] + 1;
    this.h = finish[1] - start[1] + 1;
    this.length = this.w > this.h ? this.w : this.h;
    this.pos = [];
    this.inds = [];
    for (let x = start[0]; x < start[0] + this.w; x++) {
      for (let y = start[1]; y < start[1] + this.h; y++) {
        this.pos.push({
          x: x * SIZE,
          y: y * SIZE,
          alive: true
        });
        this.inds.push({
          x,
          y
        });
      }
    }
  }
  show(p) {
    p.stroke(0);
    p.strokeWeight(1);
    if (!this.silhouette) {
      p.fill(81, 226, 30);
    } else {
      // this last 80 stands for transparency (alpha)
      p.fill(81, 226, 30, 80);
    }

    { // Sausages
      let xTop = this.start[0] * SIZE + OFFSET + 1;
      let xBot = this.finish[0] * SIZE - OFFSET + SIZE;
      let yTop = this.start[1] * SIZE + OFFSET + 1;
      let yBot = this.finish[1] * SIZE - OFFSET + SIZE;

      p.beginShape();
      p.vertex(xTop, yTop);
      p.vertex(xBot, yTop);
      p.vertex(xBot, yBot);
      p.vertex(xTop, yBot);
      p.endShape(p.CLOSE);
    }


    p.noFill();
    p.stroke(184, 23, 23);
    p.strokeWeight(3);

    for (let po of this.pos) {
      // cross out dead cells
      if (!po.alive) {
        p.line(po.x + SM, po.y + SM,
          po.x + SIZE - SM, po.y + SIZE - SM);
        p.line(po.x + SIZE - SM, po.y + SM,
          po.x + SM, po.y + SIZE - SM);
      }
    }
  }
  // check is mouse (any coordinate) is inside this ship
  check(x, y) {
    let dead = true;
    let result = {
      hit: false,
      kill: null,
      win: false
    };
    for (let po of this.pos) {
      if (!result.hit && po.x < x && po.x + SIZE > x
        && po.y < y && po.y + SIZE > y) {
        po.alive = false;
        result.hit = true;
        result.kill = { start: this.start, finish: this.finish }
      } else {
        if (po.alive) dead = false;
      }
    }
    if (!dead) {
      result.kill = null;
    }
    return result;
  }
}
