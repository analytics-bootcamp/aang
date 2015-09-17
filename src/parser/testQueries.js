// Queries to test speed and various cases.
exports.basic = [
	'repos I have liked',
	'repos created by me and my followers',
	'repos I and my followers created',
	'people who like my repos liked by people who follow people I follow',
	'people who like repos',
	'repos been followers',
	'repos been followers people who like repos that I have',
	'repos people who like and created',
	'repos that have been created by people and like and I contributed to',
	'repos that are repos',
	'my followers who are my followers', // Intentionally wrong
	'my followers who are followers of followers of mine',
	'my followers who are followers of followers of mine who liked that repos contributed to of mine',
	'repos',
	'people',
	'people who created my repos and my pull requests',
	'people pull requests like repos I like',
	'repos liked by followers of followers of mine',
	'repos liked by me and my followers',
	'repos liked by me and my followers and people who like JavaScript repos liked by me and my followers',
	'my repos that are JavaScript repos',
	'my JavaScript repos',
	'repos that are written in JavaScript',
	'my JavaScript repos that are written in JavaScript', // Intentionally fails
	'issues assigned to me I opened and am mentioned in',
	'people who are assigned to my issues and follow people who contributed to repos I created and are mentioned in pull requests of mine',
	'people who are mentioned in my issues and pull requests',
	'people who are assigned to my issues and my pull requests',
	'people mentioned in my issues and my pull requests',
	'my {left-stop-words} repos',
	'my {left-stop-words} JavaScript repos',
	'my JavaScript {left-stop-words} repos',
	'my {left-stop-words} JavaScript {left-stop-words} repos',
	'my {left-stop-words} {left-stop-words} repos',
	'open issues',
	'issues that are open',
	'people assigned to my closed issues',
	'contributors to my repos',
	'contributors to my repos and repos of mine',
	'likers of my repos',
	'creators of repos I like',
	'likers of repos I like and repos I contributed to',
	'creators of repos I like and repos I contributed to',
	'creators of repos I like and pull requests I am mentioned in', // Unimplemented
	'openers of closed issues that mention people I and my followers follow',
	'people who are not followers of mine',
	'people who have not been followed by me',
	'issues that are not open',
	'people who are not followed by me',
	'people I do not follow',
	'people who follow me and do not follow Danny',
	'issues I am assigned to',
	'{left-stop-words} open issues that are never assigned to people who {pre-filter-stop-words} follow me',
	'repos of people who follow me',
	'followers of mine and people who follow me',
	'repos of mine and people who follow me',
	'repos I like or my followers likes',
	'repos I or my followers likes',
	'repos created by people I follow and Danny follows',
	'repos created by people I and Danny follow',
	'people who follow people',
	'people followed by myself',
	'people who follow I',
	'people me follows',
	'openers of my closed issues that mention me people who follow me and my followers follow follow',
	'repos people my followers follow like',
	'people people Danny follows follow',
	'repos people people Danny follows follow created Danny likes',
	'followers of my followers who are followers of mine my followers who created repositories of my followers followers of mine who I follow like that are repos I contributed to follow',
	'repos contributed to by me',
	'repos to by me', // Intentionally wrong
	'repos liked contributed to by me', // Intentionally wrong
	'repos by me',
	'issues opened by me assigned to me', // transposition
	'issues with 22 comments',
	'issues assigned to me with 22 comments',
	'issues with 20 to 34 comments I opened',
	'issues that are with between 20 comments and 34 comments',
	'issues with 3 comments to 3 comments',
	'issues with 3 to 3 comments',
	'issues with less than 2 > 4 comments',
	'JavaScript repos liked by me and my followers',
	'repos with between 22 and 23 likes',
	'repos created in 2014',
	'repos created 2014',
	'repos created in June 2014',
	'repos created in June 24 2014',
	'repos created this year',
	'repos created after this year',
	'repos created between last year and this year',
	'repos created from 2012 to 2014',
	'repos created before June 20 2000 and after this year',
	'people I and Danny follows', // Intentionally wrong
	'people people Danny follow and Danny follows', // Intentionally wrong
	'likers of my repos I contributed to that I like and my repos I contributed to',
	'my GitHub repos liked by my github followers',
	'my followers\' repos',
	'my {left-stop-words} followers\' repos',
	'my {left-stop-words} followers\' {left-stop-words} repos',
	'Danny\'s followers\' followers',
	'repos of Danny\'s',
	'Danny\'s followers',
	'people who are male',
	'female people',
	'female people who are male',
	'male people who are not male',
	'my male followers',
	'Danny\'s male followers',
	'my followers\' female followers',
	'my female followers\' female followers',
	'my female followers\' female followers who are not male',
	'REPOS i LiKe',
	'repos that are not created today liked by me',
	'people who are not my followers',
	'repos not created today not liked by me', // should produce results
	'women',
	'men I follow',
	'people who are males',
	'male women',
	'female people who are women',
	'repos that are created by me and are not created by me',
	'repos that are not created by me and are created by me',
	'people people I follow who Danny follow and follow Danny follow',
	'repos people I follow created that Danny like',
	'issues assigned to me Danny opened and Aang are mentioned in',
	'people {user} follows', // Intentionally fails
	'people I and {user} follow', // Intentionally fails
	'issues with <int> comments', // Intentionally fails
	'my repos me people who follow my followers have been and',
	'people my followers who created repositories of my followers followers of mine who I follow like follow',
	'contributors to my repos or repos I like or Danny likes',
	'repos I like or I created',
	'repos I or Danny like',
	'repos I or Danny or my followers like',
	'repos I or Danny and my followers like',
	'repos I or Danny created',
	'people never currently I follow',
	'people I have',
	'repos I have',
	'repos been liked by me',
	'people who not been followed by me',
	'repos I contributed to',
	'repos I to contributed to',
	'repos I to created',
	'repos I to have created',
	'repos I and Danny have contributed to',
	'repos I did create',
	'people who have liked my repos',
	'people who',
	'people who like',
	'people who have',
	'people who have been',
	'repos that',
	'repos that have',
	'repos that been',
	'repos that have been',
	'issues that',
	'issues that have',
	'issues that been',
	'issues that have been',
	'pull requests that',
	'pull requests that have',
	'pull requests that been',
	'pull requests that have been',
	'people who repos',
	'people who have repos',
	'people who have my repos',
	'people who issues',
	'people who have issues',
	'people who have my issues',
	'people who pull requests',
	'people who have pull requests',
	'people who have my pull requests',
	'repos who have liked my repos',
	'people who have issues pull requests',
	'people who have issues pull requests repos',
	'issues been',
	'issues opened by me that mention followers of people who like repos creators of Node contributed to',
	'issues opened by me that mention followers of people who like repos creators of Node contributed to and are assigned to pull requests I am not mentioned in',
	'issues opened me followers people repos creators of Node contributed to assigned to pull requests am not mentioned in',
	'people who do contributed to my repos',
	'people who do contributed not to my repos',
	'issues with -20 to 34 comments I opened', // Intentionally fails
	'repos created before June 0 2000 and July -2 3000', // Intentionally fails
	'repos created before June 32 1940', // Intentionally fails
	'repos created before June 31 1950',
	'people who do not follow me',
	'people who people',
	'people who followers',
	'my pull requests assigned to me',
	'repos I do not like',
	'repos I did not like',
	'repos Danny does not like',
	'repos Danny has not liked',
	'repos Danny has liked',
	'repos Danny have likes',
	'repos I have not liked',
	'repos I has not liked',
	'repos I not have liked', // enable transpositions?
	'repos people who follow me and I do not like',
	'repos people who follow me and me do not like',
	'repos people who follow me and I does not like',
	'repos people who follow me and I have not liked',
	'repos people who follow me and I has not likes',
	'repos people who have not liked Danny\'s repos created',
	'repos I did not have liked',
	'repos Danny and I do not like',
	'repos Danny and people who follow Danny have not liked',
	'repos that have been liked by me',
	'people who do not like my repos',
	'repos that have not been liked by me',
	'repos that not been liked by me',
	'repos not been liked by me',
	'people who have not liked my repos',
	'repos I and Danny do not liked',
	'repos I and Danny do not like',
	'repos I and Danny have not liked',
	'repos Danny does like',
	'repos I not liked',
	'repos Danny and Aang and I do not like',
	'repos Danny and has not liked',
	'repos Danny and Aang not have liked',
	'repos my followers have not liked',
	'repos my followers like',
	'my repositories people who created my repos created', // Intentionally wrong
	'repos created today created yesterday', // Should fail
	'people who like my repos liked by people who follow me that people I follow created', // Intentionally wrong, but should produce results
	'repos Danny by me',
	'repos Danny by me Danny',
	'repos I not',
	'issues I not',
	'pull requests I not',
	'repos Danny contributed to and I like',
	'repos I and Danny have not contributed to',
	'repos Danny has not contributed to',
	'repos people who do not like my repos have not contributed to',
	'people who have not contributed to my repos',
	'repos that are not JavaScript repos',
	'repos that are not written in JavaScript',
	'people who are not followed by me',
	'people not followed by me', // Only allowing "people who are not followed by me"
	'repos not written in JavaScript', // Not allowing
	'people not mentioned in my issues', // Not allowing
	'issues not assigned to me',
	'repos that are not my repos',
	'repos I create',
	'repos Danny has created',
	'repos I did not create',
	'repos Danny did not create',
	'repos Danny do not creates',
	'repos I have not created', // Intentionally wrong
	'repos I made',
	'repos I did not make',
	'issues I did not open',
	'issues I create', // Intentionally wrong
	'issues I did not created', // Intentionally wrong
	'people who do not created my repos', // Should not accept
	'people who did not create my repos',
	'people who do not have liked my repos', // Should not accept
	'people who do not have opened my issues', // Should not accept
	'issues that do not mention me',
	'issues that are not assigned to my followers',
	'issues that have not been assigned to me',
	'issues Danny is not assigned to',
	'pull requests my followers are not mentioned in',
	'pull requests that have not been assigned to me',
	'people who did not like',
	'people who like my',
	'that mention me',
	'that I contributed to',
	'people who did not contributed to my repos',
	'Danny\'s followers who do not follow me',


	// 'followers my followers share',
	// 'followers I and Danny have in common',
	// 'followers I share', // intentionally wrong
	// 'followers I share with Danny',
	// 'followers I and Danny share with Aang',
	// 'followers I and Danny share with Aang and my followers',
	// 'followers Danny has in common with' // doesn't work

	// 'repos that I created I like', // intentionally wrong - unimplemented
	// 'people who I follow Danny follows', // intentionally wrong - unimplemented
	// 'pull requests of mine created by my followers' // no results, too slow. Look at parse stack
	// 'my followers who created pull requests of mine my followers who created repositories followers of mine mentioned in issues of my followers who I follow like that are repos created by me I contributed to am mentioned in that I am mentioned in', // really slow, but because of some rule - look at parse stack. Remove some ambiguous insertions
	// 'my' - no results, but should have some
]

