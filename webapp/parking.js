var sensorRenderer;
var view;
var sensorLayer;
var sensorRenderer = {
      type: "unique-value",
      field: "AVAILABILITY",
      defaultSymbol: {type: "simple-fill"},
      uniqueValueInfos: [{
          value: "OCCUPIED",
          symbol: {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: "red"
          }
        },
        {
          value: "AVAILABLE",
          symbol: {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: "green"
          }
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
      type: "unique-value",
      field: "AVAILABILITY",
      defaultSymbol: {type: "simple-fill"},
      uniqueValueInfos: [{
          value: "OCCUPIED",
          symbol: {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: "red"
          }
        },
        {
          value: "AVAILABLE",
          symbol: {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: "green"
          }
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
    url: "https://services8.arcgis.com/TWq7UjmDRPE14lEV/arcgis/rest/services/ParkingMenara165/FeatureServer/0",
    renderer: sensorRenderer,
    outFields: ["distance", "AVAILABILITY", "SENSOR_NAME"],
  });
  
sensorLayer.labelsVisible = true;
sensorLayer.labelingInfo = [ new LabelClass({
          labelExpressionInfo: { expression: "$feature.AVAILABILITY" },
          symbol: {
            type: "text",  // autocasts as new TextSymbol()
            color: "black",
            haloSize: 1,
            haloColor: "white"
          }
        }) ];
  
  var buildingLayer = new FeatureLayer({
    url: "https://services8.arcgis.com/TWq7UjmDRPE14lEV/arcgis/rest/services/ParkingMenara165/FeatureServer/1"
  });
  
  view.then(function() {
          // get the first layer in the collection of operational layers in the WebMap
          // when the resources in the MapView have loaded.
          //var featureLayer = webmap.layers.getItemAt(0);

          var legend = new Legend({
            view: view,
            layerInfos: [{
              layer: sensorLayer,
              title: "Parking Status"
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
                    //for(var i=0; i<FEATURES.length; i++){
                    //    FEATURES[i].attributes.AVAILABILITY = "OCCUPIED";
                    //}
                    
                    //sensorLayer.renderer = newRenderer();
                    if (!init) {
                    setInterval(function(){
                        $.get("/jababeka", "", function(data, status, jqxhr){
                            y(data, FEATURES);
                            updateTable(data);
                        });
                    }, 100);
                    init = true;
                    $("#sensordata").css("display", "block");
                    console.log(FEATURES);
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

function y(data, FEATURES) {
    //console.log(data);
data = $.parseJSON(data);
    for(var i=0; i<FEATURES.length; i++){
        for ( var j=0; j<data.length; j++) {
            //console.log(FEATURES[i].attributes);
            //console.log(FEATURES[i].attributes.SENSOR_NAME);
            if ( data[j]["sensorInfo"]["hostname"] == FEATURES[i].attributes.SENSOR_NAME){
                FEATURES[i].attributes.distance = data[j]["sensorData"]["distance"];
                FEATURES[i].attributes.AVAILABILITY = data[j]["sensorData"]["distance"] < 45 ? "OCCUPIED" : "AVAILABLE";
                //console.log(FEATURES[i].attributes.availability);
            }
        }
        //console.log(FEATURES[i]);
    }
    sensorLayer.renderer = sensorRenderer;
}

var previousData = {
    "gebzepi": {
        "availability" : null,
    },
    "amripi": {
        "availability" : null,
    },
    "esripi": {
        "availability" : null,
    }
};

function updateTable(data) {
    data = $.parseJSON(data);
    
    var availability = null;
    var counter = 0;
    
    
    for ( var j=0; j<data.length; j++) {
        availability = data[j]["sensorData"]["distance"];
        //console.log(availability);
        //prev_availability = previousData[data[j]["sensorInfo"]["hostname"]]["availability"];
        
        if (availability > 45){
            counter += 1;
            //console.log("yes");
        }
        
        /*
        if (Math.abs(temperature-prev_temperature) < 0.01) {
            //$("#"+data[j]["sensorInfo"]["hostname"]+"-temperature-increment").html(" ");
            //$("#"+data[j]["sensorInfo"]["hostname"]+"-humidity-increment").html(" ");
        }else if (availability < prev_temperature) {
            //$("#"+data[j]["sensorInfo"]["hostname"]+"-temperature-increment").html("&darr;").css("opacity", 1).animate({opacity: 0}, 500, function(){})
        }else if (temperature > prev_temperature) {
            //$("#"+data[j]["sensorInfo"]["hostname"]+"-temperature-increment").html("&uarr;").css("opacity", 1).animate({opacity: 0}, 500, function(){})
        }*/
        
        //previousData[data[j]["sensorInfo"]["hostname"]]["availability"] = temperature.toFixed(2);
    }
    
    $("#parking_spaces").html(counter);
        
    
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

