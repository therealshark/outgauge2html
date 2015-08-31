window.OutGauge = (function(){
    "use strict";
    // Socket.io init and updating data
    var socket = io.connect();
    var outgaugeData;
    var updateAvailable = false;
    var renderStarted = false;
    var renderCallbacks = [], updateCallbacks = [];

    // updatecycle
    socket.on('outgauge',function(data){
        outgaugeData = new OutGaugeWrapper(data);
        updateAvailable = true;
        updateCallbacks.forEach(callbackRunner);
        if(!renderStarted){
            render();
            renderStarted = true;
        }
    });

    // rendercycle
    function render(){
        if(updateAvailable){
            renderCallbacks.forEach(callbackRunner);
            updateAvailable = false;
        }
        requestAnimationFrame(render);
    }

    function OutGaugeWrapper(d){
        // bit constants
        var OG = {
            OG_SHIFT: 1,
            OG_CTRL: 2,

            OG_TURBO: 8192,
            OG_KM: 16384,
            OG_BAR: 32786
        };
        var DL = {
            SHIFT: 1,
            FULLBEAM: 2,
            HANDBRAKE: 4,
            PITSPEED: 8,
            TC: 16,
            SIGNAL_L: 32,
            SIGNAL_R: 64,
            SIGNAL_ANY: 128,
            OILWARN: 256,
            BATTERY: 512,
            ABS: 1024,
            SPARE: 2048,
            NUM: 4096
        };

        var data = d;
        var self = this;

        // enrich data
        // speed
        data.speedKPH = data.speed * 3.6;
        data.speedMPH = data.speed * 2.23694;
        // gear
        data.realGear = data.gear - 1;
        // lights
        var enrichedFields = {
            dashlights: 'lightsPresent',
            showlights: 'lightsActive'
        };
        Object.keys(enrichedFields).forEach(function(field){
            var enrichedField = enrichedFields[field];
            data[enrichedField] = [];
            Object.keys(DL).forEach(function(key){
                if(data[field] & DL[key]){
                    data[enrichedField].push(key);
                }
            });
        });



        Object.keys(data).forEach(function(key){
            Object.defineProperty(self, key, {
                get: function(){
                    return data[key];
                },
                enumerable: true
            });
        });
    }

    function callbackRunner(callback){
        callback.func.call(callback.context, outgaugeData);
    }

    function onUpdate(func, context){
        if(context === undefined){
            context = null;
        }
        updateCallbacks.push({func: func, context: context});
    }

    function onRender(func, context){
        if(context === undefined){
            context = null;
        }
        renderCallbacks.push({func: func, context: context});
    }

    var publicInterface =  {
        onUpdate: onUpdate,
        onRender: onRender
    };
    Object.defineProperty(publicInterface, 'data', {
        get: function(){
            return outgaugeData;
        }
    });

    return publicInterface;
})();