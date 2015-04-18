define([
	"./common/runtime-key",
	"./common/validate/parameter-presence",
	"./common/validate/parameter-type/number",
	"./core-runtime"
], function( runtimeKey, validateParameterPresence, validateParameterTypeNumber, Globalize ) {

Globalize._validateParameterTypeNumber = validateParameterTypeNumber;

Globalize.plural =
Globalize.prototype.plural = function( value, options ) {
	validateParameterPresence( value, "value" );
	validateParameterTypeNumber( value, "value" );
	return this.pluralGenerator( options )( value );
};

Globalize.pluralGenerator =
Globalize.prototype.pluralGenerator = function( options ) {
	options = options || {};
	return Globalize[ runtimeKey( "pluralGenerator", this.locale, arguments ) ];
};

return Globalize;

});
