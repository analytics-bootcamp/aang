var g = require('../grammar')
var user = require('./user')
var stopWords = require('./stopWords')
var poss = require('./poss')

var followersSemantic = new g.Semantic({ name: 'followers', cost: 0.5 })
var usersFollowedSemantic = new g.Semantic({ name: user.namePl + '-followed', cost: 0.5 })

var follow = g.addVerb({
	symbol: new g.Symbol('follow'),
	oneOrPl: [ 'follow', 'subscribe to' ],
	threeSg: [ 'follows' ],
	past: [ 'followed' ],
	substitutions: [
		'have followed', // No "have followed" becuase implies no longer following?
		'following',
		'have|has|had been following',
		'am|is|are|were|was|be following',
		'subscribed to'
	]
})

// (people) followed by me
user.passive.addRule({ RHS: [ follow, user.byObjUsersPlus ], semantic: usersFollowedSemantic, verbForm: 'past' })
// (people) I follow
var preVerbStopWordsFollow = new g.Symbol('pre', 'verb', 'stop', 'words', 'follow')
preVerbStopWordsFollow.addRule({ RHS: [ stopWords.preVerbStopWords, follow ] })
user.objFilter.addRule({ RHS: [ user.nomUsersPlus, preVerbStopWordsFollow ], semantic: usersFollowedSemantic })
// (people who) follow me
user.subjFilter.addRule({ RHS: [ follow, user.objUsersPlus ], semantic: followersSemantic, personNumber: 'pl' })



var followersTerm = g.addWord({
	symbol: new g.Symbol('followers', 'term'),
	accepted: [ 'followers', 'subscribers' ]
})

// (my) followers; followers (of mine)
var userFollowersHead = new g.Symbol(user.nameSg, 'followers', 'head')
userFollowersHead.addRule({ RHS: [ user.companyOpt, followersTerm ] })

// my followers
var userFollowersPossessible = new g.Symbol(user.nameSg, 'followers', 'possessible')
userFollowersPossessible.addRule({ RHS: [ user.lhs, userFollowersHead ] })
user.noRelativePossessive.addRule({ RHS: [ poss.determinerOmissible, userFollowersPossessible ], semantic: followersSemantic })

// followers of mine
user.head.addRule({ RHS: [ userFollowersHead, poss.ofPossUsers ], semantic: followersSemantic })