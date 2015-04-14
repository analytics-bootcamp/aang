// Functions to automate adding many common sets of rules to grammar

var g = require('./grammar')
var Symbol = require('./Symbol')
var util = require('../util')


// Schema for pronouns
var pronounOptsSchema = {
	name: String,
	insertionCost: { type: Number, optional: true },
	nom: { type: Array, arrayType: String },
	obj: { type: Array, arrayType: String },
	substitutions: { type: Array, arrayType: String }
}

// Add all terminal symbols for a pronoun to the grammar; e.g., "I" and "me"
// Creates seperate symbols for nominative and objective case
g.addPronoun = function (opts) {
	if (util.illFormedOpts(pronounOptsSchema, opts)) {
		throw 'ill-formed pronoun'
	}

	return {
		// Nominative case
		nom: g.addWord({
			symbol: new g.Symbol(opts.name, 'nom'),
			insertionCost: opts.insertionCost,
			accepted: opts.nom,
			substitutions: opts.obj.concat(opts.substitutions)
		}),

		// Objective case
		obj: g.addWord({
			symbol: new g.Symbol(opts.name, 'obj'),
			insertionCost: opts.insertionCost,
			accepted: opts.obj,
			substitutions: opts.nom.concat(opts.substitutions)
		})
	}
}


// Schema for verbs
var verbOptSchema = {
	name: String,
	insertionCost: { type: Number, optional: true },
	one: { type: Array, arrayType: String, optional: true },
	pl: { type: Array, arrayType: String, optional: true },
	oneOrPl: { type: Array, arrayType: String, optional: true },
	threeSg: { type: Array, arrayType: String, optional: true },
	oneOrThreeSg: { type: Array, arrayType: String, optional: true },
	past: { type: Array, arrayType: String, optional: true },
	substitutions: { type: Array, arrayType: String, optional: true },
	singleSymbol: { type: Boolean, optional: true }
}

// Add all terminal symbols for a verb to the grammar
// Only used in nominative case; ex: "people [nom-users] follow/follows"
// Creates multiple symbols for different verb forms: verb, past, and pl-subj
g.addVerb = function (opts) {
	if (util.illFormedOpts(verbOptSchema, opts)) {
		throw 'ill-formed verb'
	}

	// Must have an inflected form for every person-number combination in nominative case:
	// - first-person, third-person-singular, plural
	if (!opts.oneOrPl && !opts.oneOrThreeSg && !opts.one) {
		console.log('Err: Missing inflected verb form for first-person')
		console.log(util.getLine())
		throw 'ill-formed verb'
	}

	if (!opts.oneOrPl && !opts.pl) {
		console.log('Err: Missing inflected verb form for plural')
		console.log(util.getLine())
		throw 'ill-formed verb'
	}

	if (!opts.oneOrThreeSg && !opts.threeSg) {
		console.log('Err: Missing inflected verb form for third-person-singular')
		console.log(util.getLine())
		throw 'ill-formed verb'
	}

	if (opts.singleSymbol) {
		if (opts.past) {
			console.log('Err: Verb with \'singleSymbol\' will not use \'past\' terms')
			console.log(util.getLine())
			throw 'ill-formed verb'
		}

		// Only create one symbol; e.g., [be-general]
		var verb = new g.Symbol(opts.name)
	} else {
		var verb = new g.Symbol(opts.name, 'verb')
	}

	// Object of inflection forms for conjugation
	var defaultTextForms = {
		// "am", "was", "like"
		one: opts.one ? opts.one[0] : (opts.oneOrPl ? opts.oneOrPl[0] : opts.oneOrThreeSg[0]),
		// "are", "were", "like"
		pl: opts.pl ? opts.pl[0] : opts.oneOrPl[0],
		// "is", "was", "likes"
		threeSg: opts.threeSg ? opts.threeSg[0] : opts.oneOrThreeSg[0]
	}


	// Inflected forms for first-person (e.g., "am")
	if (opts.one) {
		opts.one.forEach(function (termSym, i) {
			var newRule = { terminal: true, RHS: termSym, textForms: {
				one: termSym,
				pl: defaultTextForms.pl,
				threeSg: defaultTextForms.threeSg
			} }

			// Insertion cost added to first terminal rule (though, inconsequential)
			if (i === 0 && opts.hasOwnProperty('insertionCost')) {
				newRule.insertionCost = opts.insertionCost
			}

			verb.addRule(newRule)
		})
	}

	// Inflected forms for plural (e.g., "are", "were")
	if (opts.pl) {
		opts.pl.forEach(function (termSym, i) {
			var newRule = { terminal: true, RHS: termSym, textForms: {
				one: defaultTextForms.one,
				pl: termSym,
				threeSg: defaultTextForms.threeSg
			} }

			// Insertion cost added to first terminal rule (though, inconsequential)
			if (i === 0 && !opts.one && opts.hasOwnProperty('insertionCost')) {
				newRule.insertionCost = opts.insertionCost
			}

			verb.addRule(newRule)
		})
	}

	// Inflected forms for first-person or plural (e.g., "have", "like")
	if (opts.oneOrPl) {
		opts.oneOrPl.forEach(function (termSym, i) {
			var newRule = { terminal: true, RHS: termSym, textForms: {
				one: termSym,
				pl: termSym,
				threeSg: defaultTextForms.threeSg
			} }

			// Insertion cost added to first terminal rule (though, inconsequential)
			if (i === 0 && !opts.one && !opts.pl && opts.hasOwnProperty('insertionCost')) {
				newRule.insertionCost = opts.insertionCost
			}

			verb.addRule(newRule)
		})
	}

	// Inflected forms for third-person-singular (e.g., "is", "has", "likes")
	if (opts.threeSg) {
		opts.threeSg.forEach(function (termSym) {
			verb.addRule({ terminal: true, RHS: termSym, textForms: {
				one: defaultTextForms.one,
				pl: defaultTextForms.pl,
				threeSg: termSym
			} })
		})
	}

	// Inflected forms for third-person-singular or first-person (e.g., "was")
	if (opts.oneOrThreeSg) {
		opts.oneOrThreeSg.forEach(function (termSym) {
			verb.addRule({ terminal: true, RHS: termSym, textForms: {
				one: termSym,
				pl: defaultTextForms.pl,
				threeSg: termSym
			} })
		})
	}

	// Terminal symbols which are replaced when input
	if (opts.substitutions) {
		opts.substitutions.forEach(function (termSym) {
			verb.addRule({ terminal: true, RHS: termSym, textForms: defaultTextForms })
		})
	}

	// Only create one symbol; e.g., [be-general]
	if (opts.singleSymbol) {
		return verb
	}

	// Past tense is optional (e.g.: [have])
	if (opts.past) {
		// Past tense terms also serve as substitutions for verb form
		opts.past.forEach(function (termSym) {
			verb.addRule({ terminal: true, RHS: termSym, textForms: defaultTextForms })
		})

		var verbPast = g.addWord({
			symbol: new g.Symbol(opts.name, 'past'),
			insertionCost: opts.insertionCost,
			accepted: opts.past,
			substitutions: [].concat(opts.one, opts.pl, opts.oneOrPl, opts.threeSg, opts.oneOrThreeSg, opts.substitutions).filter(Boolean)
		})
	}

	// Plural-subjective; e.g., "(people who) like ...""
	var verbPlSubj = g.addWord({
		symbol: new g.Symbol(opts.name, 'pl', 'subj'),
		insertionCost: opts.insertionCost,
		accepted: [].concat(opts.pl, opts.oneOrPl).filter(Boolean),
		substitutions: [].concat(opts.one, opts.threeSg, opts.oneOrThreeSg, opts.past, opts.substitutions).filter(Boolean)
	})

	return {
		verb: verb,
		past: verbPast,
		plSubj: verbPlSubj
	}
}


