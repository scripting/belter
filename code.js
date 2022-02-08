var appPrefs = {
	outlineFont: "Ubuntu",
	outlineFontSize: 16,
	outlineLineHeight: 24,
	flGenerateCurlyBraces: false,
	flGenerateSemicolons: false,
	flUnicaseNames: false,
	}

var flOutlineChanged = false;

function getBarcursorSummit () {
	var barcursor = opGetBarCursor (), theSummit;
	barcursor.visitToSummit (function (theNode) {
		theSummit = theNode;
		return (true);
		});
	return (theSummit);
	}
function getScriptTextFromSuboutline () { //v2 -- 1/31/22 by DW
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
	theText = "(function () { " + theText + "}) ()"; //2/3/22 by DW
	console.log ("getScriptTextFromSuboutline: theText == \n" + theText);
	return (theText);
	}


function testWrapping () {
	var text = "(async function () {" + "xxx; yyy; zzz;" + "}) ()";
	var code = acorn.parse (text, {ecmaVersion: 2020});
	opInsertObject (undefined, code);
	}

function hackCodeTree (code, callback) { //do our magic to a code tree -- 1/29/22 by DW
	function visitCodeTree (theTree, visit) {
		var stack = new Array ();
		function doVisit (node) { //depth-first traversal
			if (appPrefs.flUnicaseNames) { //xxx
				if (node != null) {
					if (node.type == "Identifier") {
						node.name = node.name.toLowerCase ();
						}
					}
				}
			for (var x in node) {
				if (typeof node [x] == "object") {
					stack.push (node);
					doVisit (node [x], visit);
					stack.pop ();
					}
				}
			if (node != null) {
				visit (node, stack);
				}
			}
		doVisit (theTree);
		}
	function fixFunctionsAndCalls (theTree) {
		visitCodeTree (theTree, function (node, stack) {
			if (node.type == "FunctionDeclaration" || node.type == 'FunctionExpression') {
				node.async = true;
				}
			if (node.type == "CallExpression" && node.callee !== undefined) {
				var nodecopy = Object.assign (new Object (), node);
				for (var x in node) {
					delete node [x];
					}
				node.type = "AwaitExpression";
				node.argument = nodecopy;
				}
			return (undefined); // don't replace
			});
		}
	fixFunctionsAndCalls (code);
	callback (undefined, code);
	}
function parseScriptText (scriptText, callback) {
	var code = acorn.parse (scriptText, {ecmaVersion: 2020});
	callback (undefined, code);
	}
function viewCodeTree (theTree) {
	var theOutline = codeTreeToOutline (theTree);
	var opmltext = opml.stringify (theOutline);
	setCodeOutlne (opmltext);
	}
function preprocessScript (scriptText, callback) { //Belter syntax lives here
	parseScriptText (scriptText, function (err, theCodeTree) {
		hackCodeTree (theCodeTree, function (err, newCodeTree) {
			
			insertCodeTree (newCodeTree); 
			
			var newScriptText = escodegen.generate (newCodeTree);
			newScriptText = "(async function () {" + newScriptText + "}) ()";
			callback (undefined, newScriptText);
			});
		});
	}
function runScriptText (scriptText, callback) {
	console.log ("runScriptText: scriptText == " + scriptText);
	preprocessScript (scriptText, function (err, newScriptText) {
		console.log ("runScriptText: newScriptText == " + newScriptText);
		
		async function runScript (theScript) {
			var val = eval (theScript);
			return (val);
			}
		
		runScript (newScriptText)
			.then (function (response) {
				callback (undefined, response)
				})
			.catch (function (err) {
				callback (err)
				});
		
		});
	}
function codeTreeToOutline (theTree) {
	var theOutline = {
		opml: {
			head: {
				},
			body: {
				subs: new Array ()
				}
			}
		};
	function getCalleeName (node) {
		function getObjectName (x) {
			if (x.object === undefined) { //some objects don't have names
				return ("anonymous");
				}
			else {
				if (x.object.name !== undefined) {
					return (x.object.name + "." + x.property.name);
					}
				else {
					return (getObjectName  (x.object) + "." + x.property.name);
					}
				}
			}
		if (node.callee.name !== undefined) {
			return (node.callee.name);
			}
		else {
			return (getObjectName (node.callee));
			}
		}
	function doLevel (node, nodename, sublist) {
		var text;
		if (node.type !== undefined) {
			text = node.type;
			switch (node.type) {
				case "Literal":
					text += " == " + node.value;
					break;
				case "Identifier":
					text += " == " + node.name;
					break;
				case "CallExpression":
					text += " (" + getCalleeName (node) + ")";
					break;
				}
			}
		else {
			if (node.name !== undefined) {
				text = node.name;
				}
			else {
				text = nodename; 
				}
			}
		
		var outlinenode = {
			text
			};
		copyScalars (node, outlinenode);
		if (outlinenode.type !== undefined) {
			delete outlinenode.type;
			}
		sublist.push (outlinenode);
		for (var x in node) {
			if ((typeof node [x] == "object") && (node [x] != null)) {
				if (outlinenode.subs === undefined) {
					outlinenode.subs = new Array ();
					}
				doLevel (node [x], x, outlinenode.subs);
				}
			}
		}
	doLevel (theTree, "", theOutline.opml.body.subs);
	return (theOutline);
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
				},
			}
		});
	}
function viewScriptResult (theResult) {
	$("#idScriptResult").text (theResult);
	}
function runButtonClick () {
	var scriptText = getScriptTextFromSuboutline ();
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

function startup () {
	console.log ("startup");
	function everySecond () {
		if (opHasChanged () || flOutlineChanged) {
			localStorage.opmltext = opOutlineToXml ();
			opClearChanged ();
			flOutlineChanged = false;
			console.log ("everySecond: " + localStorage.opmltext.length + " chars saved.");
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
				console.log ("cursor moved");
				},
			}
		});
	
	setCodeOutlne (initialOpmltext);
	
	self.setInterval (everySecond, 1000); 
	
	$("#idRunButton").click (function () {
		runButtonClick ();
		$(this).blur ();
		});
	}
