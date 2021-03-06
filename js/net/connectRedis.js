var redis = require("redis");
var client= redis.createClient();
var receive = redis.createClient();


require("../tools/echarts_tool.js");

// for test
// var pub = redis.createClient();

// client.on("subscribe", function (channel, count) {
//     setInterval(function(){
//       pub.publish("Network", "Remote:Transit:false:0");
//     }, 1000)
// });

receive.on("message", function (channel, message) {
    parse_type(message);
});

receive.subscribe("Network");

function parse_type(data){
    var type_arr = data.split(":");
    if(type_arr[0] == "Local"){
        $("#connect_to_cloud")[0].innerText = "本地";
        if(type_arr[1] == "true"){
            console.log("Local true");
            $("#delay_value")[0].innerText = type_arr[2];
            $(".cloud_status").css("color","red");
        }else{
            $(".cloud_status").css("color","#4A4A4A");
            console.log("Local false");
        }
    }else{
        $("#connect_to_cloud")[0].innerText = "远程";
        if(type_arr[1] == "Direct"){
            $(".cloud_status").css("color","red");
            $("#delay_value")[0].innerText = type_arr[3];
            console.log("Remote:Direct" + type_arr[3]);
        }else if(type_arr[1] == "Transit"){
            $(".cloud_status").css("color","red");
            $("#delay_value")[0].innerText = type_arr[3];
            console.log("Remote:Transit" + type_arr[3]);
        }else{
            $(".cloud_status").css("color","#4A4A4A");
            console.log("Remote:false");
        }
    }
}


client.on("error", function (err) {
  console.log("Error " + err);
});

global.ClientSendChan = ""
global.ClientRecvChan = ""

function getClientSendChan() {
  client.get("ClientSendChan", function (err, reply) {
    // reply is null when the key is missing
    ClientSendChan = reply;
    console.log("ClientSendChan:", ClientSendChan);
    // setInterval(sendCommand, 1000);
  });
}

function getClientRecvChan() {
  client.get("ClientRecvChan", function (err, reply) {
    // reply is null when the key is missing
    ClientRecvChan = reply;
    console.log("ClientRecvChan:", ClientRecvChan);
    receiveFlightLog();
  });
}

function sendCommand() {
  // Using LPUSH to Send Command
  var cmd = "This is a Command";
  client.lpush(ClientSendChan, cmd);
  console.log("Pushed:", cmd);
}

function receiveFlightLog() {
  //Using BRPOP to Receive FlightLog
  client.brpop(ClientRecvChan, 0, function (err, value) {
    console.log("Received:", value[1]);
    handle_data_protobuf(value[1]);
    receiveFlightLog();
  })
}

getClientSendChan();
getClientRecvChan();

// listener
// client.on('end', () => {
//     $(".cloud_status").css("color","#4A4A4A");
//     $(".f_status").css("color","#4A4A4A");
//   console.log('disconnected from server');
// });
// client.on('ready', () => {
//   $(".cloud_status").css("color","red");
//   console.log('ready');
// });
// client.on('connect', () => {
//   $(".cloud_status").css("color","red");
//   console.log('connect');
// });


// client.on('close', () => {
//     $(".cloud_status").css("color","#4A4A4A");
//     $(".f_status").css("color","#4A4A4A");
//   console.log('close');
// });
// client.on('timeout', () => { 
//     $(".cloud_status").css("color","#4A4A4A");
//     $(".f_status").css("color","#4A4A4A");
//   console.log('timeout');
// });
// client.on('error', (error) => {
//     console.log("redis error");
//     console.log(error.toString());
// });

// client.get("SelfGUID", function(err, reply){
//     console.log("!!!!");
//     console.log(err.toString());
//     console.log(reply.toString());
// });


// test protobuf senors必须完整  只能用get 方法 构造方法不能写在括号里  只能set
var messages = require('./FlightLog_pb');

// var loc = new messages.Location();
// var att = new messages.Attitude();
// var poi = new messages.Point();
// var coo = new messages.Coordinate();
// var gps = new messages.GPS();
// var com = new messages.Compass();
// var bar = new messages.Barometre();
// var way = new messages.Waypoint();
// var cha = new messages.Channels();
// var sen = new messages.sensors(1);
// console.log(sen);

// loc.setAltitude(3);
// loc.setLatitude(1);
// loc.setLongitude(2);
// poi.setId(1);
// poi.setLocation(loc);
// way.addPoint(poi);
// way.addPoint(poi);

// way.addPoint(poi);

// att.setPitch(4);
// att.setRoll(5);
// att.setYaw(6);
// sen.setTarget(loc);
// sen.setHome(loc);
// sen.setAltitude(att)
// sen.setWaypoint(way);
// bytes = sen.serializeBinary();

// console.log(bytes);
// var re;
// client.lpush("niranjie", bytes);

// client.brpop(ClientRecvChan, 0, function (err, value) {
//     console.log("Received:", value[1]);
//     re = value[1];

