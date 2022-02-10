var appPrefs = {
	outlineFont: "Ubuntu",
	outlineFontSize: 16,
	outlineLineHeight: 24,
	flGenerateCurlyBraces: false,
	flGenerateSemicolons: false,
	flUnicaseNames: false,
	}

var flOutlineChanged = false;


function copyObject (source) {
	var dest = new Object ();
	function docopy (source, dest) {
		for (var x in source) {
			if (typeof source [x] == "object") {
				dest [x] = new Object ();
				docopy (source [x], dest [x]);
				}
			else {
				dest [x] = source [x]
				}
			}
		}
	docopy (source, dest);
	return (dest);
	}
function getBarcursorSummit () {
	var barcursor = opGetBarCursor (), theSummit;
	barcursor.visitToSummit (function (theNode) {
		theSummit = theNode;
		return (true);
		});
	return (theSummit);
	}
function getScriptTextFromSuboutline () {
	let theText = "", indentlevel = 0;
	var theSubOutline = opSubOutlineJstruct (getBarcursorSummit ());
	function addlevel (theNode) {
		function add (s) {
			theText += filledString ("\t", indentlevel) + s + "\n"
			}
		function openCurly (sub) {
			if (appPrefs.flGenerateCurlyBraces) {
				if (sub.subs !== undefined) {
					return (" {");
					}
				}
			return ("");
			}
		function addCloseCurly (sub) {
			if (appPrefs.flGenerateCurlyBraces) {
				if (sub.subs !== undefined) {
					add ("}");
					}
				}
			}
		function getSemi (sub) {
			if (appPrefs.flGenerateSemicolons) {
				if (sub.subs === undefined) {
					return (";");
					}
				}
			return ("");
			}
		if (theNode.subs !== undefined) {
			if (appPrefs.flGenerateCurlyBraces) {
				}
			theNode.subs.forEach (function (sub) {
				if (!getBoolean (sub.isComment)) {
					add (sub.text + getSemi (sub) + openCurly (sub));
					indentlevel++;
					addlevel (sub);
					addCloseCurly (sub);
					indentlevel--;
					}
				});
			}
		}
	addlevel (theSubOutline);
	console.log ("getScriptTextFromSuboutline: theText == \n" + theText);
	return (theText);
	}
function setCodeOutlne (opmltext) {
	var idOrigOutliner = idDefaultOutliner;
	idDefaultOutliner = "idCodeTreeOutline";
	opInitOutliner (opmltext, true, false);
	opExpandEverything ();
	idDefaultOutliner = idOrigOutliner;
	$("#idCodeTreeOutline").concord ({
		callbacks: {
			opCursorMoved: function (op) {
				viewAttsString ();
				},
			}
		});
	viewAttsString ();
	}
function viewCodeTree (theTree) {
	var theOutline = codeTreeToOutline (theTree);
	var opmltext = opml.stringify (theOutline);
	setCodeOutlne (opmltext);
	}

function viewAttsString () {
	function getCodeAttsString () {
		var idOrigOutliner = idDefaultOutliner;
		idDefaultOutliner = "idCodeTreeOutline";
		
		var atts = opGetAttsDisplayString ();
		
		idDefaultOutliner = idOrigOutliner;
		
		return (atts);
		}
	$("#idAttsDisplay").html (getCodeAttsString () + " ");
	}
function insertCodeTree (theTree) {
	var idOrigOutliner = idDefaultOutliner;
	idDefaultOutliner = "idCodeTreeOutline";
	opInsertObject (undefined, theTree);
	opFirstSummit ();
	opDeleteLine ();
	opExpandEverything ();
	idDefaultOutliner = idOrigOutliner;
	$("#idCodeTreeOutline").concord ({
		callbacks: {
			opCursorMoved: function (op) {
				viewAttsString ();
				}
			}
		});
	}
function viewScriptResult (theResult) {
	$("#idScriptResult").text (theResult);
	}
function insertScriptResult (theResult) {
	opDeleteSubs ();
	if (typeof (theResult) == "object") {
		opInsertObject (undefined, theResult, right);
		}
	else {
		if (theResult === undefined) {
			theResult = "undefined";
			}
		opInsert (theResult.toString (), right);
		}
	opMakeComment ();
	opGo (left, 1);
	}
function runButtonClick () {
	var scriptText = getScriptTextFromSuboutline ();
	scriptText = "(async function () {" + scriptText + "}) ()";
	scriptText = "viewScriptResult (" + scriptText + ")";
	runScriptText (scriptText, function (err, value) {
		if (err) {
			viewScriptResult ("Error: " + err.message);
			}
		else {
			console.log (value);
			}
		});
	}
function runCursorScript () {
	var scriptText = opGetLineText ();
	scriptText = "insertScriptResult (" + scriptText + ")";
	
	runScriptText (scriptText, function (err, value) {
		if (err) {
			insertScriptResult ("Error: " + err.message);
			}
		else {
			console.log (value);
			}
		});
	}

function startup () {
	console.log ("startup");
	function everySecond () {
		if (idDefaultOutliner == "outliner") {
			if (opHasChanged () || flOutlineChanged) {
				localStorage.opmltext = opOutlineToXml ();
				opClearChanged ();
				flOutlineChanged = false;
				}
			}
		}
	
	var opmltext = localStorage.opmltext;
	if (opmltext === undefined) {
		var theOutline = {
			opml: {
				head: {
					},
				body: {
					subs: [
						{
							text: "ohbegatta"
							}
						]
					}
				}
			};
		opmltext = opml.stringify (theOutline);
		}
	opInitOutliner (opmltext, false, true);
	$(opGetActiveOutliner ()).concord ({
		callbacks: {
			opCursorMoved: function (op) {
				flOutlineChanged = true;
				},
			opKeystroke: function (ev) {
				switch (ev.concord.keystrokeString) {
					case "run-selection": //2/19/21 by DW
						runCursorScript ();
						ev.concord.flKeyCaptured = true;
						break;
					}
				}
			}
		});
	
	setCodeOutlne (initialOpmltext);
	
	self.setInterval (everySecond, 1000); 
	$("#idRunButton").click (function () {
		runButtonClick ();
		$(this).blur ();
		});
	}

