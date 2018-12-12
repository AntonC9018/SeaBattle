const express = require('express');
const app = express();
const db = require('./data/connection.js');
const port = process.env.PORT || 8080;
const play = require('./data/games.js')();

var queue = [];
var resp = {

};

var timeout = require('connect-timeout');

app.use(timeout(1000 * 60 * 300));
app.use(haltOnTimedout);


function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

//play.restore();
play.drop(db)

app.use(express.static(__dirname + '/public'))


app.set('view engine', 'ejs')

// player waiting for response
// wait for hit info and get it
app.get('/games/res/:id/:name', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;

  console.log('player ' + name.slice(8) + ' waiting for response');

  play.getGame(id).then((r) => {

    let answer = {}

    // Validation
    if (!r) answer.error = 'no such game'
    else if (!r.players.includes(name)) answer.error = 'not in this game'
    else if (r.request && r.request.from != name) answer.error = 'send request'
    else {
      let i = r.players[0] == name ? 0 : 1;
      console.log('The player that has initiative: ' +
        r.players[parseInt(r.initiative)].slice(8));
      if (r.initiative != i) answer.error = 'not your turn'
      else {


        console.log('calling _endResponse');

        // No discrepancy found (data is valid)
        _endResponse(id, name, res, r).then(r => {
          console.log('_endResponse!');
          if (r) {
            console.log('_endResponse response: ' + r);
            return;

          }
          else {

            // Repeat without the check (validation)
            let t = setInterval(function() {
              play.getGame(id).then((r) => {

                _endResponse(id, name, res, r).then(r => {
                  if (r) {
                    clearInterval(t);
                    return;
                  }
                })
              })
            }, 600)
          }
        })
      }
    }

    if (answer.error) {
      res.end(JSON.stringify(answer));
    }
  })
})

function _endResponse(id, name, res, r) {

  console.log('in _endResponse');

  return new Promise(function(resolve, reject) {

    let rp = r.response;
    console.log('Response so far: ');
    console.log(rp);
    if (rp && rp.from != name) {

      console.log('Response after: ');
      console.log(rp);
      let y = rp['hit'] == 'true';
      console.log('VALUE true: ', y);
      console.log('VALUE false: ', !y);

      if (!y) {
        console.log('A ship not hit');
        let i = r.players[0] == name ? 1 : 0;
        console.log('Player ' + name.slice(8) + ' responds');
        console.log('Passing initiative to player ' + r.players[i].slice(8));
        play.pass(id, i).then(r => {
          play.getGame(id).then(r => {
            console.log('GetGame: ' + r);

            play.clear(id);

            answer.response = rp.hit;
            res.end(JSON.stringify(answer));
            resolve(true);

            })
          })
        } else {
          console.log('A ship hit');
          play.getGame(id).then(r => {
            console.log('GetGame: ' + r);

            play.clear(id);

            answer.response = rp.hit;
            res.end(JSON.stringify(answer));
            resolve(true);
          })
        }
      } else {
      resolve(false)
    }
  })
}


// player sending a response
app.get('/games/res/:id/:name/:hit', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;
  let hit = req.params.hit;

  console.log('player ' + name.slice(8) + ' sending a response');

  play.getGame(id).then(function(r) {

    let answer = {};

    // Validation
    if (!r) answer.error = 'no such game';
    else if (!r.players.includes(name)) answer.error = 'you are not in this game'
    else if (r.response && r.response.from == name) answer.error = 'already responded'
    else if (r.request && r.request.from == name) res.end('you must wait for response')
    else {
      let i = r.players[0] == name ? 0 : 1;
      if (r.initiative == i) answer.error = 'your turn'

      // Save response to db
      else play.inter(id, {
        type: 'response',
        body: {
          from: name,
          hit: hit
        }
      }).then(r => {
        console.log('saved');
        answer.response = 'success';

        res.end(JSON.stringify(answer));
      })
    }

    if (answer.error) {
      res.end(JSON.stringify(answer))
    }
  })
})


