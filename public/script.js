"use strict";
// Socket.io init and updating data
var socket = io.connect();
var outgaugeData;
var gauges = [];
var updateAvailable = false;
var renderStarted = false;

// update
socket.on('outgauge',function(data){
    // TODO: Quicky slapped together, this needs quite some work
    outgaugeData = new OutGauge(data);
    updateAvailable = true;
    if(!renderStarted){
        render();
        renderStarted = true;
    }
});

// rendercycle
function render(){
    if(updateAvailable){
        // update debug
        document.getElementById('msg').innerHTML = JSON.stringify(outgaugeData,null,'  ')
            .replace(/\n/g,'<br>')
            .replace(/  /g,'&nbsp;&nbsp;&nbsp;&nbsp;');
        // update gauges
        gauges.forEach(function(gauge){
            gauge.gadget.setValue(outgaugeData[gauge.field]);
        });
        updateAvailable = false;
    }
    requestAnimationFrame(render);
}

// Generate and update gauges
var gaugeConfig = [
    {
        field: 'rpm',
        size: 300,
        units: 'rpm',
        max: 8000
    },
    {
        field: 'speedKPH',
        size: 300,
        units: 'km/h',
        max: 260
    },
    {
        field: 'clutch',
        size: 200,
        units: 'clutch',
        max: 1
    },
    {
        field: 'brake',
        size: 200,
        units: 'brake',
        max: 1
    },
    {
        field: 'throttle',
        size: 200,
        units: 'throttle',
        max: 1
    }
];

gaugeConfig.forEach(function(gauge){
    console.log(gauge);
    var g = new Gauge({
        renderTo: gauge.field,
        width: gauge.size,
        height:gauge.size,
        maxValue: gauge.max,
        units: gauge.units,
        animation: false,
        highlights: false,
        glow: false,
        colors: {
            plate      : '#222',
            majorTicks : '#f5f5f5',
            minorTicks : '#ddd',
            title      : '#fff',
            units      : '#ccc',
            numbers    : '#eee',
            needle     : { start : 'rgba(240, 128, 128, 1)', end : 'rgba(255, 160, 122, .9)' }
        }
    });
    g.onready = function(){
        gauges.push({field: gauge.field, gadget: g});
    };
    g.draw();
});


function OutGauge(d){
    var data = d;
    var self = this;
    // enrich data
    data.speedKPH = data.speed * 3.6;
    data.speedMPH = data.speed * 2.23694;
    data.realGear = data.gear - 1;


   Object.keys(data).forEach(function(key){
       Object.defineProperty(self, key, {
          get: function(){
              return data[key];
          },
          enumerable: true
       });
   });
}
