var util = require('../../../../util/util')
var g = require('../../grammar')
var user = require('./user')
var oneSg = require('./oneSg')
var anaphora = require('./anaphora')
var conjunction = require('../conjunction')
var auxVerbs = require('../auxVerbs')


// The grammatical person-number property, `personNumber`, exists only for the nominative case to conjugate the verbs that follow.
var nomUsers = g.newSymbol('nom', user.namePl)
// (people) `{user}` (follows)
nomUsers.addRule({
	rhs: [ user.sg ],
	// Dictates inflection of the verb that follows `[user]`:
	//   "(people) `{user}` (`[verb-follow]`)" -> "(people) `{user}` (follows)"
	personNumber: 'threeSg',
})
// (people) I (follow)
nomUsers.addRule({
	rhs: [ {
		symbol: oneSg.pronoun,
		// Dictates inflection of `[1-sg]`:
		//   "(people) `[1-sg]` (follow)" -> "(people) I (follow)"
		grammaticalForm: 'nom',
	} ],
	// Dictates inflection of the verb that follows `[1-sg]`:
	//   "(people) I (`[verb-follow]`)" -> "(people) I (follow)"
	personNumber: 'oneSg',
	semantic: oneSg.semanticArg,
})
// (repos `{user}` likes that) he|she (contributed to)
nomUsers.addRule({
	rhs: [ {
		// Dictates inflection of `[3-sg]`:
		//   "(repos `{user}` likes that) `[3-sg]` (...)" -> "(repos `{user}` likes that) he|she (...)"
		symbol: anaphora.threeSg,
		grammaticalForm: 'nom',
	} ],
	// Dictates inflection of the verb that follows `[3-sg]`:
	//   "(repos `{user}` likes that) he|she (`[verb-contribute-to]`)" -> "(...) he|she (contributes to)"
	personNumber: 'threeSg',
	anaphoraPersonNumber: 'threeSg',
})
// (repos) people who follow me (like)
nomUsers.addRule({
	rhs: [ user.plural ],
	// Dictates inflection of the verb that follows `[user-plural]`:
	//   "(repos) people who follow me (`[verb-like]`)" -> "(repos) people who follow me (like)"
	personNumber: 'pl',
})
// (repos my followers like that) they (contributed to)
nomUsers.addRule({
	rhs: [ {
		// Dictates inflection of `[3-pl]`:
		//   "(repos my followers like that) `[3-pl]` (...)" -> "(repos my followers like that) they (...)"
		symbol: anaphora.threePl,
		grammaticalForm: 'nom',
	} ],
	// Dictates inflection of the verb that follows `[3-pl]`:
	//   "(repos my followers like that) `[3-pl]` (`[verb-contribute-to]`)" -> "(...)" they (contribute to)"
	personNumber: 'pl',
	anaphoraPersonNumber: 'threePl',
})

/**
 * Excludes the following user subject because it is nearly semantically useless:
 *   `[nom-users]` -> "people", `all(users)` => "(repos) people (like)"
 * For example, "repos people like" returns the same (database) results as "(all) repos", though the grammar does not support the latter query.
 */


/**
 * The `[nom-users-sans-person-number]` rule set is identical to `[nom-users]` without the `personNumber` rule properties.
 *
 * For use in multi-subject conjunctions within `[nom-users+]` to conjugate the nominative verbs that follow to their plural form. The base conjunction rules in `[nom-users+]` that produce at least two subjects have the necessary `personNumber` value, 'pl', while all sub-rules (i.e., `[nom-users-sans-person-number]`) in the conjunctions lack `personNumber` conjugation properties.
 *
 * `[nom-users-sans-person-number]` includes the following rules:
 *   `[user-plural]` => (people) people who follow me (and/or I follow)
 *   `[user]` => (people) `{user}` (and/or I follow)
 *   `[1-sg]` => (people) I (and/or `{user}` follow)
 *   `[3-sg]` => (`{user:'s}` followers) he (and/or I follow)
 *   `[3-pl]` => (my followers' repos liked by people) they (and/or I follow)
 *
 * Note: Should refactor this operation to avoid manually manipulating `NSymbol.rules`.
 */
var nomUsersSansPersonNumber = g.newSymbol(nomUsers.name, 'sans', 'person', 'number')
Array.prototype.push.apply(nomUsersSansPersonNumber.rules, nomUsers.rules.map(function (rule) {
	var ruleClone = util.clone(rule)
	delete ruleClone.personNumber
	return ruleClone
}))


// Lacks person-number properties because used by `[nom-users+]` in conjunctions, enabling correct conjugation of queries such as "people Danny and Aang follow".
var nomUsersSansPersonNumberPlus = conjunction.create(nomUsersSansPersonNumber, true)
var nomUsersSansPersonNumberPlusConjunctionRule = nomUsersSansPersonNumberPlus.rules[1]
var nomUsersSansPersonNumberPlusDisjunctionRule = nomUsersSansPersonNumberPlus.rules[2]

