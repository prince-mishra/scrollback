/* jshint browser:true */
/* global libsb, facebookConnectPlugin, $ */

libsb.on('logout', function(l, n) {
	if (facebookConnectPlugin) {
		facebookConnectPlugin.logout(function() {
			// success
			console.log("Sucessfully logged out from Facebook");
			return n();
		}, function() {
			// failure
			console.log("Facebook plugin logout failure");
			return n();
		});
	} else {
		return n();
	}
}, 500);

function sendInit(token) {
	if (!token) {
		return;
	}
	libsb.emit("init-up", {
		auth: {
			facebook: {
				token: token
			}
		}
	}, function() {

	});
}

function loginWithFacebook() {
	if (typeof facebookConnectPlugin !== "undefined") {
		require('./spinner.js');
		var $spinnerEl = $('#spinner');
		facebookConnectPlugin.login([], function(obj) {
			// login success
			console.log("Login succeeded", obj);
			$spinnerEl.removeClass('spinner');
			sendInit(obj.authResponse.accessToken);
		}, function(msg) {
			// login failed, remove spinner
			console.log("Login failed", msg);
			$spinnerEl.removeClass('spinner');
		});
		
		var intervalId = setInterval(function() {
			facebookConnectPlugin.getLoginStatus(function(obj) {
				// this hack fires the callback when, the login is successfull, but success callback does not fire.
				// misbehaving phonegap plugins :-|
				if (obj.hasOwnProperty('status') && obj.status === "connected") {
					clearInterval(intervalId);
				}
			}, function() {
				clearInterval(intervalId);
			});
			libsb.on('init-dn', function(i, n) {
				clearInterval(intervalId);
				return n();
			}, 500);
		}, 100);
	}
}

module.exports = loginWithFacebook;