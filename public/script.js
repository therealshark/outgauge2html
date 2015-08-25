"use strict";
var gauges = [];

OutGauge.onRender(function(outgaugeData){
    document.getElementById('msg').innerHTML = JSON.stringify(outgaugeData,null,'  ')
        .replace(/\n/g,'<br>')
        .replace(/  /g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    // update gauges
    gauges.forEach(function(gauge){
        gauge.gadget.setValue(outgaugeData[gauge.field]);
    });
});

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
