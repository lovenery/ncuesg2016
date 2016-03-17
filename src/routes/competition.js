var express = require('express');
var router = express.Router();
var async = require('async');
var Competition = require('../models/competition');
var Team = require('../models/team');
var User = require('../models/user');
//var sanitize = require('../lib/sanitize');
var gameList = [
  "英雄聯盟",
  "爐石戰記：魔獸英雄傳",
  "星海爭霸II：虛空之遺",
  "AVA戰地之王",
  "英雄聯盟-中路單挑"
];

var timeList = [
  //初賽
  "2016-03-07 19:00:00",
  "2016-03-07 20:00:00",
  "2016-03-07 21:00:00",
  "2016-03-07 22:00:00",
  "2016-03-07 23:00:00",
  "2016-03-08 19:00:00",
  "2016-03-08 20:00:00",
  "2016-03-08 21:00:00",
  "2016-03-08 22:00:00",
  "2016-03-08 23:00:00",
  "2016-03-09 19:00:00",
  "2016-03-09 20:00:00",
  "2016-03-09 21:00:00",
  "2016-03-09 22:00:00",
  "2016-03-09 23:00:00",
  "2016-03-10 19:00:00",
  "2016-03-10 20:00:00",
  "2016-03-10 21:00:00",
  "2016-03-10 22:00:00",
  "2016-03-10 23:00:00",
  "2016-03-11 19:00:00",
  "2016-03-11 20:00:00",
  "2016-03-11 21:00:00",
  "2016-03-11 22:00:00",
  "2016-03-11 23:00:00",

  "2016-03-12 09:00:00",
  "2016-03-12 10:00:00",
  "2016-03-12 11:00:00",
  "2016-03-12 12:00:00",
  "2016-03-12 13:00:00",
  "2016-03-12 14:00:00",
  "2016-03-12 15:00:00",
  "2016-03-12 16:00:00",
  "2016-03-12 17:00:00",
  "2016-03-12 18:00:00",
  "2016-03-12 19:00:00",
  "2016-03-12 20:00:00",
  "2016-03-12 21:00:00",
  "2016-03-12 22:00:00",
  "2016-03-12 23:00:00",
  "2016-03-13 09:00:00",
  "2016-03-13 10:00:00",
  "2016-03-13 11:00:00",
  "2016-03-13 12:00:00",
  "2016-03-13 13:00:00",
  "2016-03-13 14:00:00",
  "2016-03-13 15:00:00",
  "2016-03-13 16:00:00",
  "2016-03-13 17:00:00",
  "2016-03-13 18:00:00",
  "2016-03-13 19:00:00",
  "2016-03-13 20:00:00",
  "2016-03-13 21:00:00",
  "2016-03-13 22:00:00",
  "2016-03-13 23:00:00",

  "2016-03-14 19:00:00",
  "2016-03-14 20:00:00",
  "2016-03-14 21:00:00",
  "2016-03-14 22:00:00",
  "2016-03-14 23:00:00",
  "2016-03-15 19:00:00",
  "2016-03-15 20:00:00",
  "2016-03-15 21:00:00",
  "2016-03-15 22:00:00",
  "2016-03-15 23:00:00",

  //複賽
  "2016-03-17 19:00:00",
  "2016-03-17 20:00:00",
  "2016-03-17 21:00:00",
  "2016-03-17 22:00:00",
  "2016-03-17 23:00:00",
  "2016-03-18 19:00:00",
  "2016-03-18 20:00:00",
  "2016-03-18 21:00:00",
  "2016-03-18 22:00:00",
  "2016-03-18 23:00:00",
  "2016-03-19 19:00:00",
  "2016-03-19 20:00:00",
  "2016-03-19 21:00:00",
  "2016-03-19 22:00:00",
  "2016-03-19 23:00:00",
  "2016-03-20 19:00:00",
  "2016-03-20 20:00:00",
  "2016-03-20 21:00:00",
  "2016-03-20 22:00:00",
  "2016-03-20 23:00:00",
  "2016-03-21 19:00:00",
  "2016-03-21 20:00:00",
  "2016-03-21 21:00:00",
  "2016-03-21 22:00:00",
  "2016-03-21 23:00:00",
  "2016-03-22 19:00:00",
  "2016-03-22 20:00:00",
  "2016-03-22 21:00:00",
  "2016-03-22 22:00:00",
  "2016-03-22 23:00:00",
  "2016-03-23 19:00:00",
  "2016-03-23 20:00:00",
  "2016-03-23 21:00:00",
  "2016-03-23 22:00:00",
  "2016-03-23 23:00:00",
  "2016-03-24 19:00:00",
  "2016-03-24 20:00:00",
  "2016-03-24 21:00:00",
  "2016-03-24 22:00:00",
  "2016-03-24 23:00:00",

  //new time
  "2016-03-20 14:00:00",
  "2016-03-17 18:00:00"
];

