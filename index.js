const express = require('express');
const app = express();
const db = require('./data/connection.js');
const port = 3000;
const play = require('./data/games.js')();
// const ejs = require('ejs')

// let s = play.game(['I', 'You'], ['You', 'Me'])
//   .then(function(id) {
//     for (let i of id) {
//       play.respond(i, {
//         i: 'hello'
//       })
//     }
//   });
var queue = [];
var resp;

play.restore();
//play.drop(db)

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')

// player waiting for response
// wait for hit info
app.get('/games/wait/:id/:name', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;
  wait(id, name, true).then((result) => {
    if (typeof result == 'string') {
      res.end(result)
      return;
    } else {
      if (result && result.hit) {
        res.end(result.hit);
        return;
      }
      let t = setInterval(function() {
        wait(id, name).then((result) => {
          if (result) {
            res.end(result.respond.hit);
            clearInterval(t);
            return;
          }
        })
      }, 1000)
    }
  })

})


// player sending a response
app.get('/games/resp/:id/:name/:hit', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;
  let hit = req.params.hit;
  play.getGame(id).then(function(r) {
    if (!r) res.end('no such game')
    else if (!r.players.includes(name)) res.end('you are not in this game')
    else if (r.respond && r.respond.from == name) res.end('already responded')
    else if (r.request && r.request.from == name) res.end('already responded')
    else play.inter(id, { type: 'response', body: {
      from: name,
      hit: hit
    }}).then(res => {

    })
  })


})
var take = function(id, name, check) {
  return new Promise(function(resolve, reject) {
    play.getGame(id).then((res) => {
      if (!res) {
        resolve('no such game')
        return;
      }
      if (check) {
          let i = res.players[0] == name ? 0 : 1;
          if (res.initiative == i) {
            resolve('not your turn');
            return;
          }
      }
      if (res.respond) {
        resolve(res.respond);
        play.pass(id, res.players[0] == name ? 1 : 0)
      } else {
        resolve(null);
      }
    })
  })
}



var wait = function(id, name, check) {
  return new Promise(function(resolve, reject) {
    play.getGame(id).then((res) => {
      if (!res) {
        resolve('no such game')
        return;
      }
      if (check) {
          let i = res.players[0] == name ? 0 : 1;
          if (res.initiative == i) {
            resolve('not your turn');
            return;
          }
      }
      if (res.respond) {
        resolve(res.respond);
        play.pass(id, res.players[0] == name ? 1 : 0)
      } else {
        resolve(null);
      }
    })
  })
}


// Shoot at a tile
app.get('/games/send/:id/:name/:x/:y', function(req, res) {
  let id = req.params.id;
  let name = req.params.name;
  let x = req.params.x;
  let y = req.params.y;

  play.getGame(id).then((r) => {
    if (!r) res.end('no such game')
    else if (!r.players.includes(name)) res.end('you are not in this game')
    else if (r.request && r.request.from == name) res.end('already did the turn')
    else if (r.respond && r.respond.from != name) res.end('respond first')
    else play.inter(id, { type: 'request', body: {
      from: name,
      coordinates: {
        x: x,
        y: y
      }
    }}).then((r) => {
      if (r) res.end('success')
      else res.end('no such game or not your turn')
    })
  })

})

// Register a new game
app.get('/games/new/:name', function(req, res) {
  console.log('Player ' + req.params.name + ' waiting for game');
  if (queue.length > 0) { // start a game if there are people waiting
    play.game([queue.splice(0, 1), req.params.name])
      .then(function(id) {
        resp = id;
        res.end(resp.toString()); // send id to client
      });
  } else {
    queue.push(req.params.name)
    let t = setInterval(function() {
      if (resp) { // you were added to a game
        res.end(resp.toString());
        clearInterval(t);
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
