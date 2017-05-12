var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
  game: Number,
  name: {type: String, index: { unique: true }},
  intro: String,
  head: String,
  leader: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  member: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  competitions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Competition'}],
  tryout: [Boolean],
  intermediary: [Boolean],
});

/* origin code

teamSchema.methods.isFull = function() {
  // lol, hs, sc, ava , lols
  // 0  , 1 , 2 , 3 , 4
  if ((this.game == 0 || this.game == 3) && this.member.length >= 5) 
    return "隊伍已經滿了";
  if (this.game == 1 || this.game == 2 ||  this.game == 4)
    return "only one player allowed";
  return false;
}

*/

// edit by JoNz94
teamSchema.methods.isFull = function() {
  // lol, hs, sc, ow, lols
  // 0  , 1 , 2 , 3 , 4
  if ((this.game == 0 && this.member.length >= 5) || (this.game == 3 && this.member.length >= 6)) 
    return "隊伍已經滿了";
  
  if (this.game == 1 || this.game == 2 ||  this.game == 4)
    return "only one player allowed";
  return false;
}

teamSchema.methods.removeMember = function(userId) {
  var index = this.member.indexOf(userId);
  if (index != -1) {
    this.member.splice(index, 1);
  }
}

module.exports = mongoose.model('Team', teamSchema);
