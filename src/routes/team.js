var express = require('express');
var fs = require('fs');
var router = express.Router();
var Team = require('../models/team');
var User = require('../models/user');
var Code = require('../models/code');
var async = require('async');
var sanitize = require('../lib/sanitize');
var multer = require('multer');
var maxFileSize = 1024*1024;

var gameList = [
  "英雄聯盟",
  "爐石戰記：魔獸英雄傳",
  "星海爭霸II：虛空之遺",
  //"AVA戰地之王",
  "鬥陣特攻",
  "英雄聯盟-中路單挑"
];

var departmentList = [
  "placeholder",
  "校外人士",
  "中國文學系",
  "英美語文學系",
  "法國語文學系",
  "理學院學士班",
  "物理學系",
  "數學系",
  "化學學系",
  "生命科學系",
  "光電科學與工程學系",
  "化學工程與材料工程學系",
  "土木工程學系",
  "機械工程學系",
  "企業管理學系",
  "資訊管理學系",
  "財務金融學系",
  "經濟學系",
  "電機工程學系",
  "資訊工程學系",
  "通訊工程學系",
  "地球科學學系",
  "大氣科學學系"
];

var gradeList = [
  "placeholder",
  "1年級",
  "2年級",
  "3年級",
  "4年級",
  "碩士",
  "博士"
];

var tryout= [
      {index: 0, datetime: "11/28(一)"},
      {index: 1, datetime: "11/29(二)"},
      {index: 2, datetime: "11/30(三)"},
      {index: 3, datetime: "12/1(四)"},
      {index: 4, datetime: "12/2(五)"},
      {index: 5, datetime: "12/3(六)"},
      {index: 6, datetime: "12/4(日)"},
      {index: 7, datetime: "12/5(一)"},
      {index: 8, datetime: "12/6(二)"},
      {index: 9, datetime: "12/7(三)"},
      {index: 10, datetime: "12/8(四)"},
      {index: 11, datetime: "12/9(五)"},
    ],
    tryout_times= [
      {index: 0, time: "19:00"},
      {index: 1, time: "20:00"},
      {index: 2, time: "21:00"},
      {index: 3, time: "22:00"},
      {index: 4, time: "23:00"}
    ],
    intermediary= [
      {index: 0, datetime: "12/10(六)"},
      {index: 1, datetime: "12/11(日)"},
      {index: 2, datetime: "12/12(一)"},
      {index: 3, datetime: "12/13(二)"},
      {index: 4, datetime: "12/14(三)"},
      {index: 5, datetime: "12/15(四)"},
      {index: 6, datetime: "12/16(五)"}
    ],
    intermediary_times= [
      {index: 0, time: "19:00"},
      {index: 1, time: "20:00"},
      {index: 2, time: "21:00"},
      {index: 3, time: "22:00"},
      {index: 4, time: "23:00"}
    ];

router.get('/', function(req, res) {
  // async wait for all task to be done.
  async.parallel(
    {
      lolTeams: function(cb) {
        Team.find({'game':0}).populate('leader').populate('member').exec(function(err, team) {
          cb(null, team);
        });
      },
      hsTeams: function(cb) {
        Team.find({'game':1}).populate('leader').populate('member').exec(function(err, team) {
          cb(null, team);
        });
      },
      scTeams: function(cb) {
        Team.find({'game':2}).populate('leader').populate('member').exec(function(err, team) {
          cb(null, team);
        });
      },
      avaTeams: function(cb) {
        Team.find({'game':3}).populate('leader').populate('member').exec(function(err, team) {
          cb(null, team);
        });
      },
      lolsTeams: function(cb) {
        Team.find({'game':4}).populate('leader').populate('member').exec(function(err, team) {
          cb(null, team);
        });
      },
    },
    function(err, result) {
      res.render('teams', {
        user: req.user,
        lolTeams: result.lolTeams,
        hsTeams: result.hsTeams,
        sc2Teams: result.scTeams,
        avaTeams: result.avaTeams,
        lolsTeams: result.lolsTeams
      });
    }
  );
});

router.get('/:id/unlink', isLoggedIn, function(req, res) {
  // kick myself
  Team.findById(req.params.id).populate('leader').populate('member').exec(function(err, team) {
    if (err || !team || team.leader.id == req.user.id) {
      res.redirect('/team/dashboard');
      return;
    }
    var index = -1;
    for(var i = 0; i < team.member.length; ++i) {
      if (team.member[i].id == req.user.id) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      team.member.splice(index, 1);
    }
    team.markModified('member');
    team.save();
    User.findById(req.user.id, function(err, doc) {
      doc.local.team[team.game] = null;
      doc.markModified('local.team');
      doc.save();
      res.redirect('/team/dashboard');
    });
  });
});