//     console.log("~~~~~~~~");
//     console.log(re);
//     hi = re.split(",");
//     console.log(hi);
//     var message = messages.sensors.deserializeBinary(hi);
//     console.log(message);
//     console.log(message.getWaypoint().getPointList()[0]);
//     console.log(message.getTarget().getLatitude());
//     console.log(message.getTarget().getLongitude());
//     console.log(message.getTarget().getAltitude());

//     // handle_data_protobuf(value[1]);
//     receiveFlightLog();
//   })




var querystring = require("querystring");
var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  console.log(buf);
  var bufView = new Uint16Array(buf);
  console.log("!!!");
  var s = String.fromCharCode(176);
  console.log(s + ":" + querystring.unescape(querystring.escape(s)) + ":" + querystring.escape(s) + ":" +encodeURI(querystring.unescape(s)));
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);

    console.log(i +":"+str.substring(i,i+1) +":"+ escape(str.substring(i,i+1))+":"+ decode(str).charCodeAt(i));
  }
  console.log(bufView);
  // return bufView;
}
 function decodeUTF8(str){
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function($0,$1,$2){
        return String.fromCharCode(parseInt($2,16));
    }); 
 }
 function decode(s) {
    return unescape(s.replace(/\\(u[0-9a-fA-F]{4})/gm, '%$1'));
}  

 var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var encoder = new jspb.BinaryEncoder();

function handle_data_protobuf(data){
    // console.log(typeof data);
    // var b1 = new Buffer(data);
    // var b2 = b1.toByteArray();
    // console.log(b1);
    console.log(data);
    // console.log(parseInt(data, 16));
    // console.log(parseInt(data, 16).toString(2));
    console.log(str2ab(data));
    encoder.writeString(data);
    // console.log(encoder);
    var decoder = jspb.BinaryDecoder.alloc(encoder.end());
    console.log(decoder);
    // // console.log(decoder.readString(ascii.length));
    // console.log(new Uint8Array(data));
    // console.log();

    // for protobuf
    // var message = messages.sensors.deserializeBinary(new Uint8Array(decoder.getBuffer()));
    var message = messages.sensors.deserializeBinary(new Uint8Array(data));

    // var message = data;
    console.log(message);
    console.log(message.getWaypoint());

    // GPS 信息
    var gps = message.getGps();
    var gps_state = gps.getState();

    // 罗盘信息
    var compass = message.getCompass();
    // 罗盘健康信息 false不健康 true健康
    var compass_state = compass.getState();   

    // 气压计
    var barometre = message.getBaro();
    var barometre_state = barometre.getState();

    // 巡航线路
    var waypoint = message.getWaypoint();
    var waypoint_index = waypoint.getIndex();
    var waypoint_points = waypoint.getPointList(); 
    var waypoint_type = waypoint.getType();

    // 目标点
    var target = message.getTarget();

    // home
    var home = message.getHome();
    var home_latitude = home.getLatitude();
    var home_longitude = home.getLongitude();


    var distanceToTarget = message.getDistancetotarget();
    var distanceFromHome = message.getDistancefromhome();

    //  相对高度
    var altitude = message.getAltitude();

    // 模式
    var mode = message.getMode();

    // gear
    var gear = message.getGear();

    // var rpm = (Number(data.RPM)/100).toFixed(1);

    // data set
    $("#dis-target-value")[0].innerText = Number(distanceToTarget).toFixed(0);
    $("#dis-home-value")[0].innerText = Number(distanceFromHome).toFixed(0);
    $("#height-value")[0].innerText = Number(altitude).toFixed(0);
    
    $("#mode_value")[0].innerText = mode;
    if(gear == 1){
        $("#gear_level")[0].innerText = "低";
    }else if(gear == 2){
        $("#gear_level")[0].innerText = "中";
    }else if(gear == 3){
        $("#gear_level")[0].innerText = "高";
    }

    if(compass_state == false || gps_state == false || barometre_state == false){
        $("#sensors_warning").show();
    }else{
        $("#sensors_warning").hide(); 
    }
    if(gps_state == false){
        $("#gps_state")[0].innerText = "不健康";
    }else{
        $("#gps_state")[0].innerText = "健康";
        var gps_stars = gps.getNumStars();
        var location = gps.getLocation();

        var latitude = location.getLatitude();
        var longitude = location.getLongitude();
        // 高度
        var altitude = location.getAltitude();

        $("#gps_level")[0].innerText = gps_stars;
        locationCurrent = [latitude, longitude, altitude];

        // mark当前位置
        markPlane(longitude, latitude, yaw);
        // 飞行路线
        dynamicLine(longitude, latitude, 2);
        bPoints.push(new BMap.Point(longitude,latitude)); 
    }
    if(compass_state == false){
        $("#compass_state")[0].innerText = "不健康";
    }else{
        $("#compass_state")[0].innerText = "健康";
        var compass_attitude = compass.getAttitude();
        // 升降
        var pitch = compass_attitude.getPitch();
        // 横滚
        var roll = compass_attitude.getRoll();
        // 偏航
        var yaw = compass_attitude.getYaw();
    }
    if(barometre_state == false){
        $("#baro_state")[0].innerText = "不健康";
    }else{
        $("#baro_state")[0].innerText = "健康";
        // 气压
        var pressure = barometre.getPressure();
        // 气温
        var temperature = barometre.getTemperature();
        // 海拔高度（绝对高度）
        var barometre_altitude = barometre.getAltitude();
        $("#baro_pressure")[0].innerText = pressure;
        $("#baro_temper")[0].innerText = temperature;
    }

    // home
    markHome(home_longitude,home_latitude);

    // download the path 
    if (openDowload && waypoint_type == "Download"){
        try{ 
            clearPath();
            var len = waypoint_points.length;
            dynamicLine(longitude, latitude, 3);
            for (var i =0 ; i<len; i++){
                var lng = waypoint_points[i].getLocation().getLongitude();
                var lat = waypoint_points[i].getLocation().getLatitude();
                // 3 for path
                dynamicLine(lng, lat, 3);
            }
            openDowload = false;
        }catch(err){
            console.log("error");
        }
    }
}

