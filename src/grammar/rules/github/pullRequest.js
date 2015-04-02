var g = require('../../grammar')
var Category = require('../Category')
var github = require('./github')
var poss = require('../poss')
var user = require('../user')
var auxVerbs = require('../auxVerbs')
var stopWords = require('../stopWords')


var pullRequest = new Category({ sg: 'pull-request', pl: 'pull-requests' })

var pullRequestsTerm = g.addWord({
	symbol: new g.Symbol(pullRequest.namePl, 'term'),
	insertionCost: 3.5,
	accepted: [ 'pull-requests' ]
})

// |Github pull requests (I created)
pullRequest.headMayPoss.addRule({ RHS: [ github.termOpt, pullRequestsTerm ] })


// my pull requests
pullRequest.noRelativePossessive.addRule({ RHS: [ poss.determiner, pullRequest.possessible ]})
// pull requests of mine
pullRequest.head.addRule({ RHS: [ pullRequest.headMayPoss, poss.ofPossUsers ] })


// CREATED:
var pullRequestsCreatedSemantic = new g.Semantic({ name: pullRequest.namePl + '-created', cost: 0.5 })
var pullRequestCreatorsSemantic = new g.Semantic({ name: pullRequest.nameSg + '-creators', cost: 0.5 })

// (pull requests) created by me
pullRequest.passive.addRule({ RHS: [ github.created, user.byObjUsers ], semantic: pullRequestsCreatedSemantic })
// (pull requests) I created
pullRequest.objFilter.addRule({ RHS: [ user.nomUsers, github.preVerbStopWordsCreated ], semantic: pullRequestsCreatedSemantic })
// (pull requests) I have created
pullRequest.objFilter.addRule({ RHS: [ user.nomUsers, github.preVerbStopWordsHaveCreated ], semantic: pullRequestsCreatedSemantic })
// (people who) created pull requests ...
user.subjFilter.addRule({ RHS: [ github.created, pullRequest.catPl ], semantic: pullRequestCreatorsSemantic })
// (people who) have created pull requests ...
var createdPullRequests = new g.Symbol('created', pullRequest.namePl)
createdPullRequests.addRule({ RHS: [ github.created, pullRequest.catPl ] }) // not [pull-requests+] because 'by'
user.subjFilter.addRule({ RHS: [ auxVerbs.have, createdPullRequests ], semantic: pullRequestCreatorsSemantic, personNumber: 'pl' })


// MENTION:
var mention = g.addWord({
	symbol: new g.Symbol('mention'),
	accepted: [ 'mention' ]
})

var pullRequestsMentioned = new g.Semantic({ name: pullRequest.namePl + '-mentioned', cost: 0.5 })

// (pull requests that) mention me
pullRequest.subjFilter.addRule({ RHS: [ mention, user.objUsersPlus ], semantic: pullRequestsMentioned })

var mentionedIn = g.addWord({
	symbol: new g.Symbol('mentioned', 'in'),
	insertionCost: 2,
	accepted: [ 'mentioned-in' ]
})

var beGeneralMentionedIn = new g.Symbol('be', 'general', 'mentioned', 'in')
beGeneralMentionedIn.addRule({ RHS: [ auxVerbs.beGeneral, mentionedIn ] })
var preVerbStopWordsBeGeneralMentionedIn = new g.Symbol('pre', 'verb', 'stop', 'words', 'be', 'general', 'mentioned', 'in')
preVerbStopWordsBeGeneralMentionedIn.addRule({ RHS: [ stopWords.preVerbStopWords, beGeneralMentionedIn ] })
// (pull requests) I-am/{user}-is/[users]-are mentioned in
pullRequest.objFilter.addRule({ RHS: [ user.nomUsersPlus, preVerbStopWordsBeGeneralMentionedIn ], semantic: pullRequestsMentioned })
