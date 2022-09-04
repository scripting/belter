
var string = {
	addPeriodAtEnd: function (s) {
		s = s.toString ();
		if (utils !== undefined) { //server
			return (utils.addPeriodAtEnd (s));
			}
		else { //client
			return (addPeriodAtEnd (s));
			}
		},
	
	maxStringLength: function (s, len, flWholeWordAtEnd, flAddElipses) {
		if (utils !== undefined) { //server
			return (utils.maxStringLength (s, len, flWholeWordAtEnd, flAddElipses));
			}
		else { //client
			return (utils.maxStringLength (s, len, flWholeWordAtEnd, flAddElipses));
			}
		},
	
	
	bumpUrlString: bumpUrlString,
	addCommas: stringAddCommas,
	decodeXml: decodeXml,
	randomSnarkySlogan: getRandomSnarkySlogan,
	formatDate: formatDate,
	beginsWith: beginsWith,
	contains: stringContains,
	countFields: stringCountFields,
	dayOfWeekToString: dayOfWeekToString,
	delete: stringDelete,
	encodeHtml: function (s) {
		return s.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
			return '&#'+i.charCodeAt(0)+';';
			});
		},
	endsWith: endsWith,
	filledString: filledString,
	getRandomPassword: getRandomPassword,
	hashMD5: function (s) {
		return (SparkMD5.hash (s));
		},
	innerCaseName: innerCaseName,
	insert: stringInsert,
	isAlpha: isAlpha,
	isNumeric: isNumeric,
	isWhitespace: isWhitespace,
	isPunctuation: isPunctuation,
	lastField: stringLastField,
	lower: stringLower,
	upper: stringUpper,
	mid: stringMid,
	monthToString: monthToString, //January, February etc.
	nthField: stringNthField,
	padWithZeros: padWithZeros,
	popLastField: stringPopLastField,
	popTrailing: function (s, ch) { //11/25/13 by DW
		while (s.length > 0) {
			if (s [s.length - 1] != ch) {
				break;
				}
			s = string.delete (s, s.length, 1);
			}
		return (s);
		},
	popExtension: stringPopExtension, //1/18/17 by DW
	replaceAll: replaceAll,
	multipleReplaceAll: multipleReplaceAll, //1/18/17 by DW
	stripMarkup: stripMarkup,
	trimLeading: function (s, ch) {
		if (ch == undefined) {
			ch = " ";
			}
		return (trimLeading (s, ch));
		},
	trimTrailing: function (s, ch) {
		if (ch == undefined) {
			ch = " ";
			}
		return (trimTrailing (s, ch));
		},
	trimWhitespace: function (s, ch) { //8/24/13 by DWextensionToMimeType
		if (ch == undefined) {
			ch = " ";
			}
		return (trimLeading (trimTrailing (s, ch), ch))
		},
	extensionToMimeType: function (filepath) { //8/4/21 by DW
		const ext = stringLastField (filepath, "."); 
		if (ext == filepath) { //no extension
			return (undefined);
			}
		else {
			return (httpExt2MIME (ext));
			}
		},
	markdownProcess: function (s) { //11/2/21 by DW
		var md = new Markdown.Converter ();
		return (md.makeHtml (s));
		}
	}
var date = {
	sameDay: sameDay,
	sameMonth: sameMonth,
	dayGreaterThanOrEqual: dayGreaterThanOrEqual,
	secondsSince: secondsSince,
	yesterday: dateYesterday,
	tomorrow: dateTomorrow,
	netStandardString: function (theDate) { //12/17/13 by DW
		return (new Date (theDate).toUTCString ());
		},
	convertToTimeZone: function (when, timeZoneString="0") { //11/15/21 by DW
		function processTimeZoneString (s) { //convert someting like 5:30 to 5.5
			var splits = s.split (":");
			if (splits.length == 2) {
				var ctsecs = Number (splits [1]);
				var hourFraction = ctsecs / 60;
				if (s [0] == "-") {
					hourFraction = -hourFraction;
					}
				s = Number (splits [0]) + hourFraction;
				}
			return (s);
			}
		var offset = Number (processTimeZoneString (timeZoneString));
		var d = new Date (when);
		var localTime = d.getTime ();
		var localOffset = d.getTimezoneOffset () *  60000;
		var utc = localTime + localOffset;
		var blogTime = utc + (3600000 * offset);
		return (new Date (blogTime));
		}
	}




