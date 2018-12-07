const Game = require('./models/Game.js')
module.exports = function(db) {
  return {
    // db: db,
    runningGames: [],
    game: function() {

      return new Promise((resolve, reject) => {

        if (arguments.length === 1) {
          let game = new Game({
            players: arguments[0], // nicknames
            turn: 0,
            initiative: 0, // 0 is first player 1 second
            request: null,
            respond: null,
            start: Date.now()
          });
          game.save((err, g) => {
            this.runningGames.push(g._id.toString());
            resolve(g._id.toString());
            if (err) resolve(err);
          })

        } else {
          this._game(Array.from(arguments))
            .then((res) => resolve(res))
        }
      })
    },

    // Recursive function
    _game: function(data, result) {
      if (!result) result = [];

      return new Promise((resolve, reject) => {

          this.game(data[0])
            .then((id) => {
              result.push(id);

              if (data.length === 1) {
                resolve(result);
              } else {
                this._game(data.slice(1), result)
                .then((res) => {
                  resolve(res);
                })
              }
            })
        })
    },

    getGame: function(id) {
      id = id.toString();
      let done = false;
      let curr = this.runningGames;

      return new Promise(function(resolve, reject) {
        for (let i = 0; i < curr.length; i++) {
          if (curr[i] == id) {
            done = true;
            Game.findOne({
              '_id': id
            }, function(err, res) {
              resolve(res);
              if (err) reject(err);
            })
          }
        }
        if (!done) resolve(null);
      })
    },

    inter: function(id, inter) {

      let type = inter.type;
      let body = inter.body;
      id = id.toString();
      let done = false;
      let curr = this.runningGames;

      return new Promise(function(resolve, reject) {
        for (let i = 0; i < curr.length; i++) {
          if (curr[i] == id) {
            done = true;
            let data = {};
            data[type] = body;
            Game.findOneAndUpdate({ '_id': id },
              data,
              function(err, res) {
                resolve(res);
                if (err) reject(err);
              })
          }
        }
        if (!done) resolve(null);
      })
    },

    wait: function(id) {

    },

    list: function() {
      return new Promise((resolve, reject) => {

        if (this.runningGames.length === 0) {
          resolve(null)
        } else {
          this._list(0, [])
            .then(function(data) {
              resolve(data);
            })
        }
      })
    },

    // Recursive function
    _list: function(index, result) {
      return new Promise((resolve, reject) => {
        Game.findOne({
          '_id': this.runningGames[index]
        }, (err, res) => {
          result.push(res);

          if (index === this.runningGames.length - 1) {
            resolve(result);
          } else {
            this._list(index + 1, result).then(data => {
              resolve(result);
              if (err) reject(err);
            });
          }
        })
      })
    },

    name: function(name) {

    },

    debug: function() {
      console.log(this.runningGames);
    },

    restore: function() {
      Game.find({}, (err, data) =>
      data.forEach(val => this.runningGames.push(val._id.toString())))
    },

    drop: function(db) {
      db.collections.games.drop();
    },

    pass: function(id, ini) {
      if (this.runningGames.includes(id)) {
        Game.findOneAndUpdate({ '_id': id }, { initiative: ini },
        err, res => {
          return res ? true : false;
        })
      }
    }
  }
}
