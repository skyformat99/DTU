var clientId;
var leweiUrl = "modbus.lewei50.com";
var leweiPort = 9970;

function connectLewei()
{
  console.log("connecting to lewei50.com RegCode:"+txtRegCode);
  if(clientId!=undefined)
  {
    chrome.sockets.tcp.close(clientId);
  }
  $('#nwk_switch').attr('src',"icon_switch_off.jpg");
  chrome.sockets.tcp.create({}, function (createInfo) {
      chrome.sockets.tcp.connect(createInfo.socketId,
          leweiUrl, leweiPort, onConnectedCallback);
      clientId = createInfo.socketId;
  });
}

function netSend(pl)
{
  try
  {
    chrome.sockets.tcp.send(clientId, pl, function (d) {
        console.log(d.resultCode);
        if(d.resultCode!= 0)
        {
          connectLewei();
        }
    });
    appendLog(">>"+toAscii(ab2str(pl))+"\n");
  }
  catch(err)
  {
    console.log(err);
  }
}

var onConnectedCallback = function (r) {

  	$('#nwk_switch').attr('src',"icon_switch_on.jpg");
    var buf = str2ab(txtRegCode);
    //console.log(chrome.sockets.tcp.onReceive);
    function serSend(d) {
        //need to send to serial port
        serialSend(d.data);
    }
    function rcvErr(d) {
        console.log(d);
        if(d.resultCode == -100)
        {
        	//disconnected from server side
        	setTimeout(connectLewei,5000+Math.floor(Math.random() * 60000));
        }
    }
    chrome.sockets.tcp.send(clientId, buf, function (d) {
        console.log(d);
    })
    if(!chrome.sockets.tcp.onReceive.hasListeners())
    chrome.sockets.tcp.onReceive.addListener(serSend);
    if(!chrome.sockets.tcp.onReceiveError.hasListeners())
    chrome.sockets.tcp.onReceiveError.addListener(rcvErr);
};

function serialSend(pl)
{
	try
  {
		sp.write(pl);
    appendLog("<<"+toAscii(ab2str(pl))+"\n");
	}
	catch(err)
	{
		console.log(err);
	}
}

function appendLog(log)
{
  $('#log').append(formatDate(new Date().getTime())+log);
  var scrollTop = $("#log")[0].scrollHeight;  
  $("#log").scrollTop(scrollTop);  
  console.log($('#log').val().length);
}

function formatDate(time){
    var date = new Date(time);

    var year = date.getFullYear(),
        month = date.getMonth() + 1,//月份是从0开始的
        day = date.getDate(),
        hour = date.getHours(),
        min = date.getMinutes(),
        sec = date.getSeconds();
    var newTime = year + '-' +
                month + '-' +
                day + ' ' +
                hour + ':' +
                min + ':' +
                sec;
    return newTime;         
}

function toAscii(str)
{
	var arr = [];
  //arr.push("0x");
  for(var i=0;i<str.length;i++){
    arr.push(str.charCodeAt(i).toString(16));
  }
  return arr.join(' ');
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