// Do not use `conjunction.create(nomUsers)` because the conjunction rules must use `[nom-users-sans-person-number]`, which lacks `personNumber` properties on the sub-rules to enable proper conjugation. This set's conjunction rules, which produces at least two subjects, have `personNumber: 'pl'` at the conjunction roots.
// (repos) I/`{user}`/people-who... [and/or `[nom-users+]`] (liked)
exports.nomUsersPlus = g.newSymbol(nomUsers.name + '+')
// (people) `[nom-users]` (follow)
exports.nomUsersPlus.addRule({
	// Use `[nom-users]`, which has the appropriate `personNumber` values on the sub-rules, unlike `[nom-users-sans-person-number]`, which has no `personNumber` properties (only the base `[nom-users+]` has the `personNumber` properties).
	rhs: [ nomUsers ],
})
/**
 * Define `personNumber` for conjunctions to enable "people I and Danny follow", using sub-rules that lack `personNumber` properties. As a result, `personNumber` exists only at the root of conjunctions.
 *
 * (people) `[nom-users-sans-person-number]` and `[nom-users-sans-person-number]` [and `[nom-users-sans-person-number]` ...] (follow)
 * (people) `[nom-users-sans-person-number]` [and `[nom-users-sans-person-number]` ...] or `[nom-users+]` (follow)
 *
 * Note: Should refactor this operation to avoid manually manipulating `NSymbol.rules`.
 */
Array.prototype.push.apply(exports.nomUsersPlus.rules, nomUsersSansPersonNumberPlus.rules.slice(1).map(function (rule) {
	var ruleClone = util.clone(rule)
	ruleClone.personNumber = 'pl'
	return ruleClone
}))

// Manually create a disjunction rule set manually, instead of using `conjunction.createDisjunctionSet(nomUsers)`, to enable proper `personNumber` conjugation for the same reasons as `[nom-users+]`.
// For use with semantics with `forbidsMultipleIntersection`.
exports.nomUsersPlusDisjunction = g.newSymbol(exports.nomUsersPlus.name, 'disjunction')
// (repos) `[nom-users]` (created)
exports.nomUsersPlusDisjunction.addRule({
	rhs: [ nomUsers ],
})
// (repos) `[nom-users-sans-person-number]` or `[nom-users-sans-person-number]` [or `[nom-users-sans-person-number]` ...] (created)
// (repos) `[nom-users-sans-person-number]` and `[nom-users-sans-person-number]` (...) -> ... or `[nom-users-sans-person-number]` (...)
var nomUsersSansPersonNumberPlusDisjunction = conjunction.createDisjunctionSet(nomUsersSansPersonNumber)
Array.prototype.push.apply(exports.nomUsersPlusDisjunction.rules, nomUsersSansPersonNumberPlusDisjunction.rules.slice(1).map(function (rule) {
	var ruleClone = util.clone(rule)
	ruleClone.personNumber = 'pl'
	return ruleClone
}))


/**
 * `[nom-users-plural]` only produces plural subjects (e.g., "people who ...") or conjunctions with multiple subjects (e.g., "`{user}` and me").
 *
 * Nearly identical rule structure to rules that `conjunction.create()` defines, however, prevents `union()` with semantic arguments representing single users (and incorporates `[nom-users-sans-person-number]` from above).
 */
exports.nomUsersPlural = g.newSymbol(nomUsers.name, 'plural')
// (followers) `[user-plural]` (share)
exports.nomUsersPlural.addRule({
	rhs: [ user.plural ],
	personNumber: 'pl',
})
// (repos created by my followers) followers they share like
exports.nomUsersPlural.addRule({
	rhs: [ {
		symbol: anaphora.threePl,
		grammaticalForm: 'nom',
	} ],
	personNumber: 'pl',
	anaphoraPersonNumber: 'threePl',
})
// (followers) `[nom-users-sans-person-number]` and `[nom-users-sans-person-number]` [and `[nom-users-sans-person-number]` ...] (share)
// Note: Should refactor this operation to avoid manually manipulating `NSymbol.rules`.
var nomUsersSansPersonNumberPlusConjunctionRuleClone = util.clone(nomUsersSansPersonNumberPlusConjunctionRule)
nomUsersSansPersonNumberPlusConjunctionRuleClone.personNumber = 'pl'
exports.nomUsersPlural.rules.push(nomUsersSansPersonNumberPlusConjunctionRuleClone)

// Only permit semantic arguments in `union()` for multiple users; i.e., prevent "`{users}` or `{user}`".
// Following logic's order of operations, "and" takes precedence over "or". Hence, segments between "or" are grouped together with `intersect()`, which are then grouped together in `union()`.
var nomUsersPluralNoUnion = g.newSymbol(exports.nomUsersPlural.name, 'no', g.getSemanticName(conjunction.unionSemantic))
// (followers) my followers (or I and `{user}` share)
nomUsersPluralNoUnion.addRule({
	rhs: [ user.plural ],
})
// (repos created by my followers followers) they (or I and `{user}` share like)
nomUsersPluralNoUnion.addRule({
	rhs: [ {
		symbol: anaphora.threePl,
		grammaticalForm: 'nom',
	} ],
	anaphoraPersonNumber: 'threePl',
})
/**
 * (followers) I and `{user}` (or `{user}` and `{user}` share)
 *
 * Clone the reused rule, though without modifications, to ensure different (diversified) `cost` values.
 * Note: Should refactor this operation to avoid manually manipulating `NSymbol.rules`.
 */