// 监听数据
// client.on('data', (data) => {
//     //  connect to plane
//     $(".f_status").css("color","red");

//     handle_data_protobuf(data);


    // //use this data to show for json
    // console.log("Mission Control got: " + data.toString());
    // var data = eval('(' + data.toString() + ')');

 
    // // battery
    // var battery = data.Battery.split(",")
    // var voltage = battery[0];
    // var level = battery[1];
    // var current = battery[2];

    // // velocity
    // var velocity = data.Velocity.split(",");
    // var xv = velocity[0];
    // var yv = velocity[1];
    // var zv = velocity[2];

    // // attitude
    // var attitude = data.Gimbal.split(",");

    // // locationCurrent = data.LocationGlobal.split(",");
    // locationCurrent = data.LocationGlobal;

    // // 纬度
    // var latitude = locationCurrent[0];
    // // 经度
    // var longtitude = locationCurrent[1];
    // // 高度
    // var height = Number(locationCurrent[2]).gied(2);
    // // distance
    // var distance = Number(data.DistanceFromHome).toFixed(0);
    // // GPS
    // var GPS = data.GPS;

    // var mode = data.Mode;

    // var gear = data.Gear;

    // var rpm = (Number(data.RPM)/100).toFixed(1);

    // var heading = data.Heading;

    // // data set
    // $("#battery-number")[0].innerText = current + "%";
    // $("#battery-level")[0].innerText = level + "V";
    // $("#dis-value")[0].innerText = distance;
    // $("#height-value")[0].innerText = height;
    // $("#x-value")[0].innerText = xv;
    // $("#y-value")[0].innerText = yv;
    // $("#z-value")[0].innerText = zv;
    // $("#gps_level")[0].innerText = GPS;
    // $("#mode_value")[0].innerText = mode;
    // if(gear == 1){
    //     $("#gear_level")[0].innerText = "L";
    // }else if(gear == 2){
    //     $("#gear_level")[0].innerText = "M";
    // }else if(gear == 3){
    //     $("#gear_level")[0].innerText = "H";
    // }

    // // ecahrts set
    // option.series[0].data[0].value = rpm;
    // eChart.setOption(option,true);

    // // mark当前位置
    // markPlane(longtitude, latitude, attitude[1]);
    // // 飞行路线
    // dynamicLine(longtitude, latitude, 2);
    // bPoints.push(new BMap.Point(longtitude,latitude)); 

    // // download the path 
    // if (data.AllWp != null) {
    //     console.log(data.AllWp);
    //     var path_locations = data.AllWp.split(",");
    //     var len = data.length;
    //     dynamicLine(longtitude, latitude, 3);
    //     for (var i =0 ; i<len; i++){
    //         var path_location = path_locations.split("+");
    //         var lng = path_location[1];
    //         var lat = path_location[0];
    //         // 3 for path
    //         dynamicLine(lng, lat, 3);
    //     } 
    // }

    // // battery progress
    // if (current > 30) {
    //     var tmp = current - 30;
    //     var width = tmp.toString() + '%';
    //     $(".progress-bar-info").css("width", width);
    // }
    // else if(current > 10){
    //     var tmp = current - 10;
    //     var width = tmp.toString() + '%';
    //     $(".progress-bar-info").css("width", 0);
    //     $(".progress-bar-warning").css("width", width);
    // }else{
    //     var tmp = current;
    //     var width = tmp.toString() + '%';
    //     $(".progress-bar-info").css("width", 0);
    //     $(".progress-bar-warning").css("width", 0);
    //     $(".progress-bar-danger").css("width", width);
    // }

// });





module.exports = client;