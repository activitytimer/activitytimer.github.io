var completed = true;
var timerRepeats = [];
var timerTime = 0;
var saves = [];

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return null;
}

function eraseCookie(name) {
	document.cookie = name + '=; Max-Age=-99999999;';
}

function updateSaves() {
	var complete = false;
	var save = 0;
	var maxSaves = 50;
	document.getElementById("saveSel").innerHTML = "<option value='null'></option>";
	saves = [];
	while (complete = true && save <= maxSaves) {
		if (getCookie("save(" + save + ")") !== null) {
			var saveJSON = JSON.parse(getCookie("save(" + save + ")"));
			saves.push(saveJSON);
			document.getElementById("saveSel").innerHTML = document.getElementById("saveSel").innerHTML + "<option value='" + saveJSON.id + "'>" + saveJSON.name + " (" + (parseInt(saveJSON.id) + 1) + ")" + "</option>";
		} else {
			complete = false;
		}
		console.log(save);
		save = save + 1;
	}
}

function msToTime(duration) {
	var milliseconds = parseInt((duration % 1000) / 10),
		seconds = parseInt((duration / 1000) % 60),
		minutes = parseInt((duration / (1000 * 60)) % 60),
		hours = parseInt((duration / (1000 * 60 * 60)) % 24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return "<span id=\"hours\" contenteditable=\"true\" onkeypress=\"return (this.innerText.length <= 1)\" onselect=\"document.execCommand('selectAll',false,null)\">" + ("0" + hours).slice(-2) + "</span>:" + "<span id=\"minutes\" contenteditable=\"true\" onkeypress=\"return (this.innerText.length <= 1)\" onselect=\"document.execCommand('selectAll',false,null)\">" + ("0" + minutes).slice(-2) + "</span>:" + "<span id=\"seconds\" contenteditable=\"true\" onkeypress=\"return (this.innerText.length <= 1)\" onselect=\"document.execCommand('selectAll',false,null)\">" + ("0" + seconds).slice(-2) + "</span>.<span id='millisec'>" + ("0" + milliseconds).slice(-2) + "</span>";
}

function saveAs(id) {
	var loop = false;
	if (document.getElementById("loopTime")) {
		loop = true;
	}
	var save;
	timerTime = parseInt(document.getElementById("hours").innerHTML) * 60 * 60 * 1000;
	timerTime = timerTime + parseInt(document.getElementById("minutes").innerHTML) * 60 * 1000;
	timerTime = timerTime + parseInt(document.getElementById("seconds").innerHTML) * 1000;
	timerTime = timerTime + parseInt(document.getElementById("millisec").innerHTML);
	if (document.getElementById('loopTime')) {
		save = {
			"id": id,
			"name": document.getElementById('saveName').value,
			"time": timerTime,
			"loop": {
				"enable": loop,
				"loopTime": parseFloat(document.getElementById('loopTime').value),
				"loopNumber": parseInt(document.getElementById('loopNumber').value)
			}
		};
	} else {
		save = {
			"id": id,
			"name": document.getElementById('saveName').value,
			"time": timerTime,
			"loop": {
				"enable": loop,
				"loopTime": null,
				"loopNumber": null
			}
		};
	}
	console.log(save);
	setCookie("save(" + id + ")", JSON.stringify(save), 32767);

}

function loadSave(id) {
	if (getCookie("save(" + id + ")")) {
		var save = JSON.parse(getCookie("save(" + id + ")"));
		console.log(save);
		if (save.loop.enable === true) {
			document.getElementById("loopCheck").checked = true;
			document.getElementById("loopControls").innerHTML = "Time between loops (seconds): <input id='loopTime' value='" + save.loop.loopTime + "' type='number' min='0.5' step='0.5'/><br/>";
			document.getElementById("loopControls").innerHTML = document.getElementById("loopControls").innerHTML + "Number of times to loop: <input id='loopNumber' value='" + save.loop.loopNumber + "' type='number' min='2' step='1'/>";
		} else {
			document.getElementById("loopCheck").checked = false;
			document.getElementById("loopControls").innerHTML = "";
		}
		document.getElementById("time").innerHTML = msToTime(save.time);
	} else {
		alert("ERROR: Requested save does not exist!")
	}
}



function startTimer(time) {
	if (completed === true) {
		completed = false;
		var date1 = new Date();
		var date2 = new Date();
		var date1ms = date1.getTime();
		var date2ms = date2.getTime();
		var diff = (date1ms - date2ms) + parseInt(time);
		if (Math.floor(diff / 10) <= 0) {
			completed = true;
			document.getElementById("time").innerHTML = msToTime(0);
		}
		var timerInterval = setInterval(function() {
			if (completed === false) {
				date2 = new Date();
				date1ms = date1.getTime();
				date2ms = date2.getTime();
				diff = (date1ms - date2ms) + parseInt(time);
				document.getElementById("time").innerHTML = msToTime(diff);
			}
			document.getElementById("timeStopButton").onclick = function() {
				for (var i = 0; i < timerRepeats.length; i++) {
					clearTimeout(timerRepeats[i]);
					console.log(i);
				}
				completed = true;
				timerRepeats = [];
				clearInterval(timerInterval);
			}
			if (Math.floor(diff / 10) <= 0) {
				completed = true;
				playFinishedSound();
				clearInterval(timerInterval);
				document.getElementById("time").innerHTML = msToTime(0);
			}
		}, 10);
	}
}

function playFinishedSound() {
	console.log("Playing Sound...");
	var audio = new Audio('beep.mp3');
	var i = 0
	audio.play();
}

window.onload = function() {

	document.getElementById("pageTitle").innerHTML = "Timer";
	document.getElementById("contentTitle").innerHTML = "Timer";


	document.getElementById("timeSetButton").onclick = function() {
		timerTime = parseInt(document.getElementById("hours").innerHTML) * 60 * 60 * 1000;
		timerTime = timerTime + parseInt(document.getElementById("minutes").innerHTML) * 60 * 1000;
		timerTime = timerTime + parseInt(document.getElementById("seconds").innerHTML) * 1000;
		timerTime = timerTime + parseInt(document.getElementById("millisec").innerHTML);
		startTimer(timerTime);
		if (document.getElementById("loopTime")) {
			for (var i = 0; i < parseInt(document.getElementById("loopNumber").value); i++) {
				console.log("setting loop " + i + " with time " + (i + 1) * (timerTime + parseInt(document.getElementById('loopTime').value) * 1000));
				timerRepeats.push(setTimeout(function() {
					startTimer(timerTime);
					console.log("setting timer");
				}, (i + 1) * (timerTime + parseFloat(document.getElementById('loopTime').value) * 1000)));
			}
		}

	}
	document.getElementById("timeResetButton").onclick = function() {
		document.getElementById("time").innerHTML = msToTime(timerTime);
	}
	document.getElementById("timeClearButton").onclick = function() {
		document.getElementById("time").innerHTML = msToTime(0);
	}

	document.getElementById("loopCheck").onchange = function() {
		if (document.getElementById("loopCheck").checked === true) {
			document.getElementById("loopControls").innerHTML = "Time between loops (seconds): <input id='loopTime' value='2' type='number' min='0.5' step='0.5'/><br/>";
			document.getElementById("loopControls").innerHTML = document.getElementById("loopControls").innerHTML + "Number of times to loop: <input id='loopNumber' value='5' type='number' min='2' step='1'/>";
			$('#loopTime').change(function() {
				var n = $('#loopTime').val();
				if (n < 0.5) {
					$('#loopTime').val(0.5);
				}
			});
			$('#loopNumber').change(function() {
				var n = $('#loopNumber').val();
				if (n < 2) {
					$('#loopNumber').val(2);
				} else if (parseInt(n) !== n) {
					$('#loopNumber').val(parseInt(n));
				}
			});
		} else {
			document.getElementById("loopControls").innerHTML = "";
		}
	}
	saveButton.onclick = function() {
		updateSaves();
		var saveNum = 0;
		for (var j = 0; j < saves.length; j++) {
			if (saves[j].id === saveNum) {
				saveNum++;
				console.log(saveNum);
			}
		}
		saveAs(saveNum);
		updateSaves();
	}
	document.getElementById("deleteSave").onclick = function() {
		if (confirm('Are you sure you want to permanently delete this configuration?')) {
			var e = document.getElementById("saveSel");
			var strSave = e.options[e.selectedIndex].value;
			eraseCookie("save(" + strSave + ")");
			console.log(strSave);
			updateSaves();
		}
	}
	$('#saveSel').change(function() {
		var val = this.value;
		if (val !== "null") {
			loadSave(val);
		}
	})
	updateSaves();
	console.log("index.js loaded");
}