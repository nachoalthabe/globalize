define([
	"cldr",
	"make-plural",
	"./common/cache-get",
	"./common/cache-set",
	"./common/runtime-bind",
	"./common/validate/cldr",
	"./common/validate/default-locale",
	"./common/validate/parameter-presence",
	"./common/validate/parameter-type",
	"./common/validate/parameter-type/number",
	"./common/validate/parameter-type/plain-object",
	"./common/validate/parameter-type/plural-type",
	"./core",

	"cldr/event",
	"cldr/supplemental"
], function( Cldr, MakePlural, cacheGet, cacheSet, runtimeBind, validateCldr, validateDefaultLocale,
	validateParameterPresence, validateParameterType, validateParameterTypeNumber,
	validateParameterTypePlainObject, validateParameterTypePluralType, Globalize ) {

/**
 * .plural( value )
 *
 * @value [Number]
 *
 * Return the corresponding form (zero | one | two | few | many | other) of a
 * value given locale.
 */
Globalize.plural =
Globalize.prototype.plural = function( value, options ) {
	validateParameterPresence( value, "value" );
	validateParameterTypeNumber( value, "value" );
	return this.pluralGenerator( options )( value );
};

/**
 * .pluralGenerator( [options] )
 *
 * Return a plural function (of the form below).
 *
 * fn( value )
 *
 * @value [Number]
 *
 * Return the corresponding form (zero | one | two | few | many | other) of a value given the
 * default/instance locale.
 */
Globalize.pluralGenerator =
Globalize.prototype.pluralGenerator = function( options ) {
	var args, cldr, isOrdinal, plural, returnFn, type;

	validateParameterTypePlainObject( options, "options" );

	options = options || {};
	cldr = this.cldr;

	args = [].slice.call( arguments, 0 );
	type = options.type || "cardinal";

	validateParameterTypePluralType( options.type, "options.type" );

	validateDefaultLocale( cldr );

	if ( returnFn = cacheGet( "pluralGenerator", args, cldr ) ) {
		return returnFn;
	}

	isOrdinal = type === "ordinal";

	cldr.on( "get", validateCldr );
	cldr.supplemental([ "plurals-type-" + type, "{language}" ]);
	cldr.off( "get", validateCldr );

	MakePlural.rules = {};
	MakePlural.rules[ type ] = cldr.supplemental( "plurals-type-" + type );

	plural = new MakePlural( cldr.attributes.language, {
		"ordinals": isOrdinal,
		"cardinals": !isOrdinal
	});

	returnFn = function pluralGenerator( value ) {
		validateParameterPresence( value, "value" );
		validateParameterTypeNumber( value, "value" );

		return plural( value );
	};

	cacheSet( args, cldr, returnFn );

	runtimeBind( args, cldr, {
		plural: plural
	}, returnFn );

	return returnFn;
};

return Globalize;

});
