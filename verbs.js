
var urlStateNames = "http://localhost:1444/getallstates"; 

function httpRequest (url, timeout, headers, callback) {
	timeout = (timeout === undefined) ? 30000 : timeout;
	var jxhr = $.ajax ({ 
		url: url,
		dataType: "text", 
		headers,
		timeout
		}) 
	.success (function (data, status) { 
		callback (undefined, data);
		}) 
	.error (function (status) { 
		var message;
		try { //9/18/21 by DW
			message = JSON.parse (status.responseText).message;
			}
		catch (err) {
			message = status.responseText;
			}
		var err = {
			code: status.status,
			message
			};
		callback (err);
		});
	}
function servercall (path, params, flAuthenticated, callback, urlServer=appConsts.urlTwitterServer) {
	function drummerBuildParamList (paramtable, flPrivate) { //8/4/21 by DW
		var s = "";
		if (flPrivate) {
			paramtable.flprivate = "true";
			}
		for (var x in paramtable) {
			if (paramtable [x] !== undefined) { //8/4/21 by DW
				if (s.length > 0) {
					s += "&";
					}
				s += x + "=" + encodeURIComponent (paramtable [x]);
				}
			}
		return (s);
		}
	var whenstart = new Date ();
	if (params === undefined) {
		params = new Object ();
		}
	if (flAuthenticated) { //1/11/21 by DW
		params.oauth_token = localStorage.twOauthToken;
		params.oauth_token_secret = localStorage.twOauthTokenSecret;
		}
	var url = urlServer + path + "?" + drummerBuildParamList (params, false);
	httpRequest (url, undefined, undefined, function (err, jsontext) {
		if (err) {
			console.log ("servercall: url == " + url + ", err.message == " + err.message);
			callback (err);
			}
		else {
			console.log ("servercall: url == " + url + ", secs == " + secondsSince (whenstart)); 
			callback (undefined, JSON.parse (jsontext));
			}
		});
	}
function testGetStateNames () {
	servercall ("getallstates", undefined, true, function (err, data) {
		if (err) {
			console.log (err.message);
			}
		else {
			console.log (data);
			}
		});
	}



var belter = {
	getStateNames: function () {
		return new Promise (function (resolve, reject) {
			httpRequest (urlStateNames, undefined, undefined, function (err, jsontext) {
				if (err) {
					reject (err);
					}
				else {
					resolve (JSON.parse (jsontext)); 
					}
				});
			});
		},
	
	errorFunc: function () {
		alert (undefinedvariable);
		}
	
	
	
	}
var http = {
	readUrl: function (url, flUseProxyServer) {
		if (flUseProxyServer === undefined) {
			flUseProxyServer = true;
			}
		if (flUseProxyServer) {
			return new Promise (function (resolve, reject) {
				console.log ("Using proxy server.");
				servercall ("httpreadurl", {url}, true, function (err, data) {
					if (err) {
						reject (err);
						}
					else {
						resolve (data); 
						}
					});
				});
			}
		else {
			return new Promise (function (resolve, reject) {
				console.log ("Not using proxy server.");
				httpRequest (url, undefined, undefined, function (err, data) {
					if (err) {
						reject (err);
						}
					else {
						resolve (data); 
						}
					});
				});
			}
		},
	derefUrl: function (url) { //9/17/21 by DW
		return new Promise (function (resolve, reject) {
			servercall ("derefurl", {url}, true, function (err, data) {
				if (err) {
					reject (err);
					}
				else {
					resolve (data.longurl); 
					}
				});
			});
		},
	client: function (options, flUseProxyServer=true) { //11/5/21 by DW
		var request = { //defaults
			type: "GET",
			url: undefined, //defaults to the current page
			data: undefined,
			params: undefined,
			headers: {
				"User-Agent": drummer.productname () + " v" + drummer.version ()
				}
			}
		if (options.headers !== undefined) { //11/7/21 by DW
			for (var x in options.headers) {
				request.headers [x] = options.headers [x];
				}
			}
		for (var x in options) {
			if (x != "headers") {
				request [x] = options [x];
				}
			}
		if (request.data !== undefined) {
			if (!$.isPlainObject (request.data) && (typeof (request.data) != "string")) { //8/2/21 by DW
				request.data = request.data.toString ();
				}
			}
		if (request.params !== undefined) {
			request.url += "?" + drummerBuildParamList (request.params);
			}
		if (flUseProxyServer) {
			return new Promise (function (resolve, reject) {
				var proxyRequest = {
					method: request.type,
					url: request.url,
					body: request.data,
					headers: request.headers
					};
				var jsontext = jsonStringify (proxyRequest);
				servercall ("httprequest", {request: jsontext}, true, function (err, data) {
					if (err) {
						reject (err);
						}
					else {
						resolve (data); 
						}
					});
				});
			}
		else {
			return new Promise (function (resolve, reject) {
				$.ajax (request)
					.success (function (data, status) { 
						resolve (data); 
						}) 
					.error (function (status) { 
						var err = JSON.parse (status.responseText);
						reject (err);
						});
				});
			}
		}
	}


