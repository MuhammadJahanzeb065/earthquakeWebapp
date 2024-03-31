
$(document).ready(function(){

// $('#map').height(window.innerHeight);
// $('#slide-in').height(window.innerHeight);

$(document).on('click','#advanced',function(){
    if($('#slide-in').hasClass('in')){
        $('#slide-in').removeClass('in')
    }else{
        $('#slide-in').addClass('in')
    }
})



var map = L.map('map').setView([33.641621, 72.999858], 10);

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
// var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
// 	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// 	subdomains: 'abcd',
// 	minZoom: 1,
// 	maxZoom: 16,
// 	ext: 'jpg'
// }).addTo(map);

var mapIcon = L.icon({
    iconUrl: 'map.png',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// BlackIcon
var blackmapIcon = L.icon({
    iconUrl: 'mapicon.svg',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// RedIcon
var redmapIcon = L.icon({
    iconUrl: 'redmapicon.svg',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// adding countries json
var countriesJSON = false;
var earthquackJSON = false;
var earthquakePointsArray = [];
var filters = {
    text: "",
    range:[]
}

// request to get countries json data
fetch('./countries.json',{
    method:'GET'
}).then(Response => Response.json()).then(json => {
   
    // loop for countries (population)
    json.features.forEach(function(feature){
        $('#country-select').append('<option value="'+feature.properties.name+'">'+feature.properties.name+'</option>')
    });

    countriesJSON = L.geoJSON(json,{
        style: function (feature){
            return {
                fillOpacity:0,
                weight:0.5
            };
        },
        onEachFeature: function(feature,layer){
            layer.on('mouseover',function(){
                layer.setStyle({fillOpacity:0.4})  
                $('#country-select').val('');   

                var points = turf.points(earthquakePointsArray);
                var totalPoints = 0;
                console.log(layer.feature.geometry.coordinates)
                if(layer.feature.geometry.coordinates[0].length===1){

                    layer.feature.geometry.coordinates.forEach(function(coords){

                    var searchWithin = turf.polygon(coords);
                    var ptsWithin = turf.pointsWithinPolygon(points, searchWithin);
                    totalPoints += ptsWithin.features.length;
                    });
                }else{
                    
                    var searchWithin = turf.polygon(layer.feature.geometry.coordinates);
                    var ptsWithin = turf.pointsWithinPolygon(points, searchWithin);
                    console.log(ptsWithin)
                    totalPoints += ptsWithin.features.length;
                }

                $('#country-information').html(layer.feature.properties.name + '('+layer.feature.id+')'+totalPoints);
            })
            layer.on('mouseout',function(){
                layer.setStyle({fillOpacity:0})
                $('#country-information').html('');
            })
        }
    }).addTo(map);

    if(earthquackJSON){
        earthquackJSON.bringToFront(); // bring on the top
    }
    map.fitBounds(countriesJSON.getBounds());
}).catch(error => console.log(error.message))


// adding earthquack json
fetch('./earthquakes.geojson',{
    method:'GET'
}).then(Response => Response.json()).then(json => { 
    json.features.forEach(function(feature){
        earthquakePointsArray.push(feature.geometry.coordinates)
    });

    var min = 0;
    var max = 0;

    // var markers = L.markerClusterGroup();
    // json.features.forEach(function(feature){
    //     markers.addLayer(L.marker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]]));
        
    // });
    // map.addLayer(markers);

    var markers = L.markerClusterGroup({
        // Add custom cluster options here if needed
    });
    
    json.features.forEach(function(feature) {
        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])
            .bindPopup(createPopupContent(feature)); // Call a function to create popup content
        markers.addLayer(marker);
    });
    
    map.addLayer(markers);
    
    // Function to create popup content
    function createPopupContent(feature) {
        var popupContent = "<b>Magnitude:</b> " + feature.properties.mag + "<br>" +
                           "<b>Location:</b> " + feature.properties.place + "<br>" +
                           "<b>Time:</b> " + new Date(feature.properties.time).toLocaleString();
        return popupContent;
    }
    


    // earthquackJSON = L.geoJSON(json,{
    //     style: function (feature){
    //         return {
    //             fillOpacity:0.3,
    //             fillColor:'#000',
    //             color:'#000',
    //             // weight:0.5,
    //             opacity:0.3

    //         };
    //     },
        
    //     pointToLayer: function(geoJsonPoint,latlng){
    //         // get min/max for bar slider
    //         if(geoJsonPoint.properties.mag<min || min===0){
    //             min = geoJsonPoint.properties.mag;
    //         }
    //         if(geoJsonPoint.properties.mag>max){
    //             max = geoJsonPoint.properties.mag;
    //         }


    //         // add popup html
    //         var html = ""
    //         var arrayOfProp = ['title','place','time','mag'];
    //         arrayOfProp.forEach(function(prop){

    //             html += '<strong>' + prop+'</strong>'+ geoJsonPoint.properties[prop]+'<br/>';
    //         })
            
                

    //         return L.circle(latlng,60000*(geoJsonPoint.properties.mag)).bindPopup(html);
    //     },
    // }).addTo(map);

    // earthquackJSON.bringToFront();

    // bar slider range
    filters.range = [min,max]; // to connect search and slider
    var slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: filters.range ,
        connect: true,
        tooltips:true,
        range: {
            'min': min,
            'max': max
        }
    }).on('slide',function(e){  //this dynamically populate the slider

        filters.range = [parseFloat(e[0]),parseFloat(e[1])];
        earthquackJSON.eachLayer(function(layer){
            filterGeoJSON(layer); //filter function
            
        });
        
    });
    
}).catch(error => console.log(error.message))


// search filter
$(document).on('keyup','#search',function(e){
    filters.text = e.target.value;
    earthquackJSON.eachLayer(function(layer){
        filterGeoJSON(layer); // filter function call
    });
    
});

//function for data dynamic population
$(document).on('change','#country-select',function(e){
    var newCountry = e.target.value;
  
    if(newCountry!==''){
        countriesJSON.eachLayer(function(layer){    
            if(layer.feature.properties.name===e.target.value){
                $('#country-information').html(layer.feature.properties.name + '('+layer.feature.id+')');
                map.fitBounds(layer.getBounds()); // it will zoomToLayer selected country
            }

        });
    }else{
        $('#country-information').html('')
    }
})

// filterGeoJSON function
function filterGeoJSON(layer){
    var numberOfTrue = true;
    if(layer.feature.properties.title.toLowerCase().indexOf(filters.text.toLowerCase())> -1){
        numberOfTrue += 1;
    }
    if(layer.feature.properties.mag>=filters.range[0] && layer.feature.properties.mag<=filters.range[1]){
        numberOfTrue += 1;
    }
    if(numberOfTrue===2){
        layer.addTo(map);
    }else{
        map.removeLayer(layer)
    }

}



// calculate center
map.on('moveend',function(e){
    // console.log(map.getCenter())
    $('#current_center').html(map.getCenter().lat+','+map.getCenter().lng)
});




// var popup = L.popup()

// var geojson = {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {}, "geometry": {"coordinates": [ 72.99193103422539, 33.644657397729716 ],"type": "Point"}},{"type": "Feature", "properties": {}, "geometry": {"coordinates": [ 72.97567153402275, 33.637341747671954 ],"type": "Point"}},{"type": "Feature", "properties": {}, "geometry": {"coordinates": [ 72.97800285941946, 33.65525652247166 ],"type": "Point"}},{"type": "Feature", "properties": {}, "geometry": {"coordinates": [ [72.98272528778713, 33.64729486060237 ],[72.98786615917473, 33.64122359857606 ],[72.99856634496984, 33.64261704083064 ],[72.99671324016737, 33.649534152440964 ],[72.98977904155149, 33.649882481491304 ]],"type": "LineString"}},{"type": "Feature", "properties": {}, "geometry": {"coordinates": [ [[72.97848108001361, 33.64789201078857 ],[72.98895688339474, 33.63349978986018 ],[73.00496253780247, 33.64187055440743 ],[72.99533834834429, 33.65495797113746 ],[72.99587634651277, 33.65530627823715 ],[72.99503946047292, 33.656550220655774 ],[72.97848108001361, 33.64789201078857 ]]],"type": "Polygon"}}]}


// var markers = [];
// var coordinates = [
//     [ 33.644657397729716,72.99193103422539],
//     [ 33.637341747671954,72.97567153402275 ],
//     [ 33.65525652247166, 72.97800285941946 ]
// ];

// coordinates.forEach(function(coords){
//     var marker = L.marker(coords,{
//         icon:blackmapIcon
//     }).on('mousemove', function(e) {
//         e.target.setIcon(redmapIcon);
//     }).on('mouseout', function(e) {
//         e.target.setIcon(blackmapIcon); // Reset the icon on mouseout event
//     });
//     markers.push(marker);
// });

// var featureGroup = L.featureGroup(markers).addTo(map);

// map.fitBounds(featureGroup.getBounds(),{
//     padding:[200,200]
// });

// // calculate distance between points
// var options = {units: 'kilometers'};
// map.on('mousemove',function(e){
//     // console.log(e);
//     var from = turf.point([e.latlng.lat , e.latlng.lng]);
//     markers.forEach(function(marker){

//         var to = turf.point([marker.getLatLng().lat, marker.getLatLng().lng]);
//         var distance = turf.distance(from, to, options);
//         if(distance<5){
//             marker.setIcon(redmapIcon);
//         }else{
//             marker.setIcon(blackmapIcon);
//         }
//     });


// });




// toggle button to remove and add sidebar
// $(document).on('click','#toggleLayer',function(){
//     if(map.hasLayer(featureGroup)){
//         map.removeLayer(featureGroup)
//     }else{
//         featureGroup.addTo(map);
//     }
// });

});

// var marker1 = L.marker([ 33.644657397729716,72.99193103422539],{
//     icon:mapIcon
// });

// var marker2 = L.marker([ 33.637341747671954,72.97567153402275 ],{
//     icon:mapIcon
// });
// var marker3 = L.marker([ 33.65525652247166, 72.97800285941946 ],{
//     icon:mapIcon
// });

// var featureGroup = L.featureGroup([marker1,marker2,marker3]).addTo(map);

// map.fitBounds(featureGroup.getBounds(),{
//     padding:[200,200]
// });



// var addedGeoJSON = L.geoJSON(geojson,{
//     style:function(feature){
//         return{
//             color: 'red'
//         }
//     },
//     pointToLayer:function(geoJsonPoint, latlng) {
//         return L.marker(latlng,{
//             icon:mapIcon
//         });
//     },
//     onEachFeature:function (feature, layer) {
//         if(feature.geometry.type==='Point'){
//             layer.bindPopup(feature.geometry.coordinates.join(','))
//         }
//     }
// }).addTo(map);
// map.fitBounds(addedGeoJSON.getBounds())

