var util = require('../../util/util')
var g = require('./grammar')
var NSymbol = require('./NSymbol')


/**
 * Adds rules to this `NSymbol` for a verb. Used in the nominative case; e.g., "people `[nom-users]` follow/follows".
 *
 * Note: It is much better to have a single terminal rule set with dynamic grammatical conjugation than to define separate rule sets for each grammatical case (depending on the rule) with the same substitutions/synonyms. The overhead `Parser` endures for the larger state table (because of the additional rules) is far greater than the `pfsearch` overhead for the conjugation.
 *
 * @memberOf NSymbol
 * @param {Object} options The options object.
 * @returns {NSymbol} Returns this `NSymbol` instance.
 */
var verbSchema = {
	// Enable creation of edit rules using `NSymbol` for this cost by inserting the first terminal symbol for `oneSg`, `pl`, or `oneOrPl` (which ever of those is defined, prioritized in that order).
	insertionCost: Number,
	// The inflected terminal symbol for first-person-singular; e.g., "am", "was", "like".
	oneSg: { type: String, required: true },
	// The inflected terminal symbol for third-person-singular, for use as the present indicative; e.g., "is", "was", "likes".
	threeSg: { type: String, required: true },
	// The inflected terminal symbol for plural; e.g., "are", "were", "like".
	pl: { type: String, required: true },
	// The inflected terminal symbol for past tense; e.g., "were", "liked", "did".
	past: String,
	// The inflected terminal symbol for use as the present subjunctive; e.g., "be". The grammar generator does not support rules that use this verb form (via conjugation); rather, its definition only provides a substitution.
	presentSubjunctive: String,
	// The inflected terminal symbol for use as the present participle; e.g., "being", "liking". The grammar generator does not support rules that use this verb form (via conjugation); rather, its definition only provides a substitution.
	presentParticiple: String,
	// The inflected terminal symbol for use as the past participle; e.g., "been", "done". The grammar generator does not support rules that use this verb form (via conjugation); rather, its definition only provides a substitution.
	pastParticiple: String,
	// The terminal symbols that are accepted when input irrespective of grammatical person-number.
	accepted: { type: Array, arrayType: String },
	// The symbols to substitute when input, defined as either strings or objects with properties `symbol` (string) and `costPenalty` (number).
	substitutions: { type: Array, arrayType: [ String, Object ] },
}

NSymbol.prototype.addVerb = function (options) {
	if (util.illFormedOpts(verbSchema, options)) {
		throw new Error('Ill-formed verb')
	}

	// The different inflection forms used in conjugation.
	var defaultTextForms = {
		// The inflected terminal symbol for first-person-singular; e.g., "am", "was", "like".
		oneSg: options.oneSg,
		// The inflected terminal symbol for third-person-singular, for use as the present indicative; e.g., "is", "was", "likes".
		threeSg: options.threeSg,
		// The inflected terminal symbol for plural; e.g., "are", "were", "like".
		pl: options.pl,
	}

	// The past tense inflection.
	if (options.past) {
		// The inflected terminal symbol for past tense; e.g., "were", "liked", "did".
		defaultTextForms.past = options.past
	}

	// The inflected terminal symbol for first-person-singular; e.g., "am", "was", "like".
	var newRule = {
		isTerminal: true,
		rhs: options.oneSg,
		text: defaultTextForms,
	}

	if (options.insertionCost !== undefined) {
		newRule.insertionCost = options.insertionCost
	}

	this.addRule(newRule)

	// The inflected terminal symbol for third-person-singular, for use as the present indicative; e.g., "is", "was", "likes".
	if (options.threeSg !== options.oneSg) {
		this.addRule({
			isTerminal: true,
			rhs: options.threeSg,
			text: defaultTextForms,
		})
	}

	// The inflected terminal symbol for plural; e.g., "are", "were", "like".
	if (options.pl !== options.oneSg && options.pl !== options.threeSg) {
		this.addRule({
			isTerminal: true,
			rhs: options.pl,
			text: defaultTextForms,
		})
	}

	// The inflected terminal symbol for past tense; e.g., "were", "liked", "did". Accept 'past' terminal symbols for rules defined as past tense (e.g., "repos liked by me") or rules which optionally accept the past form (e.g., "repos I like/liked").
	if (options.past) {
		this.addRule({
			isTerminal: true,
			rhs: options.past,
			tense: 'past',
			text: defaultTextForms,
		})
	}

	// The terminal symbols that are accepted when input irrespective of grammatical person-number.
	if (options.accepted) {
		options.accepted.forEach(function (termSym) {
			this.addRule({
				isTerminal: true,
				rhs: termSym,
				text: termSym,
			})
		}, this)
	}

	// The inflected terminal symbol for use as the present subjunctive; e.g., "be". The grammar generator does not support rules that use this verb form (via conjugation); rather, its definition only provides a substitution.
	if (options.presentSubjunctive) {
		this.addSubstitutions([ options.presentSubjunctive ], defaultTextForms)
	}

	// The inflected terminal symbol for use as the present participle; e.g., "being", "liking". The grammar generator does not support rules that use this verb form (via conjugation); rather, its definition only provides a substitution.
	if (options.presentParticiple) {
		this.addSubstitutions([ options.presentParticiple ], defaultTextForms)
	}

	// The inflected terminal symbol for use as the past participle; e.g., "been", "done". The grammar generator does not support rules that use this verb form (via conjugation); rather, its definition only provides a substitution.
	if (options.pastParticiple) {
		this.addSubstitutions([ options.pastParticiple ], defaultTextForms)
	}

	// Symbols which are replaced when input.
	if (options.substitutions) {
		this.addSubstitutions(options.substitutions, defaultTextForms)
	}

	return this
}

