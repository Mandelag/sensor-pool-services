var sensorRenderer;
var view;
var sensorLayer;
var neoRenderer = sensorRenderer = {
  type: "simple",  // autocasts as new SimpleRenderer()
  symbol: { 
    type: "simple-marker",
    size: 14,
    color: "#FF4333"
    },  // autocasts as new SimpleFillSymbol()
  visualVariables: [{
    type: "size",
    field: "temperature",
    valueExpression: "$feature.temperature*2"
  },{
    type: "color",
    field: "humidity",
    //normalizationField: "SQ_KM"//,
    // features with 30 ppl/sq km or below are assigned the first color
    stops: [{ value: 100, color: "#FF00D3" },
          { value: 70, color: "#FFCDEF" },
          { value: 0, color: "#FFDD55" }]
  }]
};

var main = function(Map, MapView, FeatureLayer, Legend, TextSymbol, LabelClass){
  var map = new Map({
    basemap: "osm"
  });
  view = new MapView({
    container: "viewDiv",  // Reference to the scene div created in step 5
    map: map,  // Reference to the map object created before the scene
    zoom: 20,  // Sets zoom level based on level of detail (LOD)
    center: [106.80979, -6.2907]  // Sets center point of view using longitude,latitude
  });
  
  
  
  sensorRenderer = {
  type: "simple",  // autocasts as new SimpleRenderer()
  symbol: { 
    type: "simple-marker",
    size: 14,
    color: "#FF4333"
    },  // autocasts as new SimpleFillSymbol()
  visualVariables: [{
    type: "size",
    field: "temperature",
    //valueExpression: "($feature.temperature/30.0)*25",
    stops: [{value: 25, size: 10},
            {value: 30, size: 40},
            {value: 35, size: 70}]
  },{
    type: "color",
    field: "humidity",
    //normalizationField: "SQ_KM"//,
    // features with 30 ppl/sq km or below are assigned the first color
    stops: [{ value: 100, color: "#0000FF" },
          { value: 70, color: "#FFFFFF" },
          { value: 50, color: "#FF0000" }]
  }]
    };
    
    
    // create a text symbol to define the style of labels
    var sensorLabel = new TextSymbol({
        font: {  // autocast as new Font()
            size: 12,
            family: "sans-serif",
            weight: "bolder"
          }
    });
    
    
    
    var textSymbol = {
  type: "text",  // autocasts as new TextSymbol()
  color: "white",
  haloColor: "black",
  haloSize: "1px",
  text: "You are here",
  xoffset: 3,
  yoffset: 3,
  font: {  // autocast as new Font()
    size: 12,
    family: "sans-serif",
    weight: "bolder"
  }
};

  sensorLayer = new FeatureLayer({
    url: "https://services8.arcgis.com/TWq7UjmDRPE14lEV/arcgis/rest/services/sensorapp2/FeatureServer/0",
    renderer: sensorRenderer,
    outFields: ["temperature", "SENSOR_NAME"],
  });
  
sensorLayer.labelsVisible = true;
sensorLayer.labelingInfo = [ new LabelClass({
          labelExpressionInfo: { expression: "$feature.temperature" },
          symbol: {
            type: "text",  // autocasts as new TextSymbol()
            color: "black",
            haloSize: 1,
            haloColor: "white"
          }
        }) ];
  
  var buildingLayer = new FeatureLayer({
    url: "https://services8.arcgis.com/TWq7UjmDRPE14lEV/ArcGIS/rest/services/sensorapp2/FeatureServer/2"
  });
  
  view.then(function() {
          // get the first layer in the collection of operational layers in the WebMap
          // when the resources in the MapView have loaded.
          //var featureLayer = webmap.layers.getItemAt(0);

          var legend = new Legend({
            view: view,
            layerInfos: [{
              layer: sensorLayer,
              title: "Temperature and Humidity"
            }]
          });

          // Add widget to the bottom right corner of the view
          view.ui.add(legend, "bottom-right");
        });
  
  map.add(buildingLayer);
  map.add(sensorLayer);
  x();
  
  
  
}

var init = false;

