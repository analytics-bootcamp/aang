var util = require('../util')

var grammar = {}

// Empty-string
// Rules with <empty> optionalize their LHS symbols and subsequent unary reductions
// Original rules with <empty> are omitted from output grammar
exports.emptySymbol = '<empty>'

exports.Symbol = require('./Symbol').bind(null, grammar)

// Extend module with rule functions
require('./ruleFunctions')

var Semantic = require('./Semantic')
exports.Semantic = Semantic.Semantic
exports.insertSemantic = Semantic.insertSemantic

// Derive rules from insertion and transposition costs, and empty-strings
exports.createEditRules = require('./createEditRules').bind(null, grammar)

// Sort nonterminal symbols alphabetically
exports.sortGrammar = function () {
	Object.keys(grammar).sort().forEach(function (symbol) {
		var rules = grammar[symbol]
		delete grammar[symbol]
		grammar[symbol] = rules
	})
}

// Print the total count of rules in the grammar
// Print change if 'oldGrammarPath' passed
exports.printRuleCount = function (oldGrammarPath) {
	var fs = require('fs')

	var newRuleCount = ruleCount(grammar)

	if (fs.existsSync(oldGrammarPath)) {
		var oldRuleCount = ruleCount(require(fs.realpathSync(oldGrammarPath)))
		if (oldRuleCount !== newRuleCount) {
			console.log('Rules:', oldRuleCount, '->', newRuleCount)
			return
		}
	}

	console.log('Rules:', newRuleCount)
}

function ruleCount(grammar) {
	return Object.keys(grammar).reduce(function (prev, cur) {
		return prev + grammar[cur].length
	}, 0)
}

// Write grammar and semantics to files
exports.writeGrammarToFile = function (grammarPath, semanticsPath) {
	util.writeJSONFile(grammarPath, grammar)
	util.writeJSONFile(semanticsPath, Semantic.semantics)
}