router.get('/new', isLoggedIn, function(req, res) {
  var game = req.query.gametype;
  var gametype = 0;
  if (game === 'hs') gametype = 1;
  else if (game === 'sc2') gametype = 2;
  else if (game === 'ava') gametype = 3;
  else if (game === 'lols') gametype = 4;
  res.render('team_new', {
    user: req.user,
    game: gametype,
    errorMessage: req.flash('newteamMessage')
  });
});


var uploadHead = multer({
  dest: './public/uploads',
  onFileUploadStart: function (file, req, res) {
    console.log(file.fieldname + ' is starting ...');
    if (file.extension != 'jpg' &&
        file.extension != 'jpeg' &&
        file.extension != 'png' &&
        file.extension != 'bmp') {
      console.log(file.filename + ' upload failed. incorrect file extension.')
      req.uploadedName = "";
      return false;
    }
  },
  onFileUploadComplete: function (file, req, res) {
    req.uploadedName = file.name;
    console.log(file.fieldname + ' uploaded to  ' + file.path);
  }
});

router.post('/:id/edit', isLoggedIn, isAdmin, uploadHead, function(req, res) {
  req.authTeam.name = sanitize(req.body.name);
  req.authTeam.intro = sanitize(req.body.intro);
  if (req.uploadedName != undefined) {
    req.authTeam.head = req.uploadedName;
  }
  req.authTeam.tryout = Array.apply(null, Array(45)).map(function() {return false;});
  req.authTeam.intermediary = Array.apply(null, Array(40)).map(function() {return false;});
  var tryout = req.body.tryout;
  var intermediary = req.body.intermediary;
  for(var key in tryout) {
    req.authTeam.tryout[tryout[key]] = true;
  }
  for(var key in intermediary) {
    req.authTeam.intermediary[intermediary[key]] = true;
  }
  req.authTeam.markModified('tryout');
  req.authTeam.markModified('intermediary');
  req.authTeam.save(function(err) {
    if (err && err.code == 11000) {
      req.flash('editTeamErrorMessage', '隊伍名稱重複了');
    } else {
      req.flash('editTeamMessage', '修改成功');
    }
    res.redirect('/team/' + req.params.id + '/edit');
  });
});

router.get('/dashboard', isLoggedIn, function(req, res) {
  async.parallel(
    {
      lol: function(cb) {
        if (req.user.local.team[0] == null) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.team[0]).populate('leader').populate('member').exec(function(err, team) {
            cb(null, team);
          });
        }
      },
      hs: function(cb) {
        if (req.user.local.team[1] == null) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.team[1]).populate('leader').populate('member').exec(function(err, team) {
            cb(null, team);
          });
        }
      },
      sc2: function(cb) {
        if (req.user.local.team[2] == null) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.team[2]).populate('leader').populate('member').exec(function(err, team) {
            cb(null, team);
          });
        }
      },
      ava: function(cb) {
        if (req.user.local.team[3] == null) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.team[3]).populate('leader').populate('member').exec(function(err, team) {
            cb(null, team);
          });
        }
      },
      lols: function(cb) {
        if (req.user.local.team[4] == null) {
          cb(null, false);
        } else {
          Team.findById(req.user.local.team[4]).populate('leader').populate('member').exec(function(err, team) {
            cb(null, team);
          });
        }
      },
    },
    function(err, result) {
      res.render('dashboard', {
        user: req.user,
        team: result,
      });
    }
  );
});

router.get('/:id', isLoggedIn, function(req, res) {
  Team.findById(req.params.id).populate('leader').populate('member').populate('competitions').exec(function(err, team) {
    if (err || !team) {
      res.redirect('/team');
      return;
    }
    var options = {
      path: 'competitions.team1 competitions.team2',
      model: 'Team'
    };
    Team.populate(team, options, function(err, t) {
      res.render('team', {
        user: req.user,
        team: t,
        gameToName: gameList,
        times:  [
                  //初賽
                  "預賽第一場",
                  "預賽第二場",
                  "預賽第三場",
                  "預賽第四場",
                  "預賽第五場",
  
                  //複賽
                  "複賽第一場",
                  "複賽第二場",
                  "複賽第三場",
                  "複賽第四場",
                  "複賽第五場"
        ]
      });
    });
  });
});

router.post('/:id/kick', isLoggedIn, isAdmin, function(req, res) {
  User.findById(req.body.target, function(err, doc) {
    var index = -1;
    for(var i = 0; i < req.authTeam.member.length; ++i) {
      if (req.authTeam.member[i].id == doc.id) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      req.authTeam.member.splice(index, 1);
    }
    req.authTeam.markModified('member');
    req.authTeam.save();
    doc.local.team[req.authTeam.game] = null;
    doc.markModified('local.team');
    doc.save(function(err, user) {
      res.json({
        ok: true,
        msg: '成功將隊員退出組隊'
      });
    });
  });
});

