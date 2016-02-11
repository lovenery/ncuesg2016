var mongoose = require('mongoose');
var shortId = require('shortid');
mongoose.connect('mongodb://localhost/esg');

var codeSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  price: Number,
  used: Boolean,
  created: Date,
  updated: Date,
  team: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
});

var Team = require('./team.js');
var User = require('./user.js');
var Code = mongoose.model('Code', codeSchema);

Code.find({"used": true}).populate("team").sort({"updated": 1}).exec(function(err, codes) {
	var sum = 0, i;

	/*for(i=0;i<52;++i) {
		User.findById(codes[i].team.leader, function(err, doc) {
			console.log(doc.local.email);
		});
		for(var j=0;j<codes[i].team.member.length;++j) {
			User.findById(codes[i].team.member[j], function(err, doc2) {
				console.log(doc2.local.email);
			});
		}
	}*/
console.log(codes[52].team.name);
	User.findById(codes[52].team.leader, function(err, doc) {
			console.log(doc.local.email);
			});
});
