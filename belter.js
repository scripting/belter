exports.runScriptText= runScriptText;
exports.start = start;

const fs = require ("fs");
const utils = require ("daveutils");
const daves3 = require ("daves3");
const filesystem = require ("davefilesystem");
const opmlPackage = require ("opml");
const reallysimple = require ("reallySimple");
const request = require ("request");
const escodegen = require ("escodegen");
const acorn = require ("acorn");

var config = {
	};
function readConfig (f, config, callback) {
	fs.readFile (f, function (err, jsontext) {
		if (!err) {
			try {
				var jstruct = JSON.parse (jsontext);
				for (var x in jstruct) {
					config [x] = jstruct [x];
					}
				}
			catch (err) {
				}
			}
		callback ();
		});
	}

function start (callback) {
	var myDir = __dirname;
	readConfig (myDir + "/config.json", config, function () {
		config.myDir = myDir;
		callback ();
		});
	}



function runScriptText (scriptText, callback) {
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


function httpRequest (url, callback) {
	request (url, function (err, response, data) {
		if (err) {
			callback (err);
			}
		else {
			var code = response.statusCode;
			if ((code < 200) || (code > 299)) {
				const message = "The request returned a status code of " + response.statusCode + ".";
				callback ({message});
				}
			else {
				callback (undefined, data) 
				}
			}
		});
	}

function fileLooper (folderpath, callback) {
	filesystem.recursivelyVisitFiles (folderpath, callback);
	}

const string = {
	getRandomSnarkySlogan: utils.getRandomSnarkySlogan,
	endsWith: utils.endsWith,
	delete: utils.stringDelete,
	replaceAll: utils.replaceAll
	};
const file = {
	readWholeFile: function (f) {
		return new Promise (function (resolve, reject) {
			fs.readFile (f, function (err, filetext) {
				if (err) {
					reject (err);
					}
				else {
					resolve (filetext.toString ()); 
					}
				});
			});
		},
	writeWholeFile: function (f, filetext) { 
		return new Promise (function (resolve, reject) {
			fs.writeFile (f, filetext, function (err, filetext) {
				if (err) {
					reject (err);
					}
				else {
					resolve (true); 
					}
				});
			});
		},
	loop: function (folder, fileCallback) {
		return new Promise (function (resolve, reject) {
			filesystem.recursivelyVisitFiles (folder, fileCallback, function () {
				resolve (true); 
				});
			});
		},
	sureFilePath: function (f) {
		return new Promise (function (resolve, reject) {
			filesystem.sureFilePath (f, function () {
				resolve (true); 
				});
			});
		}
	}
const opml = {
	parse: function (opmltext) { //9/13/21 by DW
		return new Promise (function (resolve, reject) {
			opmlPackage.parse (opmltext, function (err, theOutline) {
				if (err) {
					reject (err);
					}
				else {
					resolve (theOutline); 
					}
				});
			});
		},
	stringify: function (theOutline) { //9/13/21 by DW
		var opmltext = opmlPackage.stringify (theOutline);
		return (opmltext);
		},
	}
const s3 = {
	newObject: function (path, data, type="text/plain", acl="public-read", metadata=undefined) {
		return new Promise (function (resolve, reject) {
			daves3.newObject (path, data, type, acl, function (err, data) {
				if (err) {
					reject (err);
					}
				else {
					resolve (true); 
					}
				}, metadata);
			});
		},
	getObject: function (path) {
		return new Promise (function (resolve, reject) {
			daves3.getObject (path, function (err, data) {
				if (err) {
					reject (err);
					}
				else {
					resolve (data.Body.toString ()); 
					}
				});
			});
		},
	getObjectMetadata: function (path) {
		return new Promise (function (resolve, reject) {
			daves3.getObjectMetadata (path, function (err, data) {
				if (err) {
					reject (err);
					}
				else {
					resolve (data); 
					}
				}, true);
			});
		},
	deleteObject: function (path) {
		return new Promise (function (resolve, reject) {
			daves3.deleteObject (path, function (err) {
				if (err) {
					reject (err);
					}
				else {
					resolve (true); 
					}
				});
			});
		},
	listObjects: function (path, callback) {
		return new Promise (function (resolve, reject) {
			var theList = new Array ();
			daves3.listObjects (path, function (item) {
				if (item.flLastObject !== undefined) {
					resolve (theList);
					}
				else {
					theList.push (item.s3path);
					}
				});
			});
		},
	}
const json = {
	stringify: function (obj) {
		return (utils.jsonStringify (obj));
		}
	}
const http = {
	readUrl: function (url) {
		return new Promise (function (resolve, reject) {
			httpRequest (url, function (err, data) {
				if (err) {
					reject (err);
					}
				else {
					resolve (data.toString ()); 
					}
				})
			});
		},
	}