// Shoot a tile (send a request)
app.get('/games/req/:id/:name/:x/:y', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;
  let x = req.params.x;
  let y = req.params.y;

  console.log('player ' + name.slice(8) + ' sending a request');

  play.getGame(id).then((r) => {

    let answer = {};

    // Validation
    if (!r) answer.error = 'no such game'
    else if (!r.players.includes(name)) answer.error = 'you are not in this game'
    else if (r.request && r.request.from == name) answer.error = 'request already sent'
    // else if (r.response && r.response.from != name) res.end('response first')
    else {
      let i = r.players[0] == name ? 0 : 1;
      console.log('The player that has initiative: ' + r.players[i].slice(8));
      if (r.initiative != i) answer.error = 'not your turn'

      // send Request
      else play.inter(id, {
        type: 'request',
        body: {
          from: name,
          coordinates: {
            x: x,
            y: y
          }
        }
      }).then((r) => {
        if (r) answer.response = 'success';
        res.end(JSON.stringify(answer));
      })
    }

    if (answer.error) {
      res.end(JSON.stringify(answer));
    }
  })
})


// Wait for request and get it
// (Get coordinates of the tile being shot)
app.get('/games/req/:id/:name', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;

  console.log('player ' + name.slice(8) + ' waiting for request');

  play.getGame(id).then((r) => {

    let answer = {};

    // Validation
    if (!r) answer.error = 'no such game'
    else if (!r.players.includes(name)) answer.error = 'not in this game'
    else if (r.request && r.request.from == name) answer.error = 'wait for response'
    else {
      let i = r.players[0] == name ? 0 : 1;
      if (r.initiative == i) answer.error = 'your turn to atack'
      else {

        // No discrepancy found (data is valid)
        if (_endRequest(name, r, res)) {
          return;
        }

        // Repeat without the check (validation)
        let k = setInterval(function() {
          console.log('Still there');
        }, 5000)
        let t = setInterval(function() {
          play.getGame(id).then((r) => {

            if (_endRequest(name, r, res)) {
              clearInterval(t);
              clearInterval(k);
              return;
            }
          })
        }, 600)
      }
    }

    if (answer.error) {
      res.end(JSON.stringify(answer));
    }
  })
})

app.get('/games/clear/:id', function(req, res) {
  let id = req.params.id;

  let t = setInterval(function() {

    play.getGame(id).then(r => {

      if (r && !r.response) {
        res.end('{"response": "done"}');
        clearInterval(t);
      }
    })

  }, 800)
})


function _endRequest(name, r, res) {
  let rt = r.request;
  if (rt && rt.coordinates && rt.from != name) {
    answer = {
      response: {
        coordinates: {
          x: rt.coordinates.x,
          y: rt.coordinates.y
        }
      }
    };
    res.end(JSON.stringify(answer));
    return true;
  }
  return false;
}


// Register a new game
app.get('/games/new/:name', function(req, res) {
  console.log('Player ' + req.params.name.slice(8) + ' waiting for game');

  let answer = {};

  if (queue.length > 0) { // start a game if there are people waiting
    if (queue.length > 1) {
      answer.error = 'too many players';
      res.end(JSON.stringify(answer));
      return;
    }
    let enemyName = queue[0];

    queue.push(req.params.name);

    play.game([enemyName, req.params.name])
      .then(function(id) {

        resp[enemyName] = id.toString();

        // set answer values
        answer.response = {
          id: resp[enemyName],
          enemyName: enemyName,
          initiative: 1
        };

        res.end(JSON.stringify(answer)); // send id to client
        // 1 means it goes second
        return;
      })
      .catch(err => console.log('Error: ' + err));

  } else {
    console.log(req.params.name);
    queue.push(req.params.name)
    let t = setInterval(function() {
      if (resp[req.params.name]) { // you were added to a game

        clearInterval(t);

        let enemyName = queue.splice(0, 2)[1];

        // set answer values
        answer.response = {
          id: resp[req.params.name],
          enemyName: enemyName,
          initiative: 0
        };

        res.end(JSON.stringify(answer)); // send id to client
        // 0 means it goes first
        return;
      }
    }, 100)
  }
})

// list the games running
app.get('/games', function(req, res) {
  play.list().then((data) => {
    res.render('games.ejs', {
      games: data
    });
  })
})

app.listen(port, () => console.log(`App listening on port ${port}.`))
//188.244.22.148
