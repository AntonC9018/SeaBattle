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
            respond: null
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

    getGame: function(ID) {
      let id = ID.toString();
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

    respond: function(ID, respond) {

      let id = ID.toString();
      let done = false;
      let curr = this.runningGames;

      return new Promise(function(resolve, reject) {
        for (let i = 0; i < curr.length; i++) {
          if (curr[i] == id) {
            done = true;
            Game.findOneAndUpdate({ '_id': id },
              { respond: respond },
              function(err, res) {
                resolve(res);
                if (err) reject(err);
              })
          }
        }
      })
    },

    request: function(ID, request) {

    },

    dump: function() {
      return new Promise((resolve, reject) => {
        console.log('dump ');
        let result = [];
        let curr = this.runningGames;

        this._dump(0, result)
          .then(function(data) {
            // console.log(data);
            resolve(data);
          })
      })
    },

    // Recursive function
    _dump: function(index, result) {
      return new Promise((resolve, reject) => {
        Game.findOne({
          '_id': this.runningGames[index]
        }, (err, res) => {
          result.push(res);

          if (index === this.runningGames.length - 1) {
            resolve();
          } else {
            this._dump(index + 1, result).then(data => {
              resolve(result);
              if (err) reject(err);
            });
          }
        })
      })
    },

    debug: function() {
      console.log(this.runningGames);
    }
  }
}