router.get('/:id/edit', isLoggedIn, isAdmin, function(req, res) {
  var gameToName = ['英雄聯盟',
                    '爐石戰記',
                    '星海爭霸2-虛空之遺',
                    //'AVA戰地之王'
                    '鬥陣特攻',
                    '英雄聯盟-中路單挑'];
  res.render('team_edit', {
    user: req.user,
    team: req.authTeam,
    gameName: gameToName[req.authTeam.game],
    editTeamMessage: req.flash('editTeamMessage'),
    editTeamErrorMessage: req.flash('editTeamErrorMessage'),
    tryout: tryout,
    tryout_times: tryout_times,
    intermediary: intermediary,
    intermediary_times: intermediary_times
  });
});


router.post('/new', isLoggedIn, function(req, res) {
  // check if this user has joined req.body.gametype
  var gametypeToString = ['lol', 'hs', 'sc2', 'ava' , 'lols'];
  if (req.user.local.team[req.body.gametype] != undefined) {
    req.flash('newteamMessage', '你已經在此遊戲有加入隊伍了');
    res.redirect('/team/new?gametype='+gametypeToString[req.body.gametype]);
    return;
  } else if (req.body.gametype >= 0 && req.body.gametype <= 4) {
    Code.findById(req.body.regcode, function(err, code) {
      if (err || !code || code.used == true || !priceCheck(req.body.gametype, code.price)) {
        req.flash('newteamMessage', '啟動碼錯誤');
        res.redirect('/team/new?gametype='+gametypeToString[req.body.gametype]);
      } else {
        var newTeam = new Team();
        newTeam.name = sanitize(req.body.name);
        newTeam.game = Number(sanitize(req.body.gametype));
        newTeam.intro = sanitize(req.body.intro);
        newTeam.leader = req.user;
        newTeam.head = "";
        newTeam.tryout = Array.apply(null, Array(45)).map(function() {return true;});
        newTeam.intermediary = Array.apply(null, Array(40)).map(function() {return true;});
        newTeam.save(function(err, team) {

          if (err && err.code == 11000) {
            req.flash('newteamMessage', '隊伍名稱重複了');
            res.redirect('/team/new?gametype='+gametypeToString[req.body.gametype]);
            return;
          }

          code.used = true;
          code.updated = new Date();
          code.team = team.id;
          code.save();
          User.findById(req.user.id, function(err, doc) {
            doc.local.team[team.game] = team._id;
            doc.markModified('local.team');
            doc.save(function(err, user) {
              req.flash('editTeamMessage', '隊伍創建成功，請記得填寫相關資料');
              res.redirect('/team/'+team.id+'/edit');
            });
          });
        });
      }
    });
  }
});

router.post('/:id/addmember', isLoggedIn, isAdmin, function(req, res) {
  User.findOne({'local.email': req.body.email}, function(err, user) {
    if (err || !user) {
      res.json({ok:false, msg: '找不到該使用者'});
      return;
    }
    if (user.local.team[req.authTeam.game] != null) {
      res.json({ok:false, msg: '該玩家在同一個遊戲中已經有加入其他隊伍'});
      return;
    }
    var full = req.authTeam.isFull();
    if (full != false) {
      res.json({ok:false, msg: full});
      return;
    }
    user.local.team[req.authTeam.game] = req.authTeam.id;
    user.markModified('local.team');
    req.authTeam.member.push(user);
    user.save();
    req.authTeam.save();
    res.json({
      ok:true, 
      msg:'隊員加入成功',
      addedUser: {
        id: user.id,
        name: user.local.name,
        email: user.local.email
      }
    });
  });
});

router.get('/all/:game', isStaff, function(req, res) {
  var gametype = 0;
  if (req.params.game && req.params.game >=0 && req.params.game <= 4) {
    gametype = req.params.game;
  }
  Team.find({'game':gametype}).populate('leader').populate('member').exec(function(err, teams) {
    res.render('allteams', {
      user: req.user,
      teams: teams,
      game: gametype,
      gametype: gameList[gametype],
      tryout: tryout,
      tryout_times: tryout_times,
      departmentToName: departmentList,
      gradeToName: gradeList,
      intermediary: intermediary,
      intermediary_times: intermediary_times
    });
  });
});

function isStaff(req, res, next) {
  if (req.isAuthenticated() && req.user.local.level > 0) {
    return next();
  }
  res.redirect('/');
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  Team.findById(req.params.id).populate('leader').populate('member').exec(function(err, team) {
    if (err || !team) {
      res.redirect('/team/dashboard');
      return;
    }
    if (team.leader.id == req.user.id || req.user.local.level >= 10) {
      req.authTeam = team;
      return next();
    } else {
      res.redirect('/team/dashboard');
    }
  });
}

function priceCheck(gametype, price) {
  var priceTable = [500, 100, 100, 600 , 100];
  return priceTable[gametype] == price;
}

module.exports = router;
