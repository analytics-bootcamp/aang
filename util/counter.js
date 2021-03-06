/**
 * @license
 * counter
 * Copyright 2015-2016 Danny Nemer <http://dannynemer.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */

var util = require('./util')

/**
 * Used as a key-value map for counters.
 *
 * @private
 * @type {Object}
 */
var _counts = Object.create(null)

/**
 * Increments the invocation count for `label`. Use `counter.end(label)` or `counter.endAll()` to print the counter's value. This is useful to profile the number of times a section of code is reached.
 *
 * @static
 * @memberOf counter
 * @param {string} label The counter identifier.
 * @example
 *
 * for (var i = 0; i < 100; ++i) {
 *   if (i % 2 === 0) counter.count('even')
 * }
 *
 * counter.end('even')
 * // => Resets the count for 'even' to 0
 * // => Prints "even: 50"
 */
exports.count = function (label) {
	_counts[label] = (_counts[label] || 0) + 1
}

/**
 * Prints (and resets the value of) the number of `counter.count(label)` invocations.
 *
 * @static
 * @memberOf counter
 * @param {string} label The counter identifier.
 */
exports.end = function (label) {
	// Print even if count is 0 to acknowledge never being reached.
	util.log(label + ':', _counts[label] || 0)

	// Reset count.
	delete _counts[label]
}

/**
 * Prints (and resets the values of) the counter value of each label recorded by `counter.count()`, and each counter's value as a percentage of all counters.
 *
 * Does not print counters that are never reached (having not initialized their keys). Prints counts in order of decreasing value.
 *
 * @static
 * @memberOf counter
 * @example
 *
 * for (var i = 0; i < 99; ++i) {
 * 	counter.count(i % 2 === 0 ? 'even' : 'odd')
 * }
 *
 * counter.endAll()
 * // => Resets all counts to 0
 * // => Prints "even: 50 (50.5%)
 * //            odd: 49 (49.5%)"
 */
exports.endAll = function () {
	// Sort counts by decreasing value.
	var labels = Object.keys(_counts).sort(function (a, b) {
		return _counts[b] - _counts[a]
	})

	// Total `counter.count()` invocations.
	var total = labels.reduce(function (accum, label) {
		return accum + _counts[label]
	}, 0)

	for (var l = 0, labelsLen = labels.length; l < labelsLen; ++l) {
		var label = labels[l]
		var count = _counts[label]

		if (labelsLen > 1) {
			util.log(label + ':', count, '(' + (count / total * 100).toPrecision(3) + '%)')
		} else {
			// Omit percentages if only one counter.
			util.log(label + ':', count)
		}

		// Reset count.
		delete _counts[label]
	}
}