/**
 * Adds rules to this `NSymbol` for a stop word, which do not produce display text when input.
 *
 * @memberOf NSymbol
 * @param {...(Object|string)} [symbols] The symbols to remove when input, defined as either strings or objects with properties `symbol` (string) and `costPenalty` (number).
 * @returns {NSymbol} Returns this `NSymbol` instance.
 */
NSymbol.prototype.addStopWords = function () {
	// Accepted terminal symbol is an empty string.
	this.addRule({ isTerminal: true, rhs: g.emptySymbol })

	// Add stop words, which are rejected when input; i.e., produce no display text.
	for (var a = 0, argumentsLen = arguments.length; a < argumentsLen; ++a) {
		var stopWord = arguments[a]

		var newRule = {
			isTerminal: true,
			isStopWord: true,
		}

		// Check if stop-word has a cost penalty.
		if (stopWord.constructor === Object) {
			if (util.illFormedOpts(substitutionObjSchema, stopWord)) {
				throw new Error('Ill-formed terminal symbol')
			}

			newRule.rhs = stopWord.symbol
			newRule.costPenalty = stopWord.costPenalty
		} else {
			newRule.rhs = stopWord
		}

		this.addRule(newRule)
	}

	return this
}

// The substitution object schema.
var substitutionObjSchema = {
	// The terminal symbol.
	symbol: { type: String, required: true },
	// The substitution cost penalty.
	costPenalty: { type: Number, required: true },
}

/**
 * Adds rules to this `NSymbol` which substitute the symbols in `substitutions` with `correctedText` when input.
 *
 * @memberOf NSymbol
 * @param {(Object|string)[]} substitutions The symbols to substitute with `correctedText` when input, defined as either strings or objects with properties `symbol` (string) and `costPenalty` (number).
 * @param {string} correctedText The text to replace `substitutions` when input.
 * @returns {NSymbol} Returns this `NSymbol` instance.
 */
NSymbol.prototype.addSubstitutions = function (substitutions, correctedText) {
	if (correctedText === undefined) {
		throw new Error('Missing corrected text')
	}

	for (var s = 0, substitutionsLen = substitutions.length; s < substitutionsLen; ++s) {
		var substitution = substitutions[s]

		var newRule = {
			isTerminal: true,
			isSubstitution: true,
			text: correctedText,
		}

		// Check if substitution has a cost penalty.
		if (substitution.constructor === Object) {
			if (util.illFormedOpts(substitutionObjSchema, substitution)) {
				throw new Error('Ill-formed terminal symbol')
			}

			newRule.rhs = substitution.symbol
			newRule.costPenalty = substitution.costPenalty
		} else {
			newRule.rhs = substitution
		}

		this.addRule(newRule)
	}

	return this
}

/**
 * Creates an optionalized version of an existing nonterminal symbol.
 *
 * @deprecated Deprecated in favor of manually creating optional nonterminal symbols using `<empty>`.
 * @memberOf NSymbol
 * @returns {NSymbol} Returns the new `NSymbol`.
 */
NSymbol.prototype.createNonterminalOpt = function () {
	// Append 'opt' to original symbol name.
	var symbolOpt = g.newSymbol(this.name, 'opt')

	// Prevent insertions if `this` is insertable.
	symbolOpt.addRule({ rhs: [ this ], noInsert: true })

	// `<empty>` is always the last rule for optional nonterminal symbols.
	symbolOpt.addRule({ isTerminal: true, rhs: g.emptySymbol })

	return symbolOpt
}