// Queries to test conjugation.
// The display text of the first test must match the input query exactly.
exports.conjugation = [
	'people I follow',
	'people Danny follows',
	'people I and Danny follow',
	'people Danny and I follow',
	'people people Danny follows follow',
	'people people Danny follows and Danny follow',
	'repos I have liked',
	'repos Danny has liked',
	'issues assigned to me Danny opened and Aang is mentioned in',
	'repos people I follow created that Danny likes',
	'people people I follow who Danny follows and follow Danny follow',
	'people who have liked my repos',
	'repos that are liked by my followers',
	'repos that were liked by my followers',
	'people who have not been followed by me',
	'people who do not follow me',
	'repos I do not like',
	'repos Danny does not like',
	'repos Danny has not liked',
	'repos I have not liked',
	'repos people who follow me and I do not like',
	'repos people who follow me and I have not liked',
	'repos Danny and I do not like',
	'repos Danny and people who follow Danny have not liked',
	'repos that have been liked by me',
	'people who do not like my repos',
	'repos that have not been liked by me',
	'people who have not liked my repos',
	'repos I and Danny do not like',
	'repos I and Danny have not liked',
	'repos Danny and Aang and I do not like',
	'repos my followers have not liked',
	'repos my followers like',
	'repos Danny contributed to and I like',
	'repos I and Danny have not contributed to',
	'repos Danny has not contributed to',
	'repos people who do not like my repos have not contributed to',
	'repos I created',
	'repos Danny has created',
	'repos I did not create',
	'repos Danny did not create',
	'people who did not create my repos',
	'issues Danny is not assigned to',
	'pull requests my followers are not mentioned in',
	'people I do not follow',
	'issues that do not mention me',
	'people who did not contribute to my repos',
]