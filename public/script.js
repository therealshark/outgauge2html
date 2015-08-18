"use strict";
// Socket.io init and updating data
var socket = io.connect();
var outgaugeData;

socket.on('outgauge',function(data){
    // TODO: Quicky slapped together, this needs quite some work
    data.kph = data.speed * 3.6;
    outgaugeData = data;
    var formatted = JSON.stringify(data,null,'  ').replace(/\n/g,'<br>').replace(/  /g,'&nbsp;&nbsp;&nbsp;&nbsp;');//
    document.getElementById('msg').innerHTML = formatted;
});

// Generate and update gauges
var gauges = [
    {
        field: 'rpm',
        size: 300,
        units: 'rpm',
        max: 8000
    },
    {
        field: 'kph',
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

gauges.forEach(function(gauge){
    console.log(gauge);
    var g = new Gauge({
        renderTo: gauge.field,
        width: gauge.size,
        height:gauge.size,
        maxValue: gauge.max,
        units: gauge.units,
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
    var update = function(){
        if(outgaugeData){
            g.setValue(outgaugeData[gauge.field]);
        }
        requestAnimationFrame(update);
    };
    g.onready = update;
    g.draw();
});
