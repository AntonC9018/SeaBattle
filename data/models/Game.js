const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GameSchema = new Schema({
  players: [String], // nicknames
  turn: Number,
  initiative: Boolean, // 0 is first player 1 second
  // dynamic: {
    request: {
      // to: String,
      // from: String,
      // coordinates: {
      //   x: Number,
      //   y: Number
      // }
    },
    respond: {
      // to: String,
      // from: String,
      // hit: Boolean
    }
  // }
});
const game = mongoose.model('game', GameSchema);

module.exports = game;
