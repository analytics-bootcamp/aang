module.exports = StateTable

function StateTable(inputGrammar) {
	this.symbolTab = {}
	this.shifts = []

	Object.keys(inputGrammar.nonterminals).forEach(function (leftSymName) {
		var LHS = this.lookUp(leftSymName)

		inputGrammar.nonterminals[leftSymName].forEach(function (rule) {
			var newRuleRHS = rule.RHS.map(function (rightSymName) {
				return this.lookUp(rightSymName)
			}, this)

			insertRule(LHS, newRuleRHS, rule, rule)
		}, this)
	}, this)

	Object.keys(inputGrammar.terminals).forEach(function (leftSymName) {
		var symBuf = [ this.lookUp(leftSymName) ]

		inputGrammar.terminals[leftSymName].forEach(function (rule) {
			insertRule(this.lookUp(rule.RHS[0], true, rule.text), symBuf, rule)
		}, this)
	}, this)

	this.generate(this.lookUp(inputGrammar.startSymbol))
}

StateTable.prototype.lookUp = function (name, isLiteral, text) {
	var sym = this.symbolTab[name]
	if (sym && sym.isLiteral === isLiteral && sym.name === name)
		return sym

	sym = this.symbolTab[name] = {
		name: name,
		index: Object.keys(this.symbolTab).length,
		rules: []
	}

	if (isLiteral) {
		sym.isLiteral = true
		sym.text = text
	}

	return sym
}

function insertRule(sym, symBuf, origRule) {
	var existingRules = sym.rules

	for (var i = 0; i < existingRules.length; i++) {
		var existingRuleRHS = existingRules[i].RHS
		var diff

		for (var j = 0; symBuf[j] && existingRuleRHS[j]; j++) {
			diff = symBuf[j].index - existingRuleRHS[j].index
			if (diff) break
		}

		if (diff === 0 && !existingRuleRHS[j]) {
			// if (!symBuf[j]) return
			if (!symBuf[j] && origRule.cost === existingRules[i].ruleProps.cost) return // Identical RHS
			else break
		} else if (diff > 0) {
			break
		}
	}

	existingRules.splice(i, 0, {
		RHS: symBuf,
		ruleProps: createRuleProps(origRule)
	})
}

// Create ruleProps obj manually to avoid memory consumption of undefined props
function createRuleProps(origRule) {
	var ruleProps = {
		cost: origRule.cost // All rules have a cost
	}

	if (origRule.hasOwnProperty('text')) {
		ruleProps.text = origRule.text
		ruleProps.textIdx = origRule.textIdx
	}

	if (origRule.transposition) {
		ruleProps.transposition = true
	}

	return ruleProps
}

function compItems(A, B) {
	var diff = A.LHS ? (B.LHS ? A.LHS.index - B.LHS.index : 1) : (B.LHS ? -1 : 0)
	if (diff) return diff

	diff = A.RHSIdx - B.RHSIdx
	if (diff) return diff

	for (var i = 0; A.RHS[i] && B.RHS[i]; ++i) {
		diff = A.RHS[i].index - B.RHS[i].index
		if (diff) break
	}

	if (!A.RHS[i] && !B.RHS[i]) {
		if (A.ruleProps.cost === B.ruleProps.cost) return 0
		else return 1
	}

	return A.RHS[i] ? (B.RHS[i] ? diff : 1) : (B.RHS[i] ? -1 : 0)
}

function addState(ruleSets, newRuleSet) {
	for (var S = 0; S < ruleSets.length; S++) {
		var existingRuleSet = ruleSets[S]
		if (existingRuleSet.length !== newRuleSet.length) continue

		for (var i = 0; i < existingRuleSet.length; ++i) {
			if (compItems(existingRuleSet[i], newRuleSet[i]) !== 0) break
		}

		if (i >= existingRuleSet.length) {
			return S
		}
	}

	return ruleSets.push(newRuleSet) - 1
}

function addRule(items, rule) {
	var existingRules = items.list

	for (var i = 0; i < existingRules.length; i++) {
		var diff = compItems(existingRules[i], rule)

		if (diff === 0) return
		if (diff > 0) break
	}

	existingRules.splice(i, 0, {
		LHS: rule.LHS,
		RHS: rule.RHS,
		RHSIdx: rule.RHSIdx,
		ruleProps: rule.ruleProps
	})
}

function getItems(XTab, ruleSet, RHSSym) {
	for (var x = XTab.length; x-- > 0;) {
		var xItems = XTab[x]
		if (xItems.sym === RHSSym) {
			return xItems
		}
	}

	// Existing not found
	var items = { sym: RHSSym, list: [] }
	XTab.push(items)

	// Rules from grammar
	RHSSym.rules.forEach(function (rule) {
		ruleSet.push({
			LHS: RHSSym,
			RHS: rule.RHS,
			RHSIdx: 0,
			ruleProps: rule.ruleProps
		})
	})

	return items
}

StateTable.prototype.generate = function (startSym) {
	var ruleSets = []

	var startRule = { RHS: [ startSym ], RHSIdx: 0 }
	addState(ruleSets, [ startRule ])

	for (var S = 0; S < ruleSets.length; S++) {
		var ruleSet = ruleSets[S].slice()
		var XTab = []
		var newState = { reds: [] }

		for (var r = 0; r < ruleSet.length; r++) {
			var rule = ruleSet[r]

			if (!rule.RHS[rule.RHSIdx]) {
				if (!rule.LHS) newState.isFinal = true
			} else {
				var RHSSym = rule.RHS[rule.RHSIdx]
				var items = getItems(XTab, ruleSet, RHSSym)

				// Duplicate rule, saving RHSIdx
				// Add rule to list of rules that produce RHSSym
				rule.RHSIdx++
				addRule(items, rule)
				rule.RHSIdx--
			}
		}

		ruleSet.forEach(function (rule) {
			if (!rule.RHS[rule.RHSIdx] && rule.LHS) {
				newState.reds.push({
					LHS: rule.LHS,
					RHS: rule.RHS,
					ruleProps: rule.ruleProps
				})
			}
		})

		newState.shifts = XTab.map(function (shift) {
			return { sym: shift.sym, stateIdx: addState(ruleSets, shift.list) }
		})

		this.shifts.push(newState)
	}
}

StateTable.prototype.print = function () {
	this.shifts.forEach(function (state, S) {
		console.log(S + ':')

		if (state.isFinal) console.log('\taccept')

		state.reds.forEach(function (red) {
			var toPrint = '\t[' + red.LHS.name + ' ->'

			red.RHS.forEach(function (sym) {
				toPrint += ' ' + sym.name
			})

			toPrint += ']'

			console.log(toPrint, red.ruleProps)
		})

		state.shifts.forEach(function (shift) {
			console.log('\t' + shift.sym.name + ' => ' +  shift.stateIdx)
		})
	})
}