// Schema for stop-words
var stopWordOptSchema = {
	symbol: Symbol,
	stopWords: { type: Array, arrayType: String }
}

// Add a stop-word to the grammar - replaces terminal symbols with an empty-string
g.addStopWord = function (opts) {
	if (util.illFormedOpts(stopWordOptSchema, opts)) {
		throw 'ill-formed stop-word'
	}

	var stopWord = opts.symbol

	// Accepted terminal symbol is an empty-string
	stopWord.addRule({ terminal: true, RHS: g.emptySymbol })

	// All stop-word terminal symbols are rejected
	opts.stopWords.forEach(function (termSym) {
		stopWord.addRule({ terminal: true, RHS: termSym })
	})

	return stopWord
}


// Schema for other words
var wordOptsSchema = {
	symbol: Symbol,
	optional: { type: Boolean, optional: true },
	insertionCost: { type: Number, optional: true },
	accepted: { type: Array, arrayType: String },
	substitutions: { type: Array, arrayType: String, optional: true }
}

// Add a set of terminal symbols to the grammar
g.addWord = function (opts) {
	if (util.illFormedOpts(wordOptsSchema, opts)) {
		throw 'ill-formed word'
	}

	if (opts.accepted.indexOf(g.emptySymbol) !== -1) {
		console.log('Err: Words cannot have <empty> strings:', opts.name)
		console.log('Only stop-words or opt-terms can have <empty> strings')
		console.log(util.getLine())
		throw 'ill-formed word'
	}

	// Opt-words cannot have insertion costs
	if (opts.optional && opts.hasOwnProperty('insertionCost')) {
		console.log('Err: Optional words cannot have insertion costs:', opts.name)
		console.log(util.getLine())
		throw 'ill-formed opt-word'
	}

	var word = opts.symbol

	// Optional terminal rule -> rule can be omitted from input by accepting empty-string without penalty
	if (opts.optional) {
		word.addRule({ terminal: true, RHS: g.emptySymbol })
	}

	// Terminal symbols which are output when input (i.e., not substituted)
	opts.accepted.forEach(function (termSym, i) {
		var newRule = { terminal: true, RHS: termSym, text: termSym }

		// Insertion cost added to first terminal rule (though, inconsequential)
		if (i === 0 && opts.insertionCost !== undefined) {
			newRule.insertionCost = opts.insertionCost
		}

		word.addRule(newRule)
	})

	// Terminal symbols which are replaced when input
	if (opts.substitutions) {
		// First of 'accepted' terminal symbol is used to substitute rejected symbols
		var correctedText = opts.accepted[0]

		opts.substitutions.forEach(function (termSym) {
			word.addRule({ terminal: true, RHS: termSym, text: correctedText })
		})
	}

	return word
}


// Create an optionalized version of an existing nonterminal symbol
g.addNonterminalOpt = function (symbol) {
	// Append 'opt' to original symbol name
	var symbolOpt = new g.Symbol(symbol.name.slice(1, -1), 'opt')

	symbolOpt.addRule({ RHS: [ symbol ] })
	// <empty> always last for optional nonterminal symbols
	symbolOpt.addRule({ terminal: true, RHS: g.emptySymbol })

	return symbolOpt
}