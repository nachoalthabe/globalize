define([
	"./common/runtime-key",
	"./common/create-error/unsupported-feature",
	"./common/validate/parameter-presence",
	"./common/validate/parameter-type/number",
	"./common/validate/parameter-type/string",
	"./core-runtime",
	"./number/format",
	"./number/parse",
	"./util/number/round"
], function( runtimeKey, createErrorUnsupportedFeature, validateParameterPresence,
	validateParameterTypeNumber, validateParameterTypeString, Globalize, numberFormat,
	numberParse, numberRound ) {

Globalize._createErrorUnsupportedFeature = createErrorUnsupportedFeature;
Globalize._numberFormat = numberFormat;
Globalize._numberParse = numberParse;
Globalize._numberRound = numberRound;
Globalize._validateParameterPresence = validateParameterPresence;
Globalize._validateParameterTypeNumber = validateParameterTypeNumber;
Globalize._validateParameterTypeString = validateParameterTypeString;

Globalize.numberFormatter =
Globalize.prototype.numberFormatter = function( options ) {
	options = options || {};
	return Globalize[ runtimeKey( "numberFormatter", this._locale, arguments ) ];
};

Globalize.numberParser =
Globalize.prototype.numberParser = function( options ) {
	options = options || {};
	return Globalize[ runtimeKey( "numberParser", this._locale, arguments ) ];
};

Globalize.formatNumber =
Globalize.prototype.formatNumber = function( value, options ) {
	validateParameterPresence( value, "value" );
	validateParameterTypeNumber( value, "value" );

	return this.numberFormatter( options )( value );
};

Globalize.parseNumber =
Globalize.prototype.parseNumber = function( value, options ) {
	validateParameterPresence( value, "value" );
	validateParameterTypeString( value, "value" );

	return this.numberParser( options )( value );
};

return Globalize;

});
