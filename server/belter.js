const daveappserver = require ("daveappserver"); 
const utils = require ("daveutils"); 

var stats = {
	};

const theStates = [
	"Alabama",
	"Alaska",
	"Arizona",
	"Arkansas",
	"California",
	"Colorado",
	"Connecticut",
	"Delaware",
	"Florida",
	"Georgia",
	"Hawaii",
	"Idaho",
	"Illinois",
	"Indiana",
	"Iowa",
	"Kansas",
	"Kentucky",
	"Louisiana",
	"Maine",
	"Maryland",
	"Massachusetts",
	"Michigan",
	"Minnesota",
	"Mississippi",
	"Missouri",
	"Montana",
	"Nebraska",
	"Nevada",
	"New Hampshire",
	"New Jersey",
	"New Mexico",
	"New York",
	"North Carolina",
	"North Dakota",
	"Ohio",
	"Oklahoma",
	"Oregon",
	"Pennsylvania",
	"Rhode Island",
	"South Carolina",
	"South Dakota",
	"Tennessee",
	"Texas",
	"Utah",
	"Vermont",
	"Virginia",
	"Washington",
	"West Virginia",
	"Wisconsin",
	"Wyoming"
	];

function getAllStates (callback) {
	callback (undefined, theStates);
	}
function handleHttpRequest (theRequest) {
	var now = new Date ();
	function returnPlainText (s) {
		theRequest.httpReturn (200, "text/plain", s.toString ());
		}
	function returnData (jstruct) {
		if (jstruct === undefined) {
			jstruct = {};
			}
		theRequest.httpReturn (200, "application/json", utils.jsonStringify (jstruct));
		}
	function returnError (jstruct) {
		theRequest.httpReturn (500, "application/json", utils.jsonStringify (jstruct));
		}
	function httpReturn (err, jstruct) {
		if (err) {
			returnError (err);
			}
		else {
			returnData (jstruct);
			}
		}
	
	console.log ("handleHttpRequest: theRequest.lowerpath == " + theRequest.lowerpath);
	
	switch (theRequest.lowerpath) {
		case "/getallstates":
			getAllStates (httpReturn);
			return (true);
		}
	return (false); //not consumed
	}
function everySecond () {
	}
function everyMinute () {
	}

var options = {
	everySecond,
	everyMinute,
	httpRequest: handleHttpRequest
	}
daveappserver.start (options);
