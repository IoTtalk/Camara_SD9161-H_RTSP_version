let ADDR_IP_CAM = "the IP of your Vivotek camera with built-in PTZ functions";  
let PORT_IP_CAM_API = "80";
let PORT_IP_CAM_RTSP = "554";
let VIDEO_FILE_NAME = "live1s1.sdp"; //change the RTSP file name based on you camera
let UNAME_IP_CAM = "an username of the Vivotek camera";
let UWORD_IP_CAM = "password for the username of the Vivotek camera";
let ENABLE_AUTH_IP_CAM = 1; //1: TRUE, 0: FALSE

let ADDR_KURENTO_SERVER = "the domain name of your Kurento media server";  
let PORT_KURENTO_SERVER = "8433"; // WSS WebSocket Secure

let ADDR_REMOTE_CONTROL = "the url of your Remote control"; 


function CamControl(movetype, direction)
{
			var joystickcmd = "";
			if (movetype == "move")
			{
				switch(direction) {
					case 'up':
						//joystickcmd = "vx=0&vy=1";  //move continuously on mouse down and stop on mouse up
						joystickcmd = "move=up";  //move ~10 degree per click
						break;

					case 'down':
						//joystickcmd = "vx=0&vy=-1";
						joystickcmd = "move=down";
						break;

					case 'left':
						//joystickcmd = "vx=-1&vy=0";
						joystickcmd = "move=left";
						break;

					case 'right':
						//joystickcmd = "vx=1&vy=0";
						joystickcmd = "move=right";
						break;

					case 'stop':
						joystickcmd = "vx=0&vy=0";
						break;

					case 'home':
						joystickcmd = "move=home";
						break;

					default:
						break;
				}
				try {
					parent.retframe.location.href='http://' + ADDR_IP_CAM + ':' + PORT_IP_CAM_API + '/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				} 
				catch (err) {
					retframe.location.href='http://' + ADDR_IP_CAM + ':' + PORT_IP_CAM_API + '/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
			}
			else if (movetype == "zoom")
			{
				switch(direction) {
					case 'wide':
						//joystickcmd = "zooming=wide";  //zoom continuously on mouse down and stop on mouse up
						joystickcmd = "zoom=wide";  //zoom per click
						break;

					case 'tele':
						//joystickcmd = "zooming=tele";
						joystickcmd = "zoom=tele";
						break;

					case 'stop':
						joystickcmd = "zoom=stop&zs=0";
						break;
				}
				try {
					parent.retframe.location.href='http://' + ADDR_IP_CAM + ':' + PORT_IP_CAM_API + '/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
				catch (err) {
					retframe.location.href='http://' + ADDR_IP_CAM + ':' + PORT_IP_CAM_API + '/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
			}
			else if (movetype == "focus")
			{	
				switch(direction) {
					case 'near':
						joystickcmd = "focusing=near";
						break;

					case 'far':
						joystickcmd = "focusing=far";
						break;

					case 'auto':
						joystickcmd = "focus=auto";
						break;

					case 'stop':
						joystickcmd = "focusing=stop";
						break;
				}
				try {
					parent.retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
				catch (err) {
					retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
			}
			else
			{
				try {
					parent.retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?'+ movetype +'='+ direction;
				}
				catch (err) {
					retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?'+ movetype +'='+ direction;
				}
			}
}

/* 
 * PTZ Control
 */
/*preset*/
var tidSubmitPresetPre = null;
var waitSlideLatency = 500;
function SubmitPreset(selObj) 
{
	if ( isSpeedDome(capability_ptzenabled) == 1)
	{
        if (tidSubmitPresetPre != null) {
			clearTimeout(tidSubmitPresetPre);
		}
		tidSubmitPresetPre = setTimeout(function() {
				var CGICmd='/cgi-bin/camctrl/recall.cgi?recall=' + encodeURIComponent($(selObj).selectedOptions().text());
		$.ajaxSetup({ cache: false, async: true});
			$.get(CGICmd)
			Log("Send: %s",CGICmd);
		}, waitSlideLatency);
	}
	else if(capability_fisheye != 0)
	{
		for (var i=0; i < selObj.options.length-1; i++)
		{
			if (selObj.options[i].selected)
				break;
		}
	
		if (selObj.options[i].value == -1)
		{
			return;
		}
		
		var PresetPos = eval("eptz_c0_s" + streamsource + "_preset_i" + $(selObj).selectedOptions().val() + "_pos");
		//console.log("goto preset %s", PresetPos);
		document.getElementById(PLUGIN_ID).FishEyeGoPreset(
			parseInt(PresetPos.split(",")[0]), 
			parseInt(PresetPos.split(",")[1]), 
			parseInt(PresetPos.split(",")[2]), 
			parseInt(PresetPos.split(",")[3]), 
			parseInt(PresetPos.split(",")[4])
		);	
	}
	else if (isIZ(capability_ptzenabled) == 1)
	{
		var ChannelNo = 0;
		if (tidSubmitPresetPre != null) {
			clearTimeout(tidSubmitPresetPre);
		}
		tidSubmitPresetPre = setTimeout(function() {
			var CGICmd='/cgi-bin/camctrl/recall.cgi?channel=' + ChannelNo + '&recall=' + encodeURIComponent($(selObj).selectedOptions().text());
		$.ajaxSetup({ cache: false, async: true});
			$.get(CGICmd)
			Log("Send: %s",CGICmd);
		}, waitSlideLatency);
	}
	else
	{	
		var ChannelNo = 0;
		if (getCookie("activatedmode") == "mechanical")
		{
			var CGICmd='/cgi-bin/camctrl/recall.cgi?channel=' + ChannelNo + '&index=' + $(selObj).selectedOptions().val();
		}
		else
		{
			var CGICmd='/cgi-bin/camctrl/eRecall.cgi?stream=' + streamsource + '&recall=' + encodeURIComponent($(selObj).selectedOptions().text());
		}
		parent.retframe.location.href=CGICmd;
		// Show ZoomRatio after goto some presetlocation!
		var preset_num = $(selObj).selectedOptions().val();
		setTimeout("ShowPresetZoomRatio("+preset_num+")",1500);
		Log("Send: %s",CGICmd);
	}
}

function fGetPresetOptions()
{
	$("#fSelectPreset").prop("method", "get");
	$("#fSelectPreset").prop("action", "http://" + ADDR_IP_CAM + ":" + PORT_IP_CAM_API + "/cgi-bin/viewer/getparam.cgi");
	
	var CGICmdParameter;

	$('#fSelectPreset').append('<input id="tmpInputParameter" type="hidden" name="capability_npreset" value="" />'); 
	$('#fSelectPreset').submit();
	$("#tmpInputParameter").remove();  //remove the temp input element for passing the parameter.
}

/*sumit the recall command to Moves device to the preset position based on name.*/
function fSelectPreset()
{
	var presetName = $("#sel-preset option:selected").text();  //the text of the selected option

	$("#fSelectPreset").prop("method", "get");
	$("#fSelectPreset").prop("action", "http://" + ADDR_IP_CAM + ":" + PORT_IP_CAM_API + "/cgi-bin/viewer/recall.cgi");
	$('#fSelectPreset').append('<input id="tmpInputParameter" type="hidden" name="recall" value="' + presetName + '" />'); 
	$('#fSelectPreset').submit();
	$("#tmpInputParameter").remove();  //remove the temp input element for passing the parameter.
}


function flogin() 
{
	var form = document.getElementById('login');
	form.submit();
}

function reloadImage(pThis)
{
	setTimeout( function ()
	{
		//pThis.onerror = null;
		pThis.src = pThis.src;
	}, 3500);	
}

function openNav() {
    document.getElementById("myNav").style.height = "100%";
	//document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.height = "0%";
	//document.getElementById("myNav").style.width = "0%";
}

/* set url for IP cam and start automatically */
window.addEventListener('load', function(){
	if(ENABLE_AUTH_IP_CAM == 1) {
		document.getElementById("address").value="rtsp://" + UNAME_IP_CAM + ":" + UWORD_IP_CAM + "@" + ADDR_IP_CAM + ":" + PORT_IP_CAM_RTSP + "/" + VIDEO_FILE_NAME;
	} else {
		document.getElementById("address").value="rtsp://" + ADDR_IP_CAM + ":" + PORT_IP_CAM_RTSP + "/" + VIDEO_FILE_NAME;
	}
	document.getElementById('start').click();
	console.log("start");
})

/* auto click the stop button when unload the page */

window.addEventListener('unload', function(){  // not working
	document.getElementById('stop').click();
	console.log("stop");
})

function bodyOnUnload() {  // working
        document.getElementById('stop').click();
        console.log("stop");
}

window.addEventListener('load', function(){
  document.getElementById("videoOutput").addEventListener('click', function(){
	  toggleFullScreen();
	  });  //toggleFullScreen when click the video 
  //args.ws_uri = 'ws://' + ADDR_KURENTO_SERVER + ':' + PORT_KURENTO_SERVER + '/kurento'; //set the kurento server address 
  args.ws_uri = 'wss://' + ADDR_KURENTO_SERVER + ':' + PORT_KURENTO_SERVER + '/kurento'; //set the WebSocket Secure url for https of the kurento server
})

function toggleFullScreen() {
  var doc = window.document;
  var elem = document.getElementById("videoFSContainer"); //the element you want to make fullscreen

  var requestFullScreen = elem.requestFullscreen || elem.webkitRequestFullScreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen|| doc.msExitFullscreen;

  if(!(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement)) {
      requestFullScreen.call(elem);
	  elem.style.backgroundColor = "black";
  }
  else {
    cancelFullScreen.call(doc);
	elem.style.backgroundColor = "";
  }
}