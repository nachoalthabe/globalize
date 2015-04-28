/**
 * Globalize Runtime v1.0.0
 *
 * http://github.com/jquery/globalize
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-04-28T21:16Z
 */
/*!
 * Globalize Runtime v1.0.0 2015-04-28T21:16Z Released under the MIT license
 * http://git.io/TrdQbw
 */
(function( root, factory ) {

	// UMD returnExports
	if ( typeof define === "function" && define.amd ) {

		// AMD
		define([
			"../globalize-runtime",
			"./number"
		], factory );
	} else if ( typeof exports === "object" ) {

		// Node, CommonJS
		module.exports = factory(
			require( "globalize/dist/globalize-runtime" ),
			require( "globalize/dist/globalize-runtime/number" )
		);
	} else {

		// Extend global
		factory( root.Globalize );
	}
}(this, function( Globalize ) {

var formatMessage = Globalize._formatMessage,
	runtimeKey = Globalize._runtimeKey,
	validateParameterPresence = Globalize._validateParameterPresence,
	validateParameterTypeNumber = Globalize._validateParameterTypeNumber;


/**
 * nameFormat( formattedNumber, pluralForm, properties )
 *
 * Return the appropriate name form currency format.
 */
var currencyNameFormat = function( formattedNumber, pluralForm, properties ) {
	var displayName, unitPattern,
		displayNames = properties.displayNames || {},
		unitPatterns = properties.unitPatterns;

	displayName = displayNames[ "displayName-count-" + pluralForm ] ||
		displayNames[ "displayName-count-other" ] ||
		displayNames.displayName ||
		properties.currency;
	unitPattern = unitPatterns[ "unitPattern-count-" + pluralForm ] ||
		unitPatterns[ "unitPattern-count-other" ];

	return formatMessage( unitPattern, [ formattedNumber, displayName ]);
};




Globalize._currencyNameFormat = currencyNameFormat;

Globalize.currencyFormatter =
Globalize.prototype.currencyFormatter = function( currency, options ) {
	options = options || {};
	return Globalize[ runtimeKey( "currencyFormatter", this._locale, arguments ) ];
};

Globalize.formatCurrency =
Globalize.prototype.formatCurrency = function( value, currency, options ) {
	validateParameterPresence( value, "value" );
	validateParameterTypeNumber( value, "value" );

	return this.currencyFormatter( currency, options )( value );
};

return Globalize;




}));