function x() {
    view.whenLayerView(sensorLayer).then(function(layerView){
        layerView.watch("updating", function(val){
            if(!val){
                layerView.queryFeatures().then(function(results){
                    FEATURES = results;
                    //console.log(FEATURES);
                    for(var i=0; i<FEATURES.length; i++){
                        //FEATURES[i].attributes.TOTAL = 0;
                    }
                    //sensorLayer.renderer = newRenderer();
                    if (!init) {
                    setInterval(function(){
                        $.get("/esriths", "", function(data, status, jqxhr){
                            y(data);
                            updateTable(data);
                        });
                    }, 100);
                    init = true;
                    $("#sensordata").css("display", "block");
                    }
                });
            }
        });
    });
}

var smap = {
    "GEBZE":"gebzepi",
    "GEOHOLIC":"amripi",
    "PRASTA":"esripi"
}

function y(data) {
data = $.parseJSON(data);
    for(var i=0; i<FEATURES.length; i++){
        for ( var j=0; j<data.length; j++) {
        //console.log(data[j]["sensorInfo"]["hostname"]);
        //console.log(FEATURES[i].attributes.SENSOR_NAME);
            if ( data[j]["sensorInfo"]["hostname"] == smap[FEATURES[i].attributes.SENSOR_NAME]){
                FEATURES[i].attributes.temperature = data[j]["sensorData"]["temperature"];
                FEATURES[i].attributes.humidity = data[j]["sensorData"]["humidity"];
            }
        }
        //console.log(FEATURES[i]);
    }
    sensorLayer.renderer = sensorRenderer;
}

var previousData = {
    "gebzepi": {
        "temperature" : null,
        "humidity" : null
    },
    "amripi": {
        "temperature" : null,
        "humidity" : null
    },
    "esripi": {
        "temperature" : null,
        "humidity" : null
    }
};

function updateTable(data) {
    data = $.parseJSON(data);
    
    var temperature, humidity, prev_temperature, prev_humidity = null;
    
    
    for ( var j=0; j<data.length; j++) {
        temperature = data[j]["sensorData"]["temperature"];
        humidity = data[j]["sensorData"]["humidity"];
        prev_temperature = previousData[data[j]["sensorInfo"]["hostname"]]["temperature"];
        prev_humidity = previousData[data[j]["sensorInfo"]["hostname"]]["humidity"];
        
        $("#"+data[j]["sensorInfo"]["hostname"]+"-temperature").html(temperature.toFixed(2));
        $("#"+data[j]["sensorInfo"]["hostname"]+"-humidity").html(humidity.toFixed(2));
        
        if (Math.abs(temperature-prev_temperature) < 0.01) {
            //$("#"+data[j]["sensorInfo"]["hostname"]+"-temperature-increment").html(" ");
            //$("#"+data[j]["sensorInfo"]["hostname"]+"-humidity-increment").html(" ");
        }else if (temperature < prev_temperature) {
            $("#"+data[j]["sensorInfo"]["hostname"]+"-temperature-increment").html("&darr;").css("opacity", 1).animate({opacity: 0}, 500, function(){})
        }else if (temperature > prev_temperature) {
            $("#"+data[j]["sensorInfo"]["hostname"]+"-temperature-increment").html("&uarr;").css("opacity", 1).animate({opacity: 0}, 500, function(){})
        }
        
        if (Math.abs(humidity-prev_humidity) < 0.01) {
            
        }else if (humidity < prev_humidity) {
            $("#"+data[j]["sensorInfo"]["hostname"]+"-humidity-increment").html("&darr;").css("opacity", 1).animate({opacity: 0}, 500, function(){});
        }else if (humidity > prev_humidity) {
            $("#"+data[j]["sensorInfo"]["hostname"]+"-humidity-increment").html("&uarr;").css("opacity", 1).animate({opacity: 0}, 500, function(){});
        }
        
        previousData[data[j]["sensorInfo"]["hostname"]]["temperature"] = temperature.toFixed(2);
        previousData[data[j]["sensorInfo"]["hostname"]]["humidity"] = humidity.toFixed(2);
    }
}

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/symbols/TextSymbol",
  "esri/layers/support/LabelClass",
  "dojo/domReady!"
], main);