//done
router.get('/', function(req, res) {
  var finished = 0;
  var query = {'winner': -1};
  if (req.query.old && req.query.old == 1) {
      finished = 1;
      query = {$or: [{'winner':0}, {'winner':1}]};
  }
  // async wait for all task to be done.
  async.parallel(
    {
      lolcomps: function(cb) {
        var qlol = query;
        qlol.gametype=0;
        Competition.find(qlol).sort({'time': 1}).populate('team1').populate('team2').exec(function(err, com) {
          cb(null, com);
        });
      },
      hscomps: function(cb) {
        var qhs = query;
        qhs.gametype=1;
        Competition.find(qhs).sort({'time': 1}).populate('team1').populate('team2').exec(function(err, com) {
          cb(null, com);
        });
      },
      sc2comps: function(cb) {
        var qsc2 = query;
        qsc2.gametype=2;
        Competition.find(qsc2).sort({'time': 1}).populate('team1').populate('team2').exec(function(err, com) {
          cb(null, com);
        });
      },
      avacomps: function(cb) {
        var qava = query;
        qava.gametype=3;
        Competition.find(qava).sort({'time': 1}).populate('team1').populate('team2').exec(function(err, com) {
          cb(null, com);
        });
      },
      lolscomps: function(cb) {
        var qlols = query;
        qlols.gametype=4;
        Competition.find(qlols).sort({'time': 1}).populate('team1').populate('team2').exec(function(err, com) {
          cb(null, com);
        });
      },
    },
    function(err, result) {
      res.render('competitions', {
        user: req.user,
        lolcomps: result.lolcomps,
        hscomps: result.hscomps,
        sc2comps: result.sc2comps,
        avacomps: result.avacomps,
        lolscomps: result.lolscomps,
        finished: finished,
        times: timeList
      });
    }
  );
});

router.post('/team-type', function(req, res) {
  Team.find({'game': req.body.game}, function(err, tem) {
    var opt = '';
    for(var i in tem) {
      opt += '<div class="item" data-value="' + tem[i].id + '">' + tem[i].name + '</div>'   
    }
    var result = 
            '<div class="field"><label>Team A</label><div class="options ui selection dropdown"><input type="hidden" name="team1"><div class="default text">Team A</div><i class="dropdown icon"></i><div class="menu">'+opt+'</div></div></div>' + 
            '<div class="field"><label>Team B</label><div class="options ui selection dropdown"><input type="hidden" name="team2"><div class="default text">Team B</div><i class="dropdown icon"></i><div class="menu">'+opt+'</div></div></div>';
      res.json(result);
  });
});

//done
router.get('/new', isAdmin, function(req, res) {
  res.render('competition_new', {
    user: req.user,
    gametypes: gameList,
    times: timeList,
  });
});

router.get('/:id', function(req, res) {
  Competition.findById(req.params.id).populate('team1').populate('team2').exec(function(err, com) {
    if (err || !com) {
      res.redirect('/competition');
      return;
    }
    res.render('competition', {
      user: req.user,
      com: com,
      game: gameList[com.gametype],
      time: timeList[com.time]
    });
  });
});

router.get('/:id/edit', isAdmin, function(req, res) {
  Competition.findById(req.params.id).populate('team1').populate('team2').exec(function(err, com) {
    if (com) {
      Team.find({'game': com.gametype}).exec(function(err, tem) {
        res.render('competition_edit', {
          user: req.user,
          gametypes: gameList,
          competition: com,
          times: timeList,
          teams: tem,
          messages: req.flash('info')
        });
      });
    } else {
      res.redirect('/competition');
    }
  });
});

// todo: fix time, and team1 & team2 has bug?
router.post('/new', isAdmin, function(req, res) {
  var com = new Competition();
  com.gametype = req.body.gametype;
  com.comp_type = req.body.comp_type;
  Team.findById(req.body.team1, function(err, team1) {
    com.team1 = team1;
    Team.findById(req.body.team2, function(err, team2) {
      com.team2 = team2;
      com.finished = 0; // default: not finished
      com.time = req.body.time;
      com.winner = -1;
      com.replay_url = '無';
      com.save();
      team1.competitions.push(com);
      team2.competitions.push(com);
      team1.save();
      team2.save();
      res.redirect('/competition');
    })
  });
});

router.post('/:id/edit', isAdmin, function(req, res) {
  Competition.findById(req.params.id, function(err, com) {
    com.gametype = req.body.gametype;
    com.comp_type = req.body.comp_type;
    com.team1 = req.body.team1;
    com.team2 = req.body.team2;
    com.time = req.body.time;
    com.replay_url = req.body.replay_url;
    com.winner = req.body.winner;
    com.save();
    req.flash('info', '已修改賽事');
    res.redirect('/competition/'+req.params.id+'/edit');
  });
});

router.get('/:id/delete', isAdmin, function(req, res) {  
  Competition.findById(req.params.id, function(err, com) {
    var i, index;
    Team.findById(com.team1, function(err, team1) {
      index = -1;
      for(i=0;i<team1.competitions.length;++i) {
        if (team1.competitions[i].id == com.id) {
          index = i;
          break;
        }
      }
      if (index > -1) {
        team1.competitions.splice(index, 1);
        team1.markModified('competitions');
        team1.save();
      }
      Team.findById(com.team2, function(err, team2) {
        index = -1;
        for(i=0;i<team2.competitions.length;++i) {
          if (team2.competitions[i].id == com.id) {
            index = i;
            break;
          }
        }
        if (index > -1) {
          team2.competitions.splice(index, 1);
          team2.markModified('competitions');
          team2.save();
        }
        com.remove();
        res.redirect('/competition');
      })
    });
  });
});

module.exports = router;

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.local.level > 0)
    return next();
  else
    res.redirect('/competition');
}
