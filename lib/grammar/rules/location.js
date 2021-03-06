var g = require('../grammar')


var city = g.newSymbol('city').addRule({
	isTerminal: true,
	isPlaceholder: true,
	rhs: g.newEntityCategory({
		name: 'city',
		entities: [
			{ display: 'Shanghai, China', names: [ 'Shanghai China' ] },
			{ display: 'Karachi, Pakistan', names: [ 'Karachi Pakistan' ] },
			{ display: 'Beijing, China', names: [ 'Beijing China' ] },
			{ display: 'Lagos, Nigeria', names: [ 'Lagos Nigeria' ] },
			// The entity name token "Detroit" creates two instances of the same entity because `Parser` much check the different entity token sets to ensure correct multi-token matches.
			{ display: 'Detroit, Michigan', names: [ 'Detroit Michigan', 'Detroit MI' ] },
			{ display: 'San Fransisco, California', names: [ 'San Fransisco California', 'San Fransisco CA' ] },
			{ display: 'Cupertino, California', names: [ 'Cupertino California', 'Cupertino CA' ] },
		],
	}),
})

var region = g.newSymbol('region').addRule({
	isTerminal: true,
	isPlaceholder: true,
	rhs: g.newEntityCategory({
		name: 'region',
		entities: [
			{ display: 'California', names: [ 'California', 'CA' ] },
			{ display: 'Missouri', names: [ 'Missouri', 'MO' ] },
		],
	}),
})

var country = g.newSymbol('country').addRule({
	isTerminal: true,
	isPlaceholder: true,
	rhs: g.newEntityCategory({
		name: 'country',
		entities: [
			'China',
			'Pakistan',
			'Nigeria',
			{ display: 'United States', names: [ 'United States', 'US', 'USA' ] },
		],
	}),
})

// (companies in) `{city}`|`{region}`|`{country}`
var location = g.newSymbol('location').addRule({
	rhs: [ city ],
}).addRule({
	rhs: [ region ],
}).addRule({
	rhs: [ country ],
})

module.exports = location