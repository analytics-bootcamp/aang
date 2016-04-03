var g = require('../../grammar')
var preps = require('../prepositions')
var user = require('../user/user')
var company = require('./company')


var work = g.newVerb({
	symbolName: 'work',
	insertionCost: 0.5,
	acceptedVerbTermSets: [ {
		oneSg: 'work',
		threeSg: 'works',
		pl: 'work',
		past: 'worked',
		presentParticiple: 'working',
	} ],
})

var employeesSemantic = g.newSemantic({
	name: 'employees',
	cost: 0.5,
	minParams: 1,
	maxParams: 1,
})

var workSubjFilterPast = g.newSymbol('work', 'subj', 'filter', 'past')

// (people who) worked at `[companies+]`
workSubjFilterPast.addRule({
	rhs: [ work, [ preps.benefactive, company.plPlus ] ],
	// Dictates inflection of `work`:
	//   "(people who) `[work]` at `[companies+]`" -> "(people who) worked at `[companies+]`"
	grammaticalForm: 'past',
})

// (people who) worked at `[companies+]`
user.subjFilterPast.addRule({
	rhs: [ workSubjFilterPast ],
	semantic: employeesSemantic,
})