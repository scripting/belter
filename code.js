var appPrefs = {
	outlineFont: "Ubuntu",
	outlineFontSize: 16,
	outlineLineHeight: 24,
	}

function hackCodeTree (code, callback) { //do our magic to a code tree -- 1/29/22 by DW
	function visitCodeTree (theTree, visit) {
		var stack = new Array ();
		function doVisit (node) { //depth-first traversal
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
	function fixSpecialFunctionCalls (theTree) {
		visitCodeTree (theTree, function (node, stack) {
			if (node.type == "FunctionDeclaration" || node.type == 'FunctionExpression') {
				node.async = true;
				}
			if (node.type == "CallExpression" && node.callee !== undefined) {
				var nodecopy = Object.assign(new Object (), node);
				for (var x in node) {
					delete node [x];
					}
				node.type = "AwaitExpression";
				node.argument = nodecopy;
				}
			return (undefined); // don't replace
			});
		}
	fixSpecialFunctionCalls (code);
	callback (undefined, code);
	}
function parseScriptText (scriptText, callback) {
	var code = acorn.parse (scriptText, {ecmaVersion: 2020});
	callback (undefined, code);
	}
function preprocessScript (scriptText, callback) { //Belter syntax lives here
	parseScriptText (scriptText, function (theCodeTree) {
		hackCodeTree (theCodeTree, function (err, newCodeTree) {
			var newScriptText = escodegen.generate (newCodeTree);
			newScriptText = "(async function () {" + newScriptText + "}) ()";
			callback (undefined, newScriptText);
			});
		});
	}
function runScriptText (scriptText, callback) {
	preprocessScript (scriptText, function (err, newScriptText) {
		(async function () {
			var val = eval (newScriptText);
			return (val);
			}) ()
			.then (function (response) {
				callback (undefined, response);
				})
			.catch (function (err) {
				callback (err);
				});
		});
	
	
	
	if (callback == null) {
		callback = function () {};
		}
	function visitCodeTree (theTree, visit) {
		var stack = new Array ();
		function doVisit (node) { //depth-first traversal
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
	function fixSpecialFunctionCalls (theTree) {
		visitCodeTree (theTree, function (node, stack) {
			if (node.type == "FunctionDeclaration" || node.type == 'FunctionExpression') {
				node.async = true;
				}
			if (node.type == "CallExpression" && node.callee !== undefined) {
				var nodecopy = Object.assign(new Object (), node);
				for (var x in node) {
					delete node [x];
					}
				node.type = "AwaitExpression";
				node.argument = nodecopy;
				}
			return (undefined); // don't replace
			});
		}
	function preprocessScript(scriptText) {
		var scriptBody = '', tokens, i, info;
		var code = acorn.parse (scriptText, {ecmaVersion: 2020});
		fixSpecialFunctionCalls (code);
		scriptBody = escodegen.generate (code);
		return "(async function () {" + scriptBody + "})()";
		}
	(async function () {
		var processedScriptText = preprocessScript (scriptText);
		console.log ("runScriptText: processedScriptText == " + processedScriptText);
		var scriptVal = eval (processedScriptText);
		return (scriptVal);
		})()
		.then(function (response) {
			callback(null, response);
			})
		.catch(function (error) {
			callback(error);
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
			if (x.object.name !== undefined) {
				return (x.object.name + "." + x.property.name);
				}
			else {
				return (getObjectName  (x.object) + "." + x.property.name);
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
			if (typeof node [x] == "object") {
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
function getScriptText () {
	var barcursor = opGetBarCursor (), scripttext = "", theSummit;
	barcursor.visitToSummit (function (theNode) {
		theSummit = theNode;
		return (true);
		});
	opVisitSubs (theSummit, function (theNode, level) {
		scripttext += filledString ("\t", level) + theNode.getLineText () + "\n";
		return (true);
		});
	return (scripttext);
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

function startup () {
	console.log ("startup");
	function everySecond () {
		if (opHasChanged ()) {
			localStorage.opmltext = opOutlineToXml ();
			opClearChanged ();
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
	
	setCodeOutlne (initialOpmltext);
	
	self.setInterval (everySecond, 1000); 
	
	$("#idCompileButton").click (function () {
		var scriptText = getScriptText ();
		parseScriptText (scriptText, function (err, code) {
			hackCodeTree (code, function (err, code) { 
				var theOutline = codeTreeToOutline (code);
				var opmltext = opml.stringify (theOutline);
				setCodeOutlne (opmltext);
				console.log (jsonStringify (code));
				console.log (jsonStringify (theOutline));
				});
			});
		$(this).blur ();
		});
	$("#idRunButton").click (function () {
		var scriptText = getScriptText ();
		console.log (scriptText);
		$(this).blur ();
		
		runScriptText (scriptText, function (err, value) {
			if (err) {
				console.log (err.message);
				}
			else {
				console.log (value);
				}
			});
		});
	}
