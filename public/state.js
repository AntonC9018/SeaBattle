var stateScreen = new p5(function(p) {
  p.setup = function() {
    p.createCanvas(150, 150);
    p.state = 'waiting';


    p.CENTRAL = 10;
    p.OFFSET = 15;
    p.NUMBER = 9;
    p.WIDTH = 16;

    // rotational parameters
    p.I = 0;
    p.ROT = 0;
    p.REVERSE = false;
    p.AMP = 1/p.TAU * 1.5;
    p.MAXSTEP = 24;
    p.JERKINESS = 1/14;

    // tick mark constants
    p.TICKLEFT = 30;
    p.TICKBOTTOM = 20;
    p.TICKRIGHT = 8;
    p.TICKTOP = 10;
    p.TICKMAX = 120;
    p.TICKCHILL = p.TICKMAX * 0.40;
    p.TICKFIRST = p.TICKCHILL * 0.35;
  }

  p.draw = function() {
    if (p.REVERSE) {
      p.ROT-=1;
      if (p.ROT <= 0) {
        p.REVERSE = false;
      }
    } else {
      p.ROT+=1;
      if (p.ROT >= p.MAXSTEP) {
        p.REVERSE = true;
      }
    }
    p.background(255);

    if (p.state === 'waiting') {
      p.I += p.AMP * p.exp(-(p.ROT * p.JERKINESS));

      if (p.I > p.TAU) {
        p.I -= p.TAU;
      }
      p.translate(p.width/2, p.height/2);
      p.rotate(p.I);
      p.stroke(185, 185, 185)
      p.strokeWeight(p.WIDTH);

      let rad = p.TAU / (p.NUMBER);
      for (let i = 0; i <= p.NUMBER; i++) {
        p.stroke(185, 185, 185);

        if (i % 2 === 0) {
          p.stroke(203, 32, 140);
        }
        else if (i === 1) {
          p.stroke(27, 54, 195);
        }

        p.line(0, - p.OFFSET/2, 0, -p.width/2 + p.OFFSET/2);
        p.rotate(rad);
      }

      p.fill(185, 185, 185);
      p.stroke(0);
      p.strokeWeight(2);
      p.ellipse(0, 0, p.CENTRAL, p.CENTRAL);
    } else if (p.state === 'ready') {
      p.strokeWeight(p.WIDTH);
      p.stroke(51, 157, 25)
      if (!p.TICK) p.I = 0;
      p.TICK = true;

      if (p.I < p.TICKFIRST) {
        p.line(p.TICKLEFT, p.height/2,
          p.map(p.I, 0, p.TICKFIRST, p.TICKLEFT, p.width/2),
          p.map(p.I, 0, p.TICKFIRST, p.height/2, p.height - p.TICKBOTTOM));
      }

      else if (p.I < p.TICKCHILL) {
        p.line(p.TICKLEFT, p.height/2, p.width/2, p.height - p.TICKBOTTOM);
        p.line(p.width/2, p.height - p.TICKBOTTOM,
          p.map(p.I, p.TICKFIRST, p.TICKCHILL, p.width/2, p.width - p.TICKRIGHT),
          p.map(p.I, p.TICKFIRST, p.TICKCHILL, p.height - p.TICKBOTTOM, p.TICKTOP));
      }

      else {
        p.line(p.TICKLEFT, p.height/2, p.width/2, p.height - p.TICKBOTTOM);
        p.line(p.width/2, p.height - p.TICKBOTTOM,
          p.width - p.TICKRIGHT, p.TICKTOP);

        if (p.I >= p.TICKMAX) {
          p.TICK = false;
        }
      }

      p.I += 1;
    }
  }
}, document.getElementById('sk1'));
