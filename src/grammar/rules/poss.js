var g = require('../grammar')
var oneSg = require('./oneSg')
var preps = require('./prepositions')

var possStr = 'poss'

var possDeterminerSg = new g.Symbol(possStr, 'determiner', 'sg')
// my (repositories)
possDeterminerSg.addRule({ RHS: [ oneSg.poss ] })

this.determiner = new g.Symbol(possStr, 'determiner')
// my (repositories)
this.determiner.addRule({ RHS: [ possDeterminerSg ] })

this.determinerOmissible = new g.Symbol(possStr, 'determiner', 'omissible')
// my (followers)
this.determinerOmissible.addRule({ RHS: [ oneSg.possOmissible ]})


var possUser = new g.Symbol(possStr, 'user')
// (followers of) mine
possUser.addRule({ terminal: true, RHS: 'mine' })

var possUsers = new g.Symbol(possStr, 'users')
possUsers.addRule({ RHS: [ possUser ] })

var possUsersPlus = new g.Symbol(possStr, 'users+')
possUsersPlus.addRule({ RHS: [ possUsers] })

this.ofPossUsers = new g.Symbol('of', possStr, 'users')
this.ofPossUsers.addRule({ RHS: [ preps.possessor, possUsersPlus ] })