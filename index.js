const express = require('express');
const app = express();
const db = require('./data/connection.js');
const port = 3000;
const play = require('./data/games.js')();
// const ejs = require('ejs')

var queue = [];
var resp;

play.restore();
// play.drop(db)

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')

// player waiting for response
// wait for hit info and get it
app.get('/games/resp/:id/:name', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;

  play.getGame(id).then((r) => {

    // Validation
    if (!r) res.end('no such game')
    else if (!r.players.includes(name)) res.end('not in this game')
    else if (r.request && r.request.from != name) res.end('send request')
    else {
        let i = r.players[0] == name ? 0 : 1;
        if (r.initiative != i) res.end('not your turn')
      else {

        // No discrepancy found (data is valid)
        let rt = r.response;
        if (rt && rt.from != name) {
          res.end(rt.hit);
          play.pass(id, r.players[0] == name ? 1 : 0);
          return;
        }

        // Repeat without the check (validation)
        let t = setInterval(function() {
          play.getGame(id).then((r) => {
            let rt = r.response;
            if (rt && rt.from != name) {
              clearInterval(t);
              res.end(rt.hit);
              play.pass(id, r.players[0] == name ? 1 : 0);
              return;
            }
          })
        }, 600)
      }
    }
  })
})


// player sending a response
app.get('/games/resp/:id/:name/:hit', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;
  let hit = req.params.hit;

  play.getGame(id).then(function(r) {

    // Validation
    if (!r) res.end('no such game')
    else if (!r.players.includes(name)) res.end('you are not in this game')
    else if (r.response && r.response.from == name) res.end('already responded')
    // else if (r.request && r.request.from == name) res.end('you must wait for response')
    else {
      let i = r.players[0] == name ? 0 : 1;
      if (r.initiative == i) res.end('your turn')

      // Save response to db
      else play.inter(id, { type: 'response', body: {
        from: name,
        hit: hit
      }}).then(r => {
        console.log('saved');
        res.end('success')
      })
    }
  })


})


// Shoot a tile (send a request)
app.get('/games/req/:id/:name/:x/:y', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;
  let x = req.params.x;
  let y = req.params.y;

  play.getGame(id).then((r) => {

    // Validation
    if (!r) res.end('no such game')
    else if (!r.players.includes(name)) res.end('you are not in this game')
    else if (r.request && r.request.from == name) res.end('request already sent')
    // else if (r.response && r.response.from != name) res.end('response first')
    else {
      console.log(r.players[0]);
      let i = r.players[0] == name ? 0 : 1;
      if (r.initiative != i) res.end('not your turn')

      // send Request
      else play.inter(id, { type: 'request', body: {
        from: name,
        coordinates: {
          x: x,
          y: y
        }
      }}).then((r) => {
        if (r) res.end('success');
      })
    }
  })
})


// Wait for request and get it
// (Get coordinates of the tile being shot)
app.get('/games/req/:id/:name', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;

  play.getGame(id).then((r) => {

    // Validation
    if (!r) res.end('no such game')
    else if (!r.players.includes(name)) res.end('not in this game')
    else if (r.response && r.response.from == name) res.end('wait for response')
    else {
        let i = r.players[0] == name ? 0 : 1;
        if (r.initiative == i) res.end('your turn to atack')
      else {

        // No discrepancy found (data is valid)
        let rt = r.request;
        if (rt && rt.coordinates) {
          res.end('#' + rt.coordinates.x + ',' + rt.coordinates.y);
          return;
        }

        // Repeat without the check (validation)
        let t = setInterval(function() {
          play.getGame(id).then((r) => {
            let rt = r.request;
            if (rt && rt.from != name) {
              res.end('#' + rt.coordinates.x + ',' + rt.coordinates.y);
              clearInterval(t);
              return;
            }
          })
        }, 600)
      }
    }
  })
})


// Register a new game
app.get('/games/new/:name', function(req, res) {
  console.log('Player ' + req.params.name + ' waiting for game');
  if (queue.length > 0) { // start a game if there are people waiting
    play.game([queue.splice(0, 1), req.params.name])
      .then(function(id) {
        resp = id;
        res.end('#' + resp.toString() + ',1'); // send id to client
        // 1 means it goes second
      });
  } else {
    queue.push(req.params.name)
    let t = setInterval(function() {
      if (resp) { // you were added to a game
        clearInterval(t);
        res.end('#' + resp.toString() + ',0'); // send id to client
        // 0 means it goes first
      }
    }, 100)
  }
})

// list the games running
app.get('/games', function(req, res) {
  play.list().then((data) => {
    console.log(data);
    res.render('games.ejs', { games: data });
  })
})

app.listen(port, () => console.log(`App listening on port ${port}.`))
