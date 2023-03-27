#!/usr/bin/env node

const myVersion = "0.4.0", myProductName = "belterCommandLine", shortProductName = "belt"; 


const fs = require ("fs"); 
const utils = require ("daveutils");
const request = require ("request");
const childProcess = require ("child_process");
const colors = require ("colors");
const belter = require ("./belter.js"); 

function pad (val, withchar, ctplaces, flleftalign) {
	var s = (val === undefined) ? "" : val.toString ();
	while (s.length < ctplaces) {
		if (flleftalign) {
			s = s + withchar;
			}
		else {
			s = withchar + s;
			}
		}
	return (s);
	}
function readJsonFile (path, callback) {
	utils.sureFilePath (path, function () {
		fs.readFile (path, function (err, data) {
			var theObject = undefined;
			if (err) {
				}
			else {
				try {
					theObject = JSON.parse (data);
					}
				catch (err) {
					console.log ("readJsonFile: err.message == " + err.message);
					}
				}
			callback (theObject);
			});
		});
	}
function helpCommand () {
	const maxcommandlength = 30;
	function onecommand (theCommand, theMeaning) {
		theCommand = pad (theCommand, " ", maxcommandlength, true);
		console.log (theCommand + theMeaning);
		}
	console.log ("\nList of commands supported by " + myProductName + " v" + myVersion + ".\n");
	console.log ((pad ("Command", " ", maxcommandlength, true) + "Meaning").blue.bold);
	onecommand ("list", "list all the apps running in pagePark.");
	onecommand ("rescan", "search the domains folder for apps that aren't yet running and try to launch them.");
	onecommand ("stop appnum", "stops the app indicated by appnum.");
	onecommand ("restart appnum", "restarts the app indicated by appnum.");
	onecommand ("log appnum", "scrolls the log for the app indicated by appnum.");
	onecommand ("now", "the current time on the server");
	onecommand ("help", "show a list of commands that " + shortProductName + " supports.");
	console.log ("\n");
	}

function startup () {
	belter.start (function () {
		if (process.argv.length <= 2) {
			helpCommand (); //belt with no params is the help command
			}
		else {
			let beltfile = process.argv [2];
			fs.readFile (beltfile, function (err, filetext) {
				if (err) {
					console.log (err.message);
					}
				else {
					console.log ("");
					belter.runScriptText (filetext.toString (), function (err, data) {
						if (err) {
							console.log (err.message + "\n");
							}
						});
					}
				});
			}
		});
	}
startup ();