nomUsersPluralNoUnion.rules.push(util.clone(nomUsersSansPersonNumberPlusConjunctionRule))

// Following logic's order of operations, "and" takes precedence over "or". Hence, segments between "or" are grouped together with `intersect()`, which are then grouped together in `union()`.
var nomUsersPluralNoUnionOr = g.newBinaryRule({
	rhs: [
		{ symbol: nomUsersPluralNoUnion, noInsert: true },
		{ symbol: conjunction.or, noInsert: true },
	],
	semantic: conjunction.intersectSemantic,
})
var nomUsersPluralIntersect = g.newSymbol(exports.nomUsersPlural.name, g.getSemanticName(conjunction.intersectSemantic)).addRule({
	rhs: [ exports.nomUsersPlural ],
	semantic: conjunction.intersectSemantic,
})
// (followers) `[nom-users-plural]` [and `[nom-users-plural]` ...] or `[nom-users-plural+]` (share)
// (followers) I and `{user}` or `{user}` and `{user}` (share); (followers) my followers or people I follow (share)
exports.nomUsersPlural.addRule({
	rhs: [
		{ symbol: nomUsersPluralNoUnionOr, noInsert: true },
		{ symbol: nomUsersPluralIntersect, noInsert: true },
	],
	personNumber: 'pl',
	semantic: conjunction.unionSemantic,
})


/**
 * Regarding the following `[have]` rules:
 * • No insertion for `[have]` to prevent creating multiple semantically identical trees, where this suggestion would be discarded for its higher cost. For example, were `[have]` insertable, it would enable the following semantically duplicate suggestions:
 *     "repos I like" -> "repos I have liked"
 *     "repos I not" -> "repos I have not", "repos I do not"
 * • These rules are possibly inefficient. Rather, `[have]` should be paired with the verbs it precedes as part of a single term sequence to enable more term sequence flattening. This would reduce the number of paths `pfsearch` creates, through requires more grammar rules, which yields slightly more parser reductions, but is ultimately favorable.
 */
// (repos) `[nom-users+]` have/has (liked)
exports.nomUsersPlusHaveNoInsert = g.newBinaryRule({
	rhs: [
		// The grammatical person-number in `[nom-users+]` dictates the inflection of `[have]`:
		//   "(repos) `{user}` `[have]` (liked)" -> "(repos) `{user}` has (liked)"
		exports.nomUsersPlus,
		{ symbol: auxVerbs.have, noInsert: true },
	],
})
// (repos) `[nom-users+-disjunction]` have/has (created)
exports.nomUsersPlusDisjunctionHaveNoInsert = g.newBinaryRule({
	rhs: [
		exports.nomUsersPlusDisjunction,
		{ symbol: auxVerbs.have, noInsert: true },
	],
})
// (repos) `[nom-users+]` have/has not (liked)
exports.nomUsersPlusHaveNoInsertNegation = g.newBinaryRule({
	rhs: [ exports.nomUsersPlus, auxVerbs.haveNoInsertNegation ],
})
// (repos) `[nom-users+-disjunction]` have/has not (`[verb]`)
exports.nomUsersPlusDisjunctionHaveNoInsertNegation = g.newBinaryRule({
	// Prevent `[have]` insertion to stop semantically duplicate suggestions (and yield to insertion of `[do]` for a semantically identical suggestion):
	//   "repos I not" -> "repos I have not", "repos I do not"
	rhs: [ exports.nomUsersPlusDisjunction, auxVerbs.haveNoInsertNegation ],
})

// (issues) `[nom-users+]` `[be]` (mentioned in)
// (issues) `[nom-users+]` `[have]` been (mentioned in)
exports.nomUsersPlusBe = g.newBinaryRule({
	// The grammatical person-number in `[nom-users+]` dictates the inflection of `[be]` or `[have]`:
	//   "(issues) `{user}` `[be]` (...)" -> "(issues) `{user}` is (...)"
	//   "(issues) `{user}` `[have]` been (...)" -> "(issues) `{user}` has been (...)"
	rhs: [ exports.nomUsersPlus, auxVerbs.be ],
})
// (issues) `[nom-users+]` `[be]` not (mentioned in)
// (issues) `[nom-users+]` `[have]` not been (mentioned in)
exports.nomUsersPlusBeNegation = g.newBinaryRule({
	// The grammatical person-number in `[nom-users+]` dictates the inflection of `[be]` or `[have]`:
	//   "(issues) `{user}` `[be]` not (...)" -> "(issues) `{user}` is not (...)"
	//   "(issues) `{user}` `[have]` not been (...)" -> "(issues) `{user}` has not been (...)"
	rhs: [ exports.nomUsersPlus, auxVerbs.beNegation ],
})