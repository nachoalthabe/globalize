define([
	"./common/runtime-key",
	"./common/validate/parameter-presence",
	"./common/validate/parameter-type/number",
	"./core-runtime",
	"./currency/name-format",

	"./number-runtime"
], function( runtimeKey, validateParameterPresence, validateParameterTypeNumber, Globalize,
	currencyNameFormat ) {

Globalize._currencyNameFormat = currencyNameFormat;

Globalize.currencyFormatter =
Globalize.prototype.currencyFormatter = function( currency, options ) {
	options = options || {};
	return Globalize[ runtimeKey( "currencyFormatter", this.locale, arguments ) ];
};

Globalize.formatCurrency =
Globalize.prototype.formatCurrency = function( value, currency, options ) {
	validateParameterPresence( value, "value" );
	validateParameterTypeNumber( value, "value" );

	return this.currencyFormatter( currency, options )( value );
};

return Globalize;

});
