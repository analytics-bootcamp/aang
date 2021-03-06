/**
 * Usage
 *   node parse <query> [options]
 *
 * Description
 *   Parses <query> and outputs the k-best parse trees.
 *
 * Options
 *   -k                        The maximum number of parse trees to find.                  [default: 7]
 *   -q, --quiet               Suppress parse results from output.                            [boolean]
 *   -b, --benchmark           Benchmark each test's parse duration.                          [boolean]
 *   -c, --costs               Print the parse costs.                                         [boolean]
 *   -a, --ambiguity           Print instances of semantic ambiguity.                         [boolean]
 *   -t, --trees               Print the parse trees.                                         [boolean]
 *   -n, --tree-node-costs     Include in parse trees each node's path cost.                  [boolean]
 *   -r, --tree-token-ranges   Include in parse trees each node's token range.                [boolean]
 *   -s, --semantics           Print the semantic representation of each parse tree.
 *                                                                            [boolean] [default: true]
 *   -o, --object-semantics    Print object representations of the semantics.                 [boolean]
 *   -p, --parse-stack         Print the parse stack.                                         [boolean]
 *   -f, --parse-forest        Print an equational representation of the parse forest.        [boolean]
 *   -g, --parse-forest-graph  Print a graph representation of the parse forest.              [boolean]
 *   -h, --help                Display this screen.                                           [boolean]
 *
 * Examples
 *   node parse "people who follow me" -k=5 -t   Finds the 5-best parse trees for the query, and
 *                                               includes the parse trees in the parse results.
 *   node parse "people I follow" -sfq           Finds the 7-best parse trees for the query, prints the
 *                                               parse forest and parse stack, but does not print the
 *                                               parse results.
 *   node parse "males my followers follow" -bc  Finds the 7-best parse trees for the query, prints the
 *                                               duration of the parse, and includes the parse tree
 *                                               costs in the parse results.
 */

var util = require('../../util/util')
var yargs = require('yargs')

var argv = yargs
	.usage([
		util.colors.bold('Usage'),
		'  node $0 <query> [options]',
		'',
		util.colors.bold('Description'),
		'  Parses <query> and outputs the k-best parse trees.',
	].join('\n'))
	.updateStrings({
		'Options:': util.colors.bold('Options'),
		'Examples:': util.colors.bold('Examples'),
	})
	.demand(1, 'Error: Missing input query')
	.options({
		'k': {
			description: 'The maximum number of parse trees to find.',
			requiresArg: true,
			default: 7,
		},
		'q': {
			alias: 'quiet',
			description: 'Suppress parse results from output.',
			type: 'boolean',
		},
		'b': {
			alias: 'benchmark',
			description: 'Benchmark each test\'s parse duration.',
			type: 'boolean',
		},
		'c': {
			alias: 'costs',
			description: 'Print the parse costs.',
			type: 'boolean',
		},
		'a': {
			alias: 'ambiguity',
			description: 'Print instances of semantic ambiguity.',
			type: 'boolean',
		},
		't': {
			alias: 'trees',
			description: 'Print the parse trees.',
			type: 'boolean',
		},
		'n': {
			alias: 'tree-node-costs',
			description: 'Include in parse trees each node\'s path cost.',
			type: 'boolean',
		},
		'r': {
			alias: 'tree-token-ranges',
			description: 'Include in parse trees each node\'s token range.',
			type: 'boolean',
		},
		's': {
			alias: 'semantics',
			description: 'Print the semantic representation of each parse tree.',
			type: 'boolean',
			default: true,
		},
		'o': {
			alias: 'object-semantics',
			description: 'Print object representations of the semantics.',
			type: 'boolean',
		},
		'p': {
			alias: 'parse-stack',
			description: 'Print the parse stack.',
			type: 'boolean',
		},
		'f': {
			alias: 'parse-forest',
			description: 'Print an equational representation of the parse forest.',
			type: 'boolean',
		},
		'g': {
			alias: 'parse-forest-graph',
			description: 'Print a graph representation of the parse forest.',
			type: 'boolean',
		},
	})
	.help('h', 'Display this screen.').alias('h', 'help')
	.example('node $0 \"people who follow me\" -k=5 -t', 'Finds the 5-best parse trees for the query, and includes the parse trees in the parse results.')
	.example('node $0 \"people I follow\" -sfq', 'Finds the 7-best parse trees for the query, prints the parse forest and parse stack, but does not print the parse results.')
	.example('node $0 \"males my followers follow\" -bc', 'Finds the 7-best parse trees for the query, prints the duration of the parse, and includes the parse tree costs in the parse results.')
	.check(function (argv, options) {
		if (isNaN(argv.k)) {
			throw 'TypeError: \'-k\' is not a number: ' + argv.k
		}

		return true
	})
	// Fail on unrecognized arguments.
	.strict()
	.wrap(Math.min(yargs.terminalWidth(), 100))
	.argv

// Modify stack trace format to stylize output when printing.
util.prettifyStackTrace()

var StateTable = require('./StateTable')
var Parser = require('./Parser')
var printParseResults = require('./printParseResults')

// Generate a `StateTable` from the grammar and instantiate a `Parser`.
var stateTable = new StateTable(require('../grammar.json'))
var parser = new Parser(stateTable)

var query = argv._.join(' ')

// Benchmark the duration of the parse and the parse forest search.
if (argv.benchmark) util.time('parse')

// Parse `query` and generate the k-best parse trees.
var parseResults = parser.parse(query, argv.k, {
	buildTrees: argv.trees,
	printAmbiguity: argv.ambiguity,
})

if (argv.benchmark) util.timeEnd('parse')

// Print the display text and semantics for the k-best parse trees, if any.
printParseResults(parseResults, {
	quiet: argv.quiet,
	costs: argv.costs,
	trees: argv.trees,
	treeNodeCosts: argv.treeNodeCosts,
	treeTokenRanges: argv.treeTokenRanges,
	objectSemantics: argv.objectSemantics,
	noSemantics: !argv.semantics,
	diffInputQuery: query,
})

// Print a graph representation of the parse forest.
if (argv.parseForestGraph && parser.startNode) {
	parser.nodeGraph(parser.startNode)
}

// Print the parse stack.
if (argv.parseStack) parser.printStack()

// Print an equational representation of the parse forest.
if (argv.parseForest) parser.printForest()

// Print values of any counters used during the parse.
util.countEndAll()