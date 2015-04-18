var COMPILED_ORDER, DEPENDENCIES, DEPENDENCIES_VARS, slice, template,
	extend = require( "util" )._extend,
	fs = require( "fs" );

COMPILED_ORDER = [

  // No dependencies.
	"numberFormatter",
	"numberParser",
	"pluralGenerator",

	// Depends on plural.
	"messageFormatter",

	// Depends on number and/or plural.
	"currencyFormatter",
	"dateFormatter",
	"dateParser",
	"relativeTimeFormatter"
];

DEPENDENCIES = {
	currencyFormatter: { currency: true, number: true },
	dateFormatter: { date: true },
	dateParser: { date: true },
	messageFormatter: { message: true },
	numberFormatter: { number: true },
	numberParser: { number: true },
	pluralGenerator: { plural: true },
	relativeTimeFormatter: { number: true, plural: true }
};

DEPENDENCIES_VARS = {
	currencyFormatter: {
		currencyNameFormat: true,
		validateParameterPresence: true,
		validateParameterTypeNumber: true
	},
	dateFormatter: {
		dateFormat: true,
		validateParameterPresence: true,
		validateParameterTypeDate: true
	},
	dateParser: {
		dateParse: true,
		dateTokenizer: true,
		validateParameterPresence: true,
		validateParameterTypeString: true
	},
	messageFormatter: {
		messageFormat: true,
		validateParameterTypeMessageVariables: true
	},
	numberFormatter: {
		numberFormat: true,
		numberRound: true,
		validateParameterPresence: true,
		validateParameterTypeNumber: true
	},
	numberParser: {
		numberParse: true,
		validateParameterPresence: true,
		validateParameterTypeString: true
	},
	pluralGenerator: {
		validateParameterPresence: true,
		validateParameterTypeNumber: true
	},
	relativeTimeFormatter: {
		validateParameterPresence: true,
		validateParameterTypeNumber: true
	}
};

slice = [].slice;
template = fs.readFileSync( __dirname + "/compiler.template" ).toString( "utf-8" );

function functionName( fn ) {
	return /^function\s+([\w\$]+)\s*\(/.exec( fn.toString() )[ 1 ];
}

function stringifyIncludingFunctionsAndUndefined( object ) {
	var json,
		fnPlaceholder = "fnPlaceholderBRVOhnVwmkNxKbCxydG9dZLhwf4puXOzkscBSgwk",
		fns = [],
		undefinedPlaceholder = "undefinedPlaceholderBRVOhnVwmkNxKbCxydG9dZLhwf4puXOzkscBSgwk";
	json = JSON.stringify( object, function( key, value ) {
		if ( typeof value === "function" ) {
			fns.push( value );
			return fnPlaceholder;
		} else if ( value === undefined ) {
			return undefinedPlaceholder;
		}
		return value;
	});
	return json.replace( new RegExp( "\"" + fnPlaceholder + "\"", "g" ), function() {
		var fn = fns.shift();
		if ( "generatorString" in fn ) {
			return fn.generatorString();
		} else {
			return fn.toString();
		}
	}).replace( new RegExp( "\"" + undefinedPlaceholder + "\"", "g" ), "" );
}

function compile( formatterOrParser ) {
	var runtimeArgsNames,
		runtimeKey = formatterOrParser.runtimeKey,
		runtimeArgs = formatterOrParser.runtimeArgs;

	runtimeArgsNames = Object.keys( runtimeArgs ).join( ", " );
	runtimeArgs = Object.keys( runtimeArgs ).map(function( key ) {
		return runtimeArgs[ key ];
	}).map( stringifyIncludingFunctionsAndUndefined ).join( ", " );

	return "Globalize." + runtimeKey + " = (function( " + runtimeArgsNames + " ) {\n" +
		"  return " + formatterOrParser.toString() + "\n" +
		"}(" + runtimeArgs + "));";
}

function deduceDependenciesVars( formatterOrParser ) {
	return DEPENDENCIES_VARS[ functionName( formatterOrParser ) ];
}

/**
 * compiler( formatterOrParser, ... ), or
 * compiler({ formatterOrParserName: formatterOrParser, ... })
 *
 * @formatterOrParser
 *
 * Returns a string with the compiled formatters and parsers.
 */
function compiler() {
	var dependencies,
		args = slice.call( arguments, 0 ),
		formattersAndParsers = [],
		formattersAndParsersKeys = [],
		properties = {};

	// Extract Formatters and Parsers from arguments (and its nested formatters and parsers).
	function extractFormattersAndParsers( object ) {
		JSON.stringify( object, function( key, value ) {

			// If a node is a formatter or a parser function, push it to our Array.
			if ( typeof value === "function" && "runtimeArgs" in value ) {
				formattersAndParsers.push( value );

				// ... and do the same for its runtimeArgs (extract nested formatters or parsers).
				extractFormattersAndParsers( value.runtimeArgs );
			}

			return value;
		});
	}
	function uniqueFormattersAndParsers( formatterOrParser ) {
		var filter = formattersAndParsersKeys.indexOf( formatterOrParser.runtimeKey ) === -1;
		formattersAndParsersKeys.push( formatterOrParser.runtimeKey );
		return filter;
	}
	extractFormattersAndParsers( args );
	formattersAndParsers = formattersAndParsers.filter( uniqueFormattersAndParsers );

	if ( !formattersAndParsers.length ) {
		throw new Error( "No formatters or parsers has been provided" );
	}

	// Generate the compiled functions.
	properties.compiled = formattersAndParsers.sort(function( a, b ) {
		a = functionName( a );
		b = functionName( b );
		return COMPILED_ORDER.indexOf( a ) - COMPILED_ORDER.indexOf( b );
	}).map( compile ).join( "\n" );

	// Generate dependency assignments and requirements.
	dependencies = Object.keys( formattersAndParsers.map( functionName ).reduce(function( sum, i ) {
		return extend( sum, DEPENDENCIES[ i ] );
	}, {}));
	properties.dependenciesAmd = JSON.stringify( dependencies.map(function( dependency ) {
		return "globalize-runtime/" + dependency;
	}));
	properties.dependenciesCjs = dependencies.map(function( dependency ) {
		return "require(\"globalize/dist/globalize-runtime/" + dependency + "\")";
	}).join( ", " );
	properties.dependenciesVars = formattersAndParsers.map( deduceDependenciesVars ).reduce(function( sum, i ) {
		return extend( sum, i );
	}, {});
	properties.dependenciesVars = Object.keys( properties.dependenciesVars ).map(function( dependency ) {
		return "var " + dependency + " = Globalize._" + dependency + ";";
	}).join( "\n" );

	/*
	// Generate exports.
	if ( args.length === 1 ) {
		properties.exports = args[ 0 ];
	} else {
		properties.exports = args;
	}
	properties.exports = "return " + stringifyIncludingFunctionsAndUndefined( properties.exports );
	*/

	return template.replace( /{{[a-zA-Z]+}}/g, function( name ) {
		name = name.slice( 2, -2 );
		return properties[ name ];
	});
}

module.exports = compiler;
