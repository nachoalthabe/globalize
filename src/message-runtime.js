define([
	"./common/runtime-key",
	"./common/validate/parameter-type/message-variables",
	"./core-runtime"
], function( runtimeKey, validateParameterTypeMessageVariables, Globalize ) {

Globalize._messageFormat = {};
Globalize._validateParameterTypeMessageVariables = validateParameterTypeMessageVariables;

Globalize.messageFormatter =
Globalize.prototype.messageFormatter = function( /* path */ ) {
	return Globalize[ runtimeKey( "messageFormatter", this.locale, arguments ) ];
};

Globalize.formatMessage =
Globalize.prototype.formatMessage = function( path /* , variables */ ) {
	return this.messageFormatter( path ).apply( {}, [].slice.call( arguments, 1 ) );
};

return Globalize;

});
