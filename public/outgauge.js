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