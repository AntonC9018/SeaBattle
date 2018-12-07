const express = require('express');
const app = express();
const db = require('./data/connection.js');
const port = 3000;
const play = require('./data/games.js')();
// const ejs = require('ejs')

let a = play.game(['I', 'You'], ['You', 'Me'])
  .then(function(id) {
    for (let i of id) {
      play.respond(i, {
        i: 'hello'
      })
    }
  });

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')

app.get('/games/:name', function(req, res) {

    res.end(req.params.name);
  if (req.params.name === null) {
  }
})
app.get('/games', function(req, res) {
  let text;
  play.dump().then((data, error) => {
    text = data.toString();
    res.render('games.ejs', { games: data })
    // req.write('<ul>')
    // for (let i = 0; i < text.length; i++) {
      // req.write('<li ')
    // }
  })
})
app.listen(port, () => console.log(`App listening on port ${port}.`))
