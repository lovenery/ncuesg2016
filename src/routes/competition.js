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
  "AVA戰地之王",
  "英雄聯盟-中路單挑"
];

var timeList = [
  //初賽
  "2016-11-28 19:00:00",
  "2016-11-28 20:00:00",
  "2016-11-28 21:00:00",
  "2016-11-28 22:00:00",
  "2016-11-28 23:00:00",
  "2016-11-29 19:00:00",
  "2016-11-29 20:00:00",
  "2016-11-29 21:00:00",
  "2016-11-29 22:00:00",
  "2016-11-29 23:00:00",
  "2016-11-30 19:00:00",
  "2016-11-30 20:00:00",
  "2016-11-30 21:00:00",
  "2016-11-30 22:00:00",
  "2016-11-30 23:00:00",
  "2016-12-01 19:00:00",
  "2016-12-01 20:00:00",
  "2016-12-01 21:00:00",
  "2016-12-01 22:00:00",
  "2016-12-01 23:00:00",
  "2016-12-02 19:00:00",
  "2016-12-02 20:00:00",
  "2016-12-02 21:00:00",
  "2016-12-02 22:00:00",
  "2016-12-02 23:00:00",

  "2016-12-03 09:00:00",
  "2016-12-03 10:00:00",
  "2016-12-03 11:00:00",
  "2016-12-03 12:00:00",
  "2016-12-03 13:00:00",
  "2016-12-03 14:00:00",
  "2016-12-03 15:00:00",
  "2016-12-03 16:00:00",
  "2016-12-03 17:00:00",
  "2016-12-03 18:00:00",
  "2016-12-03 19:00:00",
  "2016-12-03 20:00:00",
  "2016-12-03 21:00:00",
  "2016-12-03 22:00:00",
  "2016-12-03 23:00:00",
  "2016-12-04 09:00:00",
  "2016-12-04 10:00:00",
  "2016-12-04 11:00:00",
  "2016-12-04 12:00:00",
  "2016-12-04 13:00:00",
  "2016-12-04 14:00:00",
  "2016-12-04 15:00:00",
  "2016-12-04 16:00:00",
  "2016-12-04 17:00:00",
  "2016-12-04 18:00:00",
  "2016-12-04 19:00:00",
  "2016-12-04 20:00:00",
  "2016-12-04 21:00:00",
  "2016-12-04 22:00:00",
  "2016-12-04 23:00:00",

  "2016-12-05 19:00:00",
  "2016-12-05 20:00:00",
  "2016-12-05 21:00:00",
  "2016-12-05 22:00:00",
  "2016-12-05 23:00:00",
  "2016-12-06 19:00:00",
  "2016-12-06 20:00:00",
  "2016-12-06 21:00:00",
  "2016-12-06 22:00:00",
  "2016-12-06 23:00:00",
  "2016-12-07 19:00:00",
  "2016-12-07 20:00:00",
  "2016-12-07 21:00:00",
  "2016-12-07 22:00:00",
  "2016-12-07 23:00:00",
  "2016-12-08 19:00:00",
  "2016-12-08 20:00:00",
  "2016-12-08 21:00:00",
  "2016-12-08 22:00:00",
  "2016-12-08 23:00:00",
  "2016-12-09 19:00:00",
  "2016-12-09 20:00:00",
  "2016-12-09 21:00:00",
  "2016-12-09 22:00:00",
  "2016-12-09 23:00:00",

  //複賽
  "2016-12-10 09:00:00",
  "2016-12-10 10:00:00",
  "2016-12-10 11:00:00",
  "2016-12-10 12:00:00",
  "2016-12-10 13:00:00",
  "2016-12-10 14:00:00",
  "2016-12-10 15:00:00",
  "2016-12-10 16:00:00",
  "2016-12-10 17:00:00",
  "2016-12-10 18:00:00",
  "2016-12-10 19:00:00",
  "2016-12-10 20:00:00",
  "2016-12-10 21:00:00",
  "2016-12-10 22:00:00",
  "2016-12-10 23:00:00",
  "2016-12-11 09:00:00",
  "2016-12-11 10:00:00",
  "2016-12-11 11:00:00",
  "2016-12-11 12:00:00",
  "2016-12-11 13:00:00",
  "2016-12-11 14:00:00",
  "2016-12-11 15:00:00",
  "2016-12-11 16:00:00",
  "2016-12-11 17:00:00",
  "2016-12-11 18:00:00",
  "2016-12-11 19:00:00",
  "2016-12-11 20:00:00",
  "2016-12-11 21:00:00",
  "2016-12-11 22:00:00",
  "2016-12-11 23:00:00",
  "2016-12-12 19:00:00",
  "2016-12-12 20:00:00",
  "2016-12-12 21:00:00",
  "2016-12-12 22:00:00",
  "2016-12-12 23:00:00",
  "2016-12-13 19:00:00",
  "2016-12-13 20:00:00",
  "2016-12-13 21:00:00",
  "2016-12-13 22:00:00",
  "2016-12-13 23:00:00",
  "2016-12-14 19:00:00",
  "2016-12-14 20:00:00",
  "2016-12-14 21:00:00",
  "2016-12-14 22:00:00",
  "2016-12-14 23:00:00",
  "2016-12-15 19:00:00",
  "2016-12-15 20:00:00",
  "2016-12-15 21:00:00",
  "2016-12-15 22:00:00",
  "2016-12-15 23:00:00",
  "2016-12-16 19:00:00",
  "2016-12-16 20:00:00",
  "2016-12-16 21:00:00",
  "2016-12-16 22:00:00",
  "2016-12-16 23:00:00",

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
