var stateScreen = new p5(function(p) {
    p.setup = function() {
      p.createCanvas(150, 150);
      p.state = 'hidden';


      p.CENTRAL = 10;
      p.OFFSET = 15;
      p.NUMBER = 9;
      p.WIDTH = 16;

      // rotational parameters
      p.I = 0;
      p.ROT = 0;
      p.REVERSE = false;
      p.AMP = 1 / p.TAU * 1.2;
      p.MAXSTEP = 24;
      p.JERKINESS = 1 / 14;

      // tick mark constants
      p.TICKLEFT = 30;
      p.TICKBOTTOM = 20;
      p.TICKRIGHT = 8;
      p.TICKTOP = 10;
      p.TICKMAX = 1.5 * 1000;
      p.TICKCHILL = p.TICKMAX * 0.78;
      p.TICKFIRST = p.TICKCHILL * 0.35;

      // cross constants
      p.CROSSOFFSET = p.OFFSET;
      p.CROSS = false;
      p.CROSSMAX = 1.5 * 1000;
      p.CROSSCHILL = p.CROSSMAX * 0.78;
      p.CROSSFIRST = p.CROSSCHILL * 0.50;
      p.CROSSFIRSTTOSECOND = 20;
      p.CROSSSECOND = p.CROSSFIRSTTOSECOND + p.CROSSCHILL - p.CROSSFIRST;

    }

    p.draw = function() {
      p.clear()

      if (p.state === 'waiting') {

        let residue = (~~p.millis() / (1000) * 60) % (p.MAXSTEP * 2);
        let angle = residue <= p.MAXSTEP ? residue : 2 * p.MAXSTEP - residue;
        p.I += p.AMP * p.exp(-(angle * p.JERKINESS));

        if (p.I > p.TAU) {
          p.I -= p.TAU;
        }
        p.translate(p.width / 2, p.height / 2);
        p.rotate(p.I);
        p.stroke(208, 93, 20);
        p.strokeWeight(p.WIDTH);

        let rad = p.TAU / (p.NUMBER);
        for (let i = 0; i <= p.NUMBER; i++) {
          p.stroke(208, 93, 20);

          if (i % 2 === 0) {
            p.stroke(203, 32, 140);
          } else if (i === 1) {
            p.stroke(27, 54, 195);
          }

          p.line(0, -p.OFFSET / 2, 0, -p.width / 2 + p.OFFSET / 2);
          p.rotate(rad);
        }

        p.fill(185, 185, 185);
        p.stroke(0);
        p.strokeWeight(2);
        p.ellipse(0, 0, p.CENTRAL, p.CENTRAL);

      } else if (p.state === 'ready') {
        p.strokeWeight(p.WIDTH);
        p.stroke(51, 157, 25);

        if (!p.TICK) {
          p.TICKSTART = p.millis();
          p.TICK = true;
        }

        let i = p.millis() - p.TICKSTART;

        p.line(p.TICKLEFT, p.height / 2,
          p.map(i, 0, p.TICKFIRST, p.TICKLEFT, p.width / 2, true),
          p.map(i, 0, p.TICKFIRST, p.height / 2, p.height - p.TICKBOTTOM, true));

        if (i >= p.TICKFIRST)
          p.line(p.width / 2, p.height - p.TICKBOTTOM,
            p.map(i, p.TICKFIRST, p.TICKCHILL, p.width / 2, p.width - p.TICKRIGHT, true),
            p.map(i, p.TICKFIRST, p.TICKCHILL, p.height - p.TICKBOTTOM, p.TICKTOP, true));

        if (i >= p.TICKMAX) {
          changeState('hidden');
          p.TICK = false;
        }

      } else if (p.state === 'fail') {

        p.translate(p.CROSSOFFSET, p.CROSSOFFSET);
        p.strokeWeight(p.WIDTH);
        p.stroke(189, 55, 12);

        if (!p.CROSS) {
          p.CROSSSTART = p.millis();
          p.CROSS = true;
        }

        let i = p.millis() - p.CROSSSTART;

        p.line(0, 0, p.map(i, 0, p.CROSSFIRST, 0, p.width - 2 * p.CROSSOFFSET, true),
          p.map(i, 0, p.CROSSFIRST, 0, p.height - 2 * p.CROSSOFFSET, true))

        if (i >= p.CROSSSECOND) {
          p.translate(p.width - 2 * p.CROSSOFFSET, 0);
          p.line(0, 0, p.map(i, p.CROSSSECOND, p.CROSSCHILL, 0, -p.width + 2 * p.CROSSOFFSET, true),
            p.map(i, p.CROSSSECOND, p.CROSSCHILL, 0, p.height - 2 * p.CROSSOFFSET, true))
        }

        if (i >= p.CROSSMAX) {
          changeState('hidden');
          p.CROSS = false;
        }
      }
    }
    
    p.reset = function() {
      p.TICK = false;
      p.CROSS = false;
    }
  },
  document.getElementById('sk3'));
