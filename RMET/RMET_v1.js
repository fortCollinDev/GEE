/*****************************RMET 1.0*****************************************************
* Script: RMET 1.0                                                                        *
* Adopted from Script: SAVETREE 2.0                                                       *
* Authors of RMET v1.0: Margaret Mulhern, Kristen Dennis, Nathaniel Penrod, Daniel Carver *
* Authors of SAVETREE v1.0: Joshua Verkerke, Anna McGarrigle, John Dilger                 *
* Authors OF SAVETREE v2.0: Heather Myers, Anna McGarrigle, Peter Norton, Andrea Ferrer   *
* Date: August 10, 2018                                                                   *
* Project: Utah & Colorado Water Resources                                                *
* Contact: develop.geoinformatics@gmail.com,                                              *
*          dennisk.kristen@gmail.com                                                      *
* URL:                                                                                    *
* Description:                                                                            *
*  River Morphology Evaluation Toolbox - RMET - is a tool developed in Google             *
* Earth Engine for the Green River corridor which flows from the Flaming Gorge            *
* Dam into the Colorado River in the southern reaches of Canyonlands National Park.       *
* RMET preforms the following functions:                                                  *
* - Performs Binary map analysis on the area of interest using a user-selcted spectral    *
* index and adds that layer to the map with the �0� values masked.                        *
* -There are four trend options to map using both the NDVI and MNDWI Spectral Indices.    *
* The More Green Trend Map isolates areas where NDVI values increased from the start year *
* to the end year. Conversely, the Less Green Trend Map isolates areas where NDVI values  *
* decreased between the years. Similarly, the More Wet Trend Map isolates areas where     *
* MNDWI values increased from the start year to the end year, whereas the Less Wet Trend  *
* Map isolates areas where MNDWI values decreased between the years. Adds that layer,     *
* along with NDVI/MNDWI layers for the Start and End years                                *
* - Click on any pixel of the change map layers and a graph of the NDVI change from       *
* 1984 - 2018 for that particular point will appear at the bottom of the widget.          *
* Click the little box with the arrow in the upper right hand corner of the graph         *
* to open the graph in a new tab. You can download this graph from this new tab.          *
*                                                                                         *
*                                                                                         *
********************************** WIDGET *************************************************
* This section gets input from the user, and sets up other necessary global               *
* variables including locations and color ramps for visualization                         *
******************************************************************************************/


///////////////Defining Study Area ///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
//AREAS OF INTEREST
var sa = ee.FeatureCollection("ft:1bPKvGa9_cgzC0aQvN13cvoPIQUGZ8SC4lEvMPzKf"), // Fusion Table for V-BET buffered by 60 meters for the entire extent of the study area
    dino = ee.FeatureCollection("ft:1_DDOsFmet-ZHtIvHmrrY4RXHw1CSgBGT_asIEtra"), // Fusion Table for V-BET buffered by 60 meters for the Green and Yampa Rivers in Dinosaur National Monument
    cany = ee.FeatureCollection("ft:12c1CX6SjRyt8KxgZCBLR3zScMHfPYzOK7Hpbxla7"), // Fusion Table for V-BET buffered by 60 meters for the Green and Colorado Rivers in Canyonlands National Park
    colorado = ee.FeatureCollection("ft:1CmGhOmXouPaUVjPw8v_YYwEHkxjtww2dS6uE83jq"), // Fusion Table for V-BET buffered by 60 meters for the extent of the Colorado River in the study area
    green = ee.FeatureCollection("ft:1po-kqXl03HC3tYNiRM_lREqFE41IODAN2ID6C39w"), // Fusion Table for V-BET buffered by 60 meters for the extent of the Green River in the study area
    white = ee.FeatureCollection("ft:16zqtj2PtpbU5yBCnVOfH26mdlehiL97DZJ-NldJS"), // Fusion Table for V-BET buffered by 60 meters for the extent of the White River in the study area
    yampa = ee.FeatureCollection("ft:1D4-XuUEPjnpYozjpCou_v9fUOnOqeL1VSDYXhcXj"), // Fusion Table for V-BET buffered by 60 meters for the extent of the Yampa River in the study area
    sentinel = ee.FeatureCollection("ft:1xUePV-sxPsUTziBN1yjUpaN8vH2l-AWnTwiYHIX4");//Fushion Table for Field Survey Site in Canyonlands National Park
// SET OF USER INPUTS FOR AREA OF INTEREST
var SA = 'Project Study Area',
    CANY = 'Canyonlands National Park',
    DINO = 'Dinosaur National Monument',
    COLORADO = 'Colorado River',
    GREEN = 'Green River',
    WHITE = 'White River',
    YAMPA = 'Yampa River',
    SENTINEL = 'Sentinel Sites',
    OWN = 'Your asset (below)';

// Gobal Variable, allows for functions to be applied within other functions
var aoi,
    areaOfInterest,
    Fimageyr1,Fimageyr2,Fimageyr3,s2Imageyr4, s2Imageyr5,s2Imageyr6,
    geometry,
    thresh,
    yr1, yr2,yr3,yr4,yr5,yr6,
    point, annualIndexCollection, annualIndexCollection2,
    currentyr, currentyr2;

/////////////////////////////////////// VIZ PARAMS///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

var VEG = {"opacity":1,"palette":["2ddc0d"],"min":0,"max":1}
var WATER = {"opacity":1, "palette":["36abff"], "min":0, "max":1}
var MG = {"opacity":1, "palette":["ffffff", "085a16"], "min":0, "max":2}
var LG = {"opacity":1, "palette":["ff7c0b", "ffffff"], "min":-2, "max":0}
var LW = {"opacity":1, "palette":["ed982f", "ffffff"], "min":-2, "max":0}
var MW = {"opacity":1, "palette":["ffffff", "0bb0ff"], "min":0, "max":2}
var visNDVI = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
var visMNDWI = {min: -1, max: 1, palette: ['yellow', 'white', 'blue']};
var sites = {"opacity":1,"palette":["ff7c0b"]}
var FLG = {"opacity":1, "palette":[ "ffffff", "ff7c0b"], "min":0, "max":2}
var FLW = {"opacity":1, "palette":[ "ffffff", "ed982f"], "min":0, "max":2}
//Function to create Image for mapping

function applyfilter(){

////////////////////////////A function which sets the area of interest/////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

function setAreaOfInterest(){
   aoi = selectAoi.getValue();
  if (aoi == SA){
      areaOfInterest = sa;
  }//sets the area of interest to the Lassen Volcanic National Park
  else if (aoi == CANY){
      areaOfInterest = cany;
  }//sets the area of interest to the Badger Planning Area
  else if (aoi == DINO){
      areaOfInterest = dino;
  }//sets the area of interest to the Lassen National Forest
  else if (aoi == COLORADO){
      areaOfInterest = colorado;
  }//sets the area to the Study Area
  else if (aoi == GREEN){
      areaOfInterest = green;
  }//sets the area to the Study Area
  else if (aoi == WHITE){
      areaOfInterest = white;
  }//sets the area to the Study Area
  else if (aoi == YAMPA){
      areaOfInterest = yampa;
  }//sets the area to the Study Area
  else if (aoi == OWN){
      var userInput = inputTextbox.getValue();
      userInput = ee.String(userInput);

      areaOfInterest = ee.FeatureCollection(userInput);
  }//sets the area of interest to an asset input by the user

  // var geometry = ee.Feature(areaOfInterest)
  // print(geometry)
}

setAreaOfInterest();
print(areaOfInterest);

geometry = areaOfInterest
/////////////////////DEFINING YEARS//////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

     yr1 = selectYr1.getValue(); //Input for Landsat Binary Map
     yr2 = selectYr2.getValue(); //Input for Landsat Change Map Start Year
     yr3 = selectYr3.getValue(); //Input for Landsat Change Map End Year
     yr4 = selectYr4.getValue(); //Input for Sentinel-2 Binary Map
     yr5 = selectYr5.getValue(); //Input for Sentinel-2 Change Map Start Year
     yr6 = selectYr6.getValue(); //Input for Sentinel-2 Change Map End Year

    print(yr1, 'Year 1');
    print(yr2, 'Year 2');
    print(yr3, 'Year 3');

currentyr = 2018 // Update to new years later than 2018 here
//currentyr2 = '2018'
///////////////////COMPUTING INDICES//////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

// A function to compute NDVI for Landsat 5.
var NDVI5 = function(image) {
  return image.normalizedDifference(["B4","B3"]).rename("NDVI");
};
// A function to compute NDVI for Landsat 7.
var NDVI7 = function(image) {
  return image.normalizedDifference(["B4","B3"]).rename("NDVI");
};
// A function to compute NDVI for Landsat 8.
var NDVI8 = function(image) {
  return image.normalizedDifference(["B5","B4"]).rename("NDVI");
};
// A function to compute NDVI for Sentinel 2.
var NDVIS = function(image) {
  return image.normalizedDifference(["B8","B4"]).rename("NDVI");
};


// A function to compute NDWI for Landsat 5.
var NDWI5 = function(image) {
  return image.normalizedDifference(["B2","B4"]).rename("NDWI");
};
// A function to compute NDWI for Landsat 7.
var NDWI7 = function(image) {
  return image.normalizedDifference(["B2","B4"]).rename("NDWI");
};
// A function to compute NDWI for Landsat 8.
var NDWI8 = function(image) {
  return image.normalizedDifference(["B3","B5"]).rename("NDWI");
};
// A function to compute NDWI for Sentinel 2.
var NDWIS = function(image) {
  return image.normalizedDifference(["B3","B11"]).rename("NDWI");
};


// A function to compute MNDWI for Landsat 5.
var MNDWI5 = function(image) {
  return image.normalizedDifference(["B2","B5"]).rename("MNDWI");
};
// A function to compute MNDWI for Landsat 7.
var MNDWI7 = function(image) {
  return image.normalizedDifference(["B2","B5"]).rename("MNDWI");
};
// A function to compute MNDWI for Landsat 8.
var MNDWI8 = function(image) {
  return image.normalizedDifference(["B3","B6"]).rename("MNDWI");
};


// A function to compute SAVI for Landsat 8
var SAVI8 = function(image) {
  return image.expression('((NIR - RED) / (NIR + RED +0.5))*(1.5)', {
      'NIR': image.select('B5'),
      'RED': image.select('B4')}).rename("SAVI");
};
// A function to compute SAVI for Landsat 7
var SAVI7 = function(image) {
  return image.expression('((NIR - RED) / (NIR + RED +0.5))*(1.5)', {
      'NIR': image.select('B4'),
      'RED': image.select('B3')}).rename("SAVI");
};
// A function to compute SAVI for Landsat 5.
var SAVI5 = function(image) {
  return image.expression('((NIR - RED) / (NIR + RED +0.5))*(1.5)', {
      'NIR': image.select('B4'),
      'RED': image.select('B3')}).rename("SAVI")
      ;
};
// A function to compute SAVI for Sentinel 2.
var SAVIS = function(image) {
  return image.expression('((NIR - RED) / (NIR + RED +0.5))*(1.5)', {
      'NIR': image.select('B8'),
      'RED': image.select('B4')}).rename("SAVI");
};


// A function to compute NDMI for Landsat 8
var NDMI8 = function(image) {
  return image.normalizedDifference(["B5","B6"]).rename("NDMI");
};
// A function to compute NDMI for Landsat 7
var NDMI7 = function(image) {
  return image.normalizedDifference(["B4","B5"]).rename("NDMI");
};
// A function to compute NDMI for Landsat 5
var NDMI5 = function(image) {
  return image.normalizedDifference(["B4","B5"]).rename("NDMI");
};

//////////////////CREATING IMAGES FOR DICTIONARY//////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

var constructS2Dict = function(geometry)
/*
  This function takes in a geometry feature from the GUI and uses it to
  generate a dictionary of median reduce images for the specified date
  range
  inputs
  geometry = defined by the gui
  Features to change
  y_list = set based on sensor type
  imagecollection = unique id for collection type
  filterDate = cat() this is used to refine the month and day of start and end time
  With adaptation this should be flexable across sensors and times
  */
  {
  var startMonth = "-04-05"
  var endMonth = "-09-30"
  //construct a dictionary for Sentinel-2
  var y_list = ee.List.sequence(2015, currentyr)
  var ystr_list = y_list.map(function(y){return ee.Number(y).format('%1d')})
  var s2 = y_list.map(function(y){return ee.ImageCollection('COPERNICUS/S2')
                                          .filterDate(ee.String(ee.Number(y).format('%1d')).cat(startMonth),
                                                      ee.String(ee.Number(y).format('%1d')).cat(endMonth))
                                          .filterBounds(geometry)
                                          .median()})
  var s2_dict = ee.Dictionary.fromLists(ystr_list, s2);

  return(s2_dict)}

// apply sentinel 2 functions
var selectYearAddBandsS2 = function(dictionary, year, geometry)
  /*
  This function takes in a dictionary and a user inputed value from
  the gui. From this it pulls a year from the dictionary, calcualted
  indicies, and adds though indices to the image. The final image is
  returned.
  inputs
  dictionary = dictionary containing single images
  year = key for the dictionary
  geometry = feature to clip the images too
  */
  {
      var imageYear = ee.Image(dictionary.get(year)).clip(geometry)
      var outImage = imageYear.addBands(NDVIS(imageYear))
                              .addBands(NDWIS(imageYear))
                              .addBands(SAVIS(imageYear))
  return (outImage)
}

// attempt to construct a las dictionary
var constructLSDict = function(geometry)
  /*
  This function takes in a geometry feature from the GUI and uses it to
  generate a dictionary of median reduce images for the specified date
  range
  inputs
  geometry = defined by the gui
  Features to change
  y_list = set based on sensor type
  imagecollection = unique id for collection type
  filterDate = cat() this is used to refine the month and day of start and end time
  With adaptation this should be flexable across sensors and times

  */
  {
  var startMonth = "-04-05"
  var endMonth = "-09-30"
  //construct a dictionary for landsat 8
  var y_list = ee.List.sequence(2013, currentyr)
  var ystr_list = y_list.map(function(y){return ee.Number(y).format('%1d')})
  var ls8 = y_list.map(function(y){return ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                                          .filterDate(ee.String(ee.Number(y).format('%1d')).cat(startMonth),
                                                      ee.String(ee.Number(y).format('%1d')).cat(endMonth))
                                          .filterBounds(geometry)
                                          .filterMetadata('CLOUD_COVER', 'less_than', 30)
                                          .median()})
  var ls8_dict = ee.Dictionary.fromLists(ystr_list, ls8);

  // construct a disctionary for LS7
  var y_list7 = ee.List.sequence(2012, 2012)
  var ystr_list7 = y_list7.map(function(y){return ee.Number(y).format('%1d')})
  var ls7 = y_list7.map(function(y){return ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
                                          .filterDate(ee.String(ee.Number(y).format('%1d')).cat(startMonth),
                                                      ee.String(ee.Number(y).format('%1d')).cat(endMonth))
                                          .filterBounds(geometry)
                                          .filterMetadata('CLOUD_COVER', 'less_than', 30)
                                          .median()})
  var ls7_dict = ee.Dictionary.fromLists(ystr_list7, ls7);
  // combine the dictionary
  var ls8_ls7_dict = ls8_dict.combine(ls7_dict)

  //contruct a dictionary for LS5
  var y_list5 = ee.List.sequence(1984,2011)
  var ystr_list5 = y_list5.map(function(y){return ee.Number(y).format('%1d')})
  var ls5 = y_list5.map(function(y){return ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                                          .filterDate(ee.String(ee.Number(y).format('%1d')).cat(startMonth),
                                                      ee.String(ee.Number(y).format('%1d')).cat(endMonth))
                                          .filterBounds(geometry)
                                          .filterMetadata('CLOUD_COVER', 'less_than', 30)
                                          .median()})
  var ls5_dict = ee.Dictionary.fromLists(ystr_list5, ls5);
  // combine the dictionary
  var LS_Dict = ls8_ls7_dict.combine(ls5_dict)

  return(LS_Dict)}

//////////////////Function for selecting year and adding bands //////////////////////
/////////////////////////////////////////////////////////////////////////////////////

var selectYearAddBands = function(dictionary, year, geometry)
  /*
  This function takes in a dictionary and a user inputed value from
  the gui. From this it pulls a year from the dictionary, calcualted
  indicies, and adds though indices to the image. The final image is
  returned.
  */
 {
    //var dateNumber = ee.Number(year)
    if (year >= 2012) {
      var imageYear = ee.Image(dictionary.get(year)).clip(geometry) //clip image pulled from dictionary to SA
      var outImage = imageYear.addBands(NDVI8(imageYear)) //add NDVI to Bands
                              .addBands(NDWI8(imageYear)) //add NDWI to Bands
                              .addBands(MNDWI8(imageYear)) //add MNDWI to Bands
                              .addBands(SAVI8(imageYear)) //add SAVI to Bands
                              .addBands(NDMI8(imageYear)) //add NDMI to Bands
    } else if (year == 2011) {
      var imageYear = ee.Image(dictionary.get(year)).clip(geometry)
      var outImage = imageYear.addBands(NDVI7(imageYear))
                              .addBands(NDWI7(imageYear))
                              .addBands(MNDWI8(imageYear))
                              .addBands(SAVI7(imageYear))
                              .addBands(NDMI7(imageYear))
    } else {
      var imageYear = ee.Image(dictionary.get(year)).clip(geometry)
      var outImage = imageYear.addBands(NDVI5(imageYear))
                              .addBands(NDWI5(imageYear))
                              .addBands(MNDWI8(imageYear))
                              .addBands(SAVI5(imageYear))
                              .addBands(NDMI5(imageYear))
    }
  return (outImage)
};

//Make LS Dictionary and Select years of interest
 var dict_ls = constructLSDict(geometry);
  Fimageyr1 = selectYearAddBands(dict_ls, yr1, geometry); //LS BINARY
  Fimageyr2 = selectYearAddBands(dict_ls, yr2, geometry); //LS Change Start Year
  Fimageyr3 = selectYearAddBands(dict_ls, yr3, geometry); //LS Change End Year
//Make S2 Dictionary and Select years of interest
 var sen2_dict = constructS2Dict(geometry);
  s2Imageyr4 = selectYearAddBandsS2(sen2_dict, yr4, geometry); //S2 BINARY
  s2Imageyr5 = selectYearAddBandsS2(sen2_dict, yr5, geometry); //S2 Change Start Year
  s2Imageyr6 = selectYearAddBandsS2(sen2_dict, yr6, geometry); //S2 Change End Year

print(s2Imageyr4, 'sentinel');
print(Fimageyr1, 'Year 1 Image');
var yo = sentinel
Map.addLayer(yo, sites, 'Sentinel Sites')
}

// /////////////////////////////CREATING LANDSAT BINARY MAPS/////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

//FUNCTION TO CREATE A BINARY NDVI MAP FOR A USER SELECTED YEAR AND AOI
function NDVIBIN (){
    applyfilter();
    var Nimage = Fimageyr1.expression(
    "NDVI >= thresh1", {
      'NDVI': Fimageyr1.select('NDVI').clip(geometry),
      'thresh1' : NDVIslider.getValue()}); //Slider bar input

      var NDVIMimage = Nimage.updateMask(Nimage.gt(0)); //Mask 0 values
      Map.centerObject(geometry); //Center on AOI
      Map.addLayer(NDVIMimage, VEG, 'NDVI Landsat Binary Map(' + yr1+ ')');
}

//FUNCTION TO CREATE A BINARY MNDWI MAP FOR A USER SELECTED YEAR AND AOI
  function MNDWIBIN (){
    applyfilter();
    var MNimage = Fimageyr1.expression(
    "MNDWI >= thresh2", {
      'MNDWI': Fimageyr1.select('MNDWI').clip(geometry),
      'thresh2' : MNDWIslider.getValue()});//Slider bar input

      var MNDWIMimage = MNimage.updateMask(MNimage.gt(0)); //Mask 0 values
      Map.centerObject(geometry); //Center on AOI
      Map.addLayer(MNDWIMimage, WATER, 'MNDWI Landsat Binary Map(' + yr1 + ')');
}

//FUNCTION TO CREATE A BINARY SAVI MAP FOR A USER SELECTED YEAR AND AOI
  function SAVIBIN (){
    applyfilter();
    var SAimage = Fimageyr1.expression(
    "SAVI >= thresh3", {
      'SAVI': Fimageyr1.select('SAVI').clip(geometry),
      'thresh3' : SAVIslider.getValue()});//Slider bar input

      var SAVIMimage = SAimage.updateMask(SAimage.gt(0)); //Mask 0 values
      Map.centerObject(geometry); //Center on AOI
      Map.addLayer(SAVIMimage, VEG, 'SAVI Landsat Binary Map(' + yr2 + ')');
}

////////////////////////////////////CREATING SENTINEL-2 BINARY MAPS //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//FUNCTION TO CREATE A BINARY NDVI MAP FOR A USER SELECTED YEAR AND AOI
function SNDVIBIN (){
    applyfilter();
    var SNimage = s2Imageyr4.expression(
    "NDVI >= thresh4", {
      'NDVI': s2Imageyr4.select('NDVI').clip(geometry),
  'thresh4' : SNDVIslider.getValue()}); //Slider bar input

      var NDVIMimage = SNimage.updateMask(SNimage.gt(0)); //Mask 0 values
      Map.centerObject(geometry); //Center on AOI
      Map.addLayer(NDVIMimage, VEG, 'NDVI Sentinel-2 Binary Map(' + yr4+ ')');
}

//FUNCTION TO CREATE A BINARY MNDWI MAP FOR A USER SELECTED YEAR AND AOI
  function SNDWIBIN (){
    applyfilter();
    var SMNimage = s2Imageyr4.expression(
    "NDWI >= thresh5", {
      'NDWI': s2Imageyr4.select('NDWI').clip(geometry),
      'thresh5': SNDWIslider.getValue()}); //Slider bar input

      var NDWIMimage = SMNimage.updateMask(SMNimage.gt(0)); //Mask 0 values
      Map.centerObject(geometry); //Center on AOI
      Map.addLayer(NDWIMimage, WATER, 'NDWI Sentinel-2 Binary Map(' + yr4 + ')');
}

//////////////////////////////CREATING LS CHANGE MAPS //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

//FUNCTION TO CREATE A LS NDVI CHANGE  MAP FOR A USER SELECTED STARTYEAR, ENDYEAR,  AND AOI

  function GREENER() {
    applyfilter();
    var date1 = Fimageyr2.select('NDVI'); //Select NDVI Values for Start Year
    var date2 = Fimageyr3.select('NDVI'); //Select NDVI VAlues for End Year
    var diff = date2.subtract(date1); //Subtract rasters to get maginitude of change
    var trend = date2.gt(date1); //Creates a binary where pixels that got closer to 1, are 1
    var final = trend.multiply(diff).clip(geometry); //Shows magnitude for greening trend

    Map.centerObject(geometry); // Center on AOI
    Map.addLayer(final, MG, 'Areas that have become more green(' + yr2 + ')-(' + yr3 + ')');
    Map.addLayer(date1, visNDVI, 'NDVI (' + yr2 + ')', false); //Creates a layer with the Indice in the Start Year
    Map.addLayer(date2, visNDVI, 'NDVI(' + yr3 + ')', false); //Creates a layer with the Indice in the End Year
  }


    function LESSGREEN() {
      applyfilter();
    var date1 = Fimageyr2.select('NDVI'); //Select NDVI Values for Start Year
    var date2 = Fimageyr3.select('NDVI'); //Select NDVI VAlues for End Year
    var diff = date2.subtract(date1); //Subtract rasters to get maginitude of change
    var trend = date2.lt(date1); //Creates a binary where pixels that got closer to -1, are 1
    var final = trend.multiply(diff).clip(geometry); //Shows magnitude for less green trend

    Map.centerObject(geometry); // Center on AOI
    Map.addLayer(final, LG, 'Areas that have become less green(' + yr2 + ')-(' + yr3 + ')');
    Map.addLayer(date1, visNDVI, 'NDVI(' + yr2 + ')', false); //Creates a layer with the Indice in the Start Year
    Map.addLayer(date2, visNDVI, 'NDVI(' + yr3 + ')', false); //Creates a layer with the Indice in the End Year
  }

//FUNCTION TO CREATE A LS MNDWI CHANGE  MAP FOR A USER SELECTED STARTYEAR, ENDYEAR,  AND AOI
    function WETTER() {
      applyfilter();
    var date1 = Fimageyr2.select('MNDWI'); //Select MNDWI Values for Start Year
    var date2 = Fimageyr3.select('MNDWI'); //Select MNDWI VAlues for End Year
    var diff = date2.subtract(date1); //Subtract rasters to get maginitude of change
    var trend = date2.gt(date1); //Creates a binary where pixels that got closer to 1, are 1
    var final = trend.multiply(diff).clip(geometry); //Shows magnitude for more wet trend

    Map.centerObject(geometry); // Center on AOI
    Map.addLayer(final, MW, 'Areas that have become more wet(' + yr2 + ')-(' + yr3 + ')');
    Map.addLayer(date1, visMNDWI, 'MNDWI(' + yr2 + ')', false); //Creates a layer with the Indice in the Start Year
    Map.addLayer(date2, visMNDWI, 'MNDWI(' + yr3 + ')', false); //Creates a layer with the Indice in the End Year
  }

    function LESSWET() {
      applyfilter();
    var date1 = Fimageyr2.select('MNDWI'); //Select MNDWI Values for Start Year
    var date2 = Fimageyr3.select('MNDWI'); //Select MNDWI VAlues for End Year
    var diff = date2.subtract(date1); //Subtract rasters to get maginitude of change
    var trend = date2.lt(date1);  //Creates a binary where pixels that got closer to -1, are 1
    var final = trend.multiply(diff).clip(geometry); //Shows magnitude for less wet trend

    Map.centerObject(geometry); // Center on AOI
    Map.addLayer(final, LW, 'Areas that have become less wet(' + yr2 + ')-(' + yr3 + ')');
    Map.addLayer(date1, visMNDWI, 'MNDWI(' + yr2 + ')', false); //Creates a layer with the Indice in the Start Year
    Map.addLayer(date2, visMNDWI, 'MNDWI(' + yr2 + ')', false); //Creates a layer with the Indice in the End Year
  }

//////////////////////////////CREATING S2 CHANGE MAPS //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

//FUNCTION TO CREATE A S2 NDVI CHANGE  MAP FOR A USER SELECTED STARTYEAR, ENDYEAR,  AND AOI

  function SGREENER() {
    applyfilter();
    var date1 = s2Imageyr5.select('NDVI'); //Select NDVI Values for Start Year
    var date2 = s2Imageyr6.select('NDVI'); //Select NDVI VAlues for End Year
    var diff = date2.subtract(date1); //Subtract rasters to get maginitude of change
    var trend = date2.gt(date1); //Creates a binary where pixels that got closer to 1, are 1
    var final = trend.multiply(diff).clip(geometry); //Shows magnitude for more green trend

    Map.centerObject(geometry); // Center on AOI
    Map.addLayer(final, MG, 'Areas that have become more green(' + yr5 + ')-(' + yr6 + ')');
    Map.addLayer(date1, visNDVI, 'NDVI (' + yr5 + ')', false); //Creates a layer with the Indice in the Start Year
    Map.addLayer(date2, visNDVI, 'NDVI(' + yr6 + ')', false); //Creates a layer with the Indice in the End Year
}



    function SLESSGREEN() {
      applyfilter();
    var date1 = s2Imageyr5.select('NDVI'); //Select NDVI Values for Start Year
    var date2 = s2Imageyr6.select('NDVI'); //Select NDVI VAlues for End Year
    var diff = date2.subtract(date1); //Subtract rasters to get maginitude of change
    var trend = date2.lt(date1);  //Creates a binary where pixels that got closer to -1, are 1
    var final = trend.multiply(diff).clip(geometry); //Shows magnitude for less green trend

    Map.centerObject(geometry); // Center on AOI
    Map.addLayer(final, LG, 'Areas that have become less green(' + yr5 + ')-(' + yr6 + ')');
    Map.addLayer(date1, visNDVI, 'NDVI(' + yr5 + ')', false); //Creates a layer with the Indice in the Start Year
    Map.addLayer(date2, visNDVI, 'NDVI(' + yr6 + ')', false); //Creates a layer with the Indice in the End Year
}


//FUNCTION TO CREATE A S2 NDWI CHANGE  MAP FOR A USER SELECTED STARTYEAR, ENDYEAR,  AND AOI
    function SWETTER() {
      applyfilter();
    var date1 = s2Imageyr5.select('NDWI'); //Select NDWI Values for Start Year
    var date2 = s2Imageyr6.select('NDWI'); //Select NDWI VAlues for End Year
    var diff = date2.subtract(date1); //Subtract rasters to get maginitude of change
    var trend = date2.gt(date1); //Creates a binary where pixels that got closer to 1, are 1
    var final = trend.multiply(diff).clip(geometry); //Shows magnitude for more wet trend

    Map.centerObject(geometry); // Center on AOI
    Map.addLayer(final, MW, 'Areas that have become more wet(' + yr5 + ')-(' + yr6 + ')');
    Map.addLayer(date1, visMNDWI, 'NDWI(' + yr5 + ')', false); //Creates a layer with the Indice in the Start Year
    Map.addLayer(date2, visMNDWI, 'NDWI(' + yr6 + ')', false); //Creates a layer with the Indice in the End Year
}

    function SLESSWET() {
      applyfilter();
    var date1 = s2Imageyr5.select('NDWI'); //Select NDWI Values for Start Year
    var date2 = s2Imageyr6.select('NDWI'); //Select NDWI VAlues for End Year
    var diff = date2.subtract(date1); //Subtract rasters to get maginitude of change
    var trend = date2.lt(date1);  //Creates a binary where pixels that got closer to -1, are 1
    var final = trend.multiply(diff).clip(geometry); //Shows magnitude for less wet trend

    Map.centerObject(geometry); // Center on AOI
    Map.addLayer(final, LW, 'Areas that have become less wet(' + yr5 + ')-(' + yr6 + ')');
    Map.addLayer(date1, visMNDWI, 'NDWI(' + yr5 + ')', false); //Creates a layer with the Indice in the Start Year
    Map.addLayer(date2, visMNDWI, 'NDWI(' + yr6 + ')', false); //Creates a layer with the Indice in the End Year
}

///////////////////////////////////MAP RESET/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function reset(){
  Map.clear();
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// WIDGET PANEL ///////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Spacer object//
var spacer = ui.Label('           ');

/* Create UI Panels */
var panel = ui.Panel({style: {width:'33.333%'}});
ui.root.insert(0,panel);
/* Introduction */
var intro = ui.Label('RMET: River Morphology Evaluation Toolbox ',
  {fontWeight: 'bold', fontSize: '24px', margin: '10px 5px'}
);
var subtitle = ui.Label('Use 30m Landsat 5,7,8 or 10m Sentinel-2 MSI imagery to'+
  ' analyze changes in river geomorpholgy over time using spectral indices.'+
  ' Allows you to choose area of interest and type of map you want to visualize.'+
  ' Landsat imagery is available from 1984 - present, while Sentinel-2 MSI imagery is available 2016 - present year.', {});
panel.add(intro).add(subtitle);

////////////////////SELECT AREA OF INTEREST//////////////////////////////
////////////////////////////////////////////////////////////////////////

//SELECT BUTTONS FOR AOI
var selectAoi = ui.Select({
  items:[SA,CANY,DINO,COLORADO,GREEN,WHITE,YAMPA,OWN],
  placeholder:'Select area of interest',
  value: 'Project Study Area',//Default
  //onChange: addOwnAOI
  });


// Prompt box to input your own asset
function addOwnAOI(aoi) {
  if (areaOfInterest == OWN)
    var ownasset_input = ui.Textbox({
    style: {width:'250px'},
    placeholder: 'users/your_username/asset_name'
      });
    SIAOIpanel.add(ui.Label('Input shapefile'))
              .add(ownasset_input);
}



var selectSIAOI = ui.Label({value:'Select area of interest',
style: {fontSize: '18px', fontWeight: 'bold'}});
var SIAOIpanel = ui.Panel();

SIAOIpanel.add(selectSIAOI)
          .add(ui.Panel([selectAoi]), ui.Panel.Layout.flow('horizontal'));
panel.add(SIAOIpanel);
var step3 = ui.Label('Or use your own asset as the area of interest (see Readme for how to load assets)');
var inputTextbox = ui.Textbox({
  style: {width:'250px'},
  placeholder: 'users/your_username/asset_name',
  onChange: function(input) {
    var userInput = input;
  }
});

panel.add(step3).add(inputTextbox);

///////////////////Select Year and Duration of Time Series /////////////////////////
///////////////////////////////////////////////////////////////////////////////////

var durpanel = ui.Panel([ui.Label({
  value:'Select Year for Landsat 30m Binary Map',
  style:{fontSize: '18px', fontWeight: 'bold'}})]);

var textboxStyle = ui.Textbox({style: {width:'8px'}});
var selectYr1 = ui.Textbox({placeholder: 'Year',  value: '2018',
  style: {width: '100px'}}); //defaults to 2016
var selectYr2 = ui.Textbox({placeholder: 'Year',  value: '1985',
  style: {width: '100px'}}); //defaults to 2016
var selectYr3 = ui.Textbox({placeholder: 'Year',  value: '2018',
  style: {width: '100px'}}); //defaults to 2016
//var GetIMAGE = ui.Button('Apply Parameters',applyfilter);

var datasetRange_label = ui.Label('Choose year from 1984 - 2018      ',
  {margin: '0 0 0 10px',fontSize: '12px',color: 'gray'});



var durRange_subtext = ui.Panel([
  datasetRange_label],
  ui.Panel.Layout.flow('horizontal'));
var row2 = ui.Panel([selectYr1],
  ui.Panel.Layout.flow('horizontal'));
durpanel.add(durRange_subtext).add(row2);
panel.add(durpanel);


//////////////////////////////ADDMAPS/////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

//NDVI BINARY SLIDER AND MAP
var NDVIslider = ui.Slider();

NDVIslider.setValue(0.17);  // Set a default value.
NDVIslider.onChange(function(value) {
  Map.layers().get(0);
});

//Create the label that is actually the colored box.
var makeRow = function(color1) {
    var colorBox1 = ui.Label({
      style: {
        backgroundColor: '#' + color1,
        padding: '15px',
        margin: '10px 10px 10px 10px'
      }
    });
    return ui.Panel({
       widgets: [colorBox1],
       layout: ui.Panel.Layout.Flow('horizontal')
    });
}
var colorboxA = makeRow('2ddc0d')
var NDVIBINMAP = ui.Button('Landsat NDVI Map',NDVIBIN);
panel.add(ui.Panel([NDVIslider, NDVIBINMAP, colorboxA], ui.Panel.Layout.flow('horizontal')));

//MNDWI BINARY SLIDER AND MAP
var MNDWIslider = ui.Slider();

MNDWIslider.setValue(0.15);  // Set a default value.
MNDWIslider.onChange(function(value) {
  Map.layers().get(0);
});
var colorboxB = makeRow('36abff')
var MNDWIBINMAP = ui.Button('Landsat MNDWI Map', MNDWIBIN);
panel.add(ui.Panel([MNDWIslider, MNDWIBINMAP, colorboxB], ui.Panel.Layout.flow('horizontal')));

//SAVI BINARY SLIDER AND MAP
var SAVIslider = ui.Slider();

SAVIslider.setValue(0.21);  // Set a default value.
SAVIslider.onChange(function(value) {
  Map.layers().get(0);
});
var colorboxC = makeRow('2ddc0d')
var SAVIBINMAP = ui.Button('Landsat SAVI Map', SAVIBIN);
panel.add(ui.Panel([SAVIslider, SAVIBINMAP, colorboxC], ui.Panel.Layout.flow('horizontal')));

//Add LS NDVI Change Map where pixels got closer to 1 & LS NDVI MAP for each year
var GRMAP = ui.Button('More Green Trend Map', GREENER);
//Add LS NDVI Change Map where pixels got closer to -1 & LS NDVI MAP for each year
var LGMAP = ui.Button('Less Green Trend Map', LESSGREEN);
//Add LS MNDWI Change Map where pixels got closer to 1 & LS MNDWI MAP for each year
var MWMAP = ui.Button('More Wet Trend Map', WETTER);
//Add LS MNDWI Change Map where pixels got closer to -1 & LS MNDWI MAP for each year
var LWMAP = ui.Button('Less Wet Trend Map', LESSWET);

/////////////////////////////////////////color bars////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function makeLegend(vis, mag1, mag2) {
    var lon = ee.Image.pixelLonLat().select('longitude');
    var gradient = lon.multiply((vis.max-vis.min)/100.0).add(vis.min);
    var legendImage = gradient.visualize(vis);

    //Coefficient legend
    var thumb = ui.Thumbnail({
      image: legendImage,
      params: {bbox:'0,0,100,8', dimensions:'300x15'},
      style: {position: 'bottom-center'}
    });
    var text = ui.Panel({
      widgets: [
        ui.Label(mag1),
        ui.Label({style: {stretch: 'horizontal'}}),
        ui.Label(String('   ')),
        ui.Label({style: {stretch: 'horizontal'}}),
        ui.Label(String(mag2)),
      ],
      layout: ui.Panel.Layout.flow('horizontal'),
      style: {
        padding: '10px',
        stretch: 'horizontal',
        fontSize: '12px',
        color: 'gray',
        textAlign: 'center'
      }
    });

    return ui.Panel({style:{position: 'bottom-left'}})
      .add(text).add(thumb);
  }
//creat LS Change Map Legends
 var MGLEGEND = makeLegend(MG, 'Low Magnitude', 'High Magnitude');
 var LGLEGEND = makeLegend(FLG, 'Low Magnitude', 'High Magnitude');
 var MWLEGEND = makeLegend(MW,  'Low Magnitude', 'High Magnitude');
 var LWLEGEND = makeLegend(FLW, 'Low Magnitude', 'High Magnitude');


var changepanel = ui.Panel([ui.Label({
  value:'Select Years for Landsat 30m Change Map',
  style:{fontSize: '18px', fontWeight: 'bold'}})]);
  var datasetRange_label2 = ui.Label('Start Year (1984 - )          ',
  {margin: '0 0 0 10px',fontSize: '12px',color: 'gray'});
  var datasetRange_label3 = ui.Label('End Year (- 2018)             ',
  {margin: '0 0 0 10px',fontSize: '12px',color: 'gray'});
var durRange_subtext2 = ui.Panel([
  datasetRange_label2, datasetRange_label3],
  ui.Panel.Layout.flow('horizontal'));
changepanel.add(durRange_subtext2);
panel.add(changepanel);

panel.add(ui.Panel([selectYr2, selectYr3],ui.Panel.Layout.flow('horizontal') ))
panel.add(ui.Panel([GRMAP,MGLEGEND], ui.Panel.Layout.flow('horizontal')));
panel.add(ui.Panel([LGMAP,LGLEGEND], ui.Panel.Layout.flow('horizontal')));
panel.add(ui.Panel([MWMAP, MWLEGEND], ui.Panel.Layout.flow('horizontal')));
panel.add(ui.Panel([LWMAP, LWLEGEND], ui.Panel.Layout.flow('horizontal')));
  var resetButton = ui.Button('Reset Map', reset);
panel.add(resetButton);

///////////////SENTINEL 2 MSI //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

//Year inputs for S2
var selectYr4 = ui.Textbox({placeholder: 'Year',  value: '2016',
  style: {width: '100px'}}); //defaults to 2016
var selectYr5 = ui.Textbox({placeholder: 'Year',  value: '2016',
  style: {width: '100px'}}); //defaults to 2016
var selectYr6 = ui.Textbox({placeholder: 'Year',  value: '2018',
  style: {width: '100px'}}); //defaults to 2016
//var GetIMAGE = ui.Button('Apply Parameters',applyfilter);
var sentinelBINpanel = ui.Panel([ui.Label({
  value:'Select Year for Sentinel-2 10m Binary Map',
  style:{fontSize: '18px', fontWeight: 'bold'}})]);
  var datasetRange_label4 = ui.Label('Choose year from 2016 - 2018      ',
  {margin: '0 0 0 10px',fontSize: '12px',color: 'gray'});
sentinelBINpanel.add(datasetRange_label4)
panel.add(sentinelBINpanel);
panel.add(ui.Panel([selectYr4],ui.Panel.Layout.flow('horizontal') ));

// Binary maps for S2

//NDVI SLIDER AND MAP
var SNDVIslider = ui.Slider();

SNDVIslider.setValue(0.21);  // Set a default value.
SNDVIslider.onChange(function(value) {
  Map.layers().get(0);
});

var colorboxD = makeRow('2ddc0d')
var SNDVIBINMAP = ui.Button(' Sentinel-2 NDVI Map',SNDVIBIN);
panel.add(ui.Panel([SNDVIslider, SNDVIBINMAP, colorboxD], ui.Panel.Layout.flow('horizontal')));


//MNDWI BINARY SLIDER AND MAP
var SNDWIslider = ui.Slider();

SNDWIslider.setValue(0.19);  // Set a default value.
SNDWIslider.onChange(function(value) {
  Map.layers().get(0);
});
var NDWIBINMAP = ui.Button('Setinel-2 NDWI Map', SNDWIBIN);
var colorboxE = makeRow('36abff')
panel.add(ui.Panel([SNDWIslider, NDWIBINMAP, colorboxE], ui.Panel.Layout.flow('horizontal')));

//Create S2 Change map legends
var SMGLEGEND = makeLegend(MG, 'Low Magnitude', 'High Magnitude');
 var SLGLEGEND = makeLegend(FLG, 'Low Magnitude', 'High Magnitude');
 var SMWLEGEND = makeLegend(MW, 'Low Magnitude', 'High Magnitude');
 var SLWLEGEND = makeLegend(FLW, 'Low Magnitude', 'High Magnitude');

var sentinelCHApanel = ui.Panel([ui.Label({
  value:'Select Years for Sentinel-2 10m change Map',
  style:{fontSize: '18px', fontWeight: 'bold'}})]);
//panel.add(sentinelCHApanel);

var datasetRange_label6 = ui.Label('Start Year (2016 - )          ',
  {margin: '0 0 0 10px',fontSize: '12px',color: 'gray'});
  var datasetRange_label7 = ui.Label('End Year (-2018)     ',
  {margin: '0 0 0 10px',fontSize: '12px',color: 'gray'});
var durRange_subtextx = ui.Panel([
  datasetRange_label6, datasetRange_label7],
  ui.Panel.Layout.flow('horizontal'));
sentinelCHApanel.add(durRange_subtextx);
panel.add(sentinelCHApanel);


//Add S2 NDVI Change Map where pixels got closer to 1 & S2 NDVI MAP for each year
var SGRMAP = ui.Button('More Green Trend Map', SGREENER);
//Add S2 NDVI Change Map where pixels got closer to -1 & S2 NDVI MAP for each year
var SLGMAP = ui.Button('Less Green Trend Map', SLESSGREEN);
//Add S2 NDWI Change Map where pixels got closer to 1 & S2 NDWI MAP for each year
var SWRMAP = ui.Button('More Wet Trend Map', SWETTER);
//Add S2 NDWI Change Map where pixels got closer to -1 & S2 NDWI MAP for each year
var SLWMAP = ui.Button('Less Wet Trend Map', SLESSWET);

panel.add(ui.Panel([selectYr5, selectYr6],ui.Panel.Layout.flow('horizontal') ));
panel.add(ui.Panel([SGRMAP,SMGLEGEND], ui.Panel.Layout.flow('horizontal')));
panel.add(ui.Panel([SLGMAP, SLGLEGEND], ui.Panel.Layout.flow('horizontal')));
panel.add(ui.Panel([SWRMAP, SMWLEGEND], ui.Panel.Layout.flow('horizontal')));
panel.add(ui.Panel([SLWMAP, SLWLEGEND], ui.Panel.Layout.flow('horizontal')));
var resetButton2 = ui.Button('Reset Map', reset);
panel.add(resetButton2);

//Add NDVI CHART BASED ON LANDTRENDR\
//var NDVIChart =  ui.Button('NDVI Chart', NDVICHART);
//panel.add(ui.Panel([NDVIChart], ui.Panel.Layout.flow('horizontal')));


///////////////////////////////////////LandTrender NDVI/////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////MANUAL INSPECTOR TOOL/////

// Create an intro panel with labels.
var intro = ui.Panel([
  ui.Label({
    value: 'Change Inspector',
    style: {fontSize: '18px', fontWeight: 'bold'}
  }),
  ui.Label('Click a point on the map to inspect.')
]);
panel.add(intro);

// Create panels to hold lon/lat values.
var lon = ui.Label();
var lat = ui.Label();
panel.add(ui.Panel([lon, lat], ui.Panel.Layout.flow('horizontal')));

// Register a callback on the default map to be invoked when the map is clicked.
Map.onClick(function(coords) {

// Update the lon/lat panel with values from the click event.
  lon.setValue('lon: ' + coords.lon.toFixed(2));
  lat.setValue('lat: ' + coords.lat.toFixed(2));

var longitude = ee.Algorithms.String(lon.setValue('lon: ' + coords.lon.toFixed(2)));
// Add a dot for the point clicked on.
 point = ee.Geometry.Point(coords.lon, coords.lat);
var dot = ui.Map.Layer(point, {color: 'FFFFFF'});
Map.layers().set(4, dot);


function NDVICHART(){
// define a geometry - there are lots of ways to do this, see the GEE User guide

var aoi2 = point; // should be a GEE geometry object - here we are getting it from an drawn polygon


// define years and dates to include in landsat image collection
var startYear = 1985;    // what year do you want to start the time series
var endYear   = currentyr;    // what year do you want to end the time series
var startDay  = '04-01'; // what is the beginning of date filter | month-day
var endDay    = '09-01'; // what is the end of date filter | month-day


// define function to calculate a spectral index to segment with LT
var segIndex = function(img) {
    var index = img.normalizedDifference(['B3', 'B4'])                      // calculate normalized difference of band 4 and band 7 (B4-B7)/(B4+B7)
                  .multiply(1)                                          // ...scale results by 1000 so we can convert to int and retain some precision
                  .select([0], ['NDVI'])                                    // ...name the band
                  .set('system:time_start', img.get('system:time_start')); // ...set the output system:time_start metadata to the input image time_start otherwise it is null
    return index ;
};

var distDir = -1; // define the sign of spectral delta for vegetation loss for the segmentation index -
                  // NBR delta is negetive for vegetation loss, so -1 for NBR, 1 for band 5, -1 for NDVI, etc


// define the segmentation parameters:
// reference: Kennedy, R. E., Yang, Z., & Cohen, W. B. (2010). Detecting trends in forest disturbance and recovery using yearly Landsat time series: 1. LandTrendr�Temporal segmentation algorithms. Remote Sensing of Environment, 114(12), 2897-2910.
//            https://github.com/eMapR/LT-GEE

//########################################################################################################
//########################################################################################################
//##### ANNUAL SR TIME SERIES COLLECTION BUILDING FUNCTIONS #####
//########################################################################################################

//----- MAKE A DUMMY COLLECTOIN FOR FILLTING MISSING YEARS -----
var dummyCollection = ee.ImageCollection([ee.Image([0,0,0,0,0,0]).mask(ee.Image(0))]); // make an image collection from an image with 6 bands all set to 0 and then make them masked values


//------ L8 to L7 HARMONIZATION FUNCTION -----
// slope and intercept citation: Roy, D.P., Kovalskyy, V., Zhang, H.K., Vermote, E.F., Yan, L., Kumar, S.S, Egorov, A., 2016, Characterization of Landsat-7 to Landsat-8 reflective wavelength and normalized difference vegetation index continuity, Remote Sensing of Environment, 185, 57-70.(http://dx.doi.org/10.1016/j.rse.2015.12.024); Table 2 - reduced major axis (RMA) regression coefficients
var harmonizationRoy = function(oli) {
  var slopes = ee.Image.constant([0.9785, 0.9542, 0.9825, 1.0073, 1.0171, 0.9949]);        // create an image of slopes per band for L8 TO L7 regression line - David Roy
  var itcp = ee.Image.constant([-0.0095, -0.0016, -0.0022, -0.0021, -0.0030, 0.0029]);     // create an image of y-intercepts per band for L8 TO L7 regression line - David Roy
  var y = oli.select(['B2','B3','B4','B5','B6','B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']) // select OLI bands 2-7 and rename them to match L7 band names
            .resample('bicubic')                                                          // ...resample the L8 bands using bicubic
            .subtract(itcp.multiply(10000)).divide(slopes)                                // ...multiply the y-intercept bands by 10000 to match the scale of the L7 bands then apply the line equation - subtract the intercept and divide by the slope
            .set('system:time_start', oli.get('system:time_start'));                      // ...set the output system:time_start metadata to the input image time_start otherwise it is null
  return y.toShort();                                                                       // return the image as short to match the type of the other data
};


//------ RETRIEVE A SENSOR SR COLLECTION FUNCTION -----
var getSRcollection = function(year, startDay, endDay, sensor, aoi2) {
  // get a landsat collection for given year, day range, and sensor
  var srCollection = ee.ImageCollection('LANDSAT/'+ sensor + '/C01/T1_SR') // get surface reflectance images
                      .filterBounds(aoi2)                                  // ...filter them by intersection with AOI
                      .filterDate(year+'-'+startDay, year+'-'+endDay);    // ...filter them by year and day range

  // apply the harmonization function to LC08 (if LC08), subset bands, unmask, and resample
  srCollection = srCollection.map(function(img) {
    var dat = ee.Image(
      ee.Algorithms.If(
        sensor == 'LC08',                                                  // condition - if image is OLI
        harmonizationRoy(img.unmask()),                                    // true - then apply the L8 TO L7 alignment function after unmasking pixels that were previosuly masked (why/when are pixels masked)
        img.select(['B1', 'B2', 'B3', 'B4', 'B5', 'B7'])                   // false - else select out the reflectance bands from the non-OLI image
          .unmask()                                                       // ...unmask any previously masked pixels
          .resample('bicubic')                                            // ...resample by bicubic
          .set('system:time_start', img.get('system:time_start'))         // ...set the output system:time_start metadata to the input image time_start otherwise it is null
      )
    );

    // make a cloud, cloud shadow, and snow mask from fmask band
    var qa = img.select('pixel_qa');                                       // select out the fmask band
    var mask = qa.bitwiseAnd(8).eq(0).and(                                 // include shadow
              qa.bitwiseAnd(16).eq(0)).and(                               // include snow
              qa.bitwiseAnd(32).eq(0));                                   // include clouds

    // apply the mask to the image and return it
    return dat.mask(mask); //apply the mask - 0's in mask will be excluded from computation and set to opacity=0 in display
  });

  return srCollection; // return the prepared collection
};


//------ FUNCTION TO COMBINE LT05, LE07, & LC08 COLLECTIONS -----
var getCombinedSRcollection = function(year, startDay, endDay, aoi2) {
    var lt5 = getSRcollection(year, startDay, endDay, 'LT05', aoi2);       // get TM collection for a given year, date range, and area
    var le7 = getSRcollection(year, startDay, endDay, 'LE07', aoi2);       // get ETM+ collection for a given year, date range, and area
    var lc8 = getSRcollection(year, startDay, endDay, 'LC08', aoi2);       // get OLI collection for a given year, date range, and area
    var mergedCollection = ee.ImageCollection(lt5.merge(le7).merge(lc8)); // merge the individual sensor collections into one imageCollection object
    return mergedCollection;                                              // return the Imagecollection
};


//------ FUNCTION TO REDUCE COLLECTION TO SINGLE IMAGE PER YEAR BY MEDOID -----
/*
  LT expects only a single image per year in a time series, there are lost of ways to
  do best available pixel compositing - we have found that a mediod composite requires little logic
  is robust, and fast

  Medoids are representative objects of a data set or a cluster with a data set whose average
  dissimilarity to all the objects in the cluster is minimal. Medoids are similar in concept to
  means or centroids, but medoids are always members of the data set.
*/

// make a medoid composite with equal weight among indices
var medoidMosaic = function(inCollection, dummyCollection) {

  // fill in missing years with the dummy collection
  var imageCount = inCollection.toList(1).length();                                                            // get the number of images
  var finalCollection = ee.ImageCollection(ee.Algorithms.If(imageCount.gt(0), inCollection, dummyCollection)); // if the number of images in this year is 0, then use the dummy collection, otherwise use the SR collection

  // calculate median across images in collection per band
  var median = finalCollection.max();                                                                       // calculate the median of the annual image collection - returns a single 6 band image - the collection median per band

  // calculate the different between the median and the observation per image per band
  var difFromMedian = finalCollection.map(function(img) {
    var diff = ee.Image(img).subtract(median).pow(ee.Image.constant(2));                                       // get the difference between each image/band and the corresponding band median and take to power of 2 to make negatives positive and make greater differences weight more
    return diff.reduce('sum').addBands(img);                                                                   // per image in collection, sum the powered difference across the bands - set this as the first band add the SR bands to it - now a 7 band image collection
  });

  // get the medoid by selecting the image pixel with the smallest difference between median and observation per band
  return ee.ImageCollection(difFromMedian).reduce(ee.Reducer.min(7)).select([1,2,3,4,5,6], ['B1','B2','B3','B4','B5','B7']); // find the powered difference that is the least - what image object is the closest to the median of teh collection - and then subset the SR bands and name them - leave behind the powered difference band
};


//------ FUNCTION TO APPLY MEDOID COMPOSITING FUNCTION TO A COLLECTION -------------------------------------------
var buildMosaic = function(year, startDay, endDay, aoi2, dummyCollection) {                                                                      // create a temp variable to hold the upcoming annual mosiac
  var collection = getCombinedSRcollection(year, startDay, endDay, aoi2);  // get the SR collection
  var img = medoidMosaic(collection, dummyCollection)                     // apply the medoidMosaic function to reduce the collection to single image per year by medoid
              .set('system:time_start', (new Date(year,8,1)).valueOf());  // add the year to each medoid image - the data is hard-coded Aug 1st
  return ee.Image(img);                                                   // return as image object
};


//------ FUNCTION TO BUILD ANNUAL MOSAIC COLLECTION ------------------------------
var buildMosaicCollection = function(startYear, endYear, startDay, endDay, aoi2, dummyCollection) {
  var imgs = [];                                                                    // create empty array to fill
  for (var i = startYear; i <= endYear; i++) {                                      // for each year from hard defined start to end build medoid composite and then add to empty img array
    var tmp = buildMosaic(i, startDay, endDay, aoi2, dummyCollection);               // build the medoid mosaic for a given year
    imgs = imgs.concat(tmp.set('system:time_start', (new Date(i,8,1)).valueOf()));  // concatenate the annual image medoid to the collection (img) and set the date of the image - hard coded to the year that is being worked on for Aug 1st
  }
  return ee.ImageCollection(imgs);                                                  // return the array img array as an image collection
};


//########################################################################################################
//##### UNPACKING LT-GEE OUTPUT STRUCTURE FUNCTIONS #####
//########################################################################################################

// ----- FUNCTION TO EXTRACT VERTICES FROM LT RESULTS AND STACK BANDS -----
var getLTvertStack = function(LTresult) {
  var emptyArray = [];                              // make empty array to hold another array whose length will vary depending on maxSegments parameter
  var vertLabels = [];                              // make empty array to hold band names whose length will vary depending on maxSegments parameter
  var iString;                                      // initialize variable to hold vertex number
  for(var i=1;i<=run_params.maxSegments+1;i++){     // loop through the maximum number of vertices in segmentation and fill empty arrays
    iString = i.toString();                         // define vertex number as string
    vertLabels.push("vert_"+iString);               // make a band name for given vertex
    emptyArray.push(0);                             // fill in emptyArray
  }

  var zeros = ee.Image(ee.Array([emptyArray,        // make an image to fill holes in result 'LandTrendr' array where vertices found is not equal to maxSegments parameter plus 1
                                emptyArray,
                                emptyArray]));

  var lbls = [['yrs_','src_','fit_'], vertLabels,]; // labels for 2 dimensions of the array that will be cast to each other in the final step of creating the vertice output

  var vmask = LTresult.arraySlice(0,3,4);           // slices out the 4th row of a 4 row x N col (N = number of years in annual stack) matrix, which identifies vertices - contains only 0s and 1s, where 1 is a vertex (referring to spectral-temporal segmentation) year and 0 is not

  var ltVertStack = LTresult.arrayMask(vmask)       // uses the sliced out isVert row as a mask to only include vertice in this data - after this a pixel will only contain as many "bands" are there are vertices for that pixel - min of 2 to max of 7.
                      .arraySlice(0, 0, 3)          // ...from the vertOnly data subset slice out the vert year row, raw spectral row, and fitted spectral row
                      .addBands(zeros)              // ...adds the 3 row x 7 col 'zeros' matrix as a band to the vertOnly array - this is an intermediate step to the goal of filling in the vertOnly data so that there are 7 vertice slots represented in the data - right now there is a mix of lengths from 2 to 7
                      .toArray(1)                   // ...concatenates the 3 row x 7 col 'zeros' matrix band to the vertOnly data so that there are at least 7 vertice slots represented - in most cases there are now > 7 slots filled but those will be truncated in the next step
                      .arraySlice(1, 0, run_params.maxSegments+1) // ...before this line runs the array has 3 rows and between 9 and 14 cols depending on how many vertices were found during segmentation for a given pixel. this step truncates the cols at 7 (the max verts allowed) so we are left with a 3 row X 7 col array
                      .arrayFlatten(lbls, '');      // ...this takes the 2-d array and makes it 1-d by stacking the unique sets of rows and cols into bands. there will be 7 bands (vertices) for vertYear, followed by 7 bands (vertices) for rawVert, followed by 7 bands (vertices) for fittedVert, according to the 'lbls' list

  return ltVertStack;                               // return the stack
};

//########################################################################################################
//##### BUILD COLLECTION AND RUN LANDTRENDR #####
//########################################################################################################

//----- BUILD LT COLLECTION -----
// build annual surface reflection collection
var annualSRcollection = buildMosaicCollection(startYear, endYear, startDay, endDay, aoi2, dummyCollection); // put together the cloud-free medoid surface reflectance annual time series collection

// apply the function to calculate the segmentation index and adjust the values by the distDir parameter - flip index so that a vegetation loss is associated with a postive delta in spectral value
 annualIndexCollection = annualSRcollection.map(segIndex)                                             // map the function over every image in the collection - returns a 1-band annual image collection of the spectral index
                                              .map(function(img) {return img.multiply(distDir)           // ...multiply the segmentation index by the distDir to ensure that vegetation loss is associated with a positive spectral delta
                                              .set('system:time_start', img.get('system:time_start'))}); // ...set the output system:time_start metadata to the input image time_start otherwise it is null

print(annualIndexCollection,'annualIndexCollection')
//Map.addLayer(annualIndexCollection.select(0),{},'annualIndexCollection1984')
};
NDVICHART();
var NDVIcharts = ui.Chart.image.series(annualIndexCollection, point, ee.Reducer.mean(), 30);
NDVIcharts.setOptions({
  title: 'NDVI',
  vAxis: {title: 'NDVI Values', minValue: -1, maxValue:1 },
  hAxis: {title: 'Years'}

});

panel.add(NDVIcharts);

});

////////////////////////////////////////////////MNDWI CHART//////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function MNDWICHART(){
// // define a geometry - there are lots of ways to do this, see the GEE User guide

// var aoi2 = point; // should be a GEE geometry object - here we are getting it from an drawn polygon


// // define years and dates to include in landsat image collection
// var startYear = 1985;    // what year do you want to start the time series
// var endYear   = 2017;    // what year do you want to end the time series
// var startDay  = '04-01'; // what is the beginning of date filter | month-day
// var endDay    = '09-01'; // what is the end of date filter | month-day


// // define function to calculate a spectral index to segment with LT
// var segIndex = function(img) {
//     var index = img.normalizedDifference(['B5', 'B2'])                      // calculate normalized difference of band 4 and band 7 (B4-B7)/(B4+B7)
//                   .multiply(1)                                          // ...scale results by 1000 so we can convert to int and retain some precision
//                   .select([0], ['MNDWI'])                                    // ...name the band
//                   .set('system:time_start', img.get('system:time_start')); // ...set the output system:time_start metadata to the input image time_start otherwise it is null
//     return index ;
// };

// var distDir = -1; // define the sign of spectral delta for vegetation loss for the segmentation index -
//                   // NBR delta is negetive for vegetation loss, so -1 for NBR, 1 for band 5, -1 for NDVI, etc


// // define the segmentation parameters:
// // reference: Kennedy, R. E., Yang, Z., & Cohen, W. B. (2010). Detecting trends in forest disturbance and recovery using yearly Landsat time series: 1. LandTrendr�Temporal segmentation algorithms. Remote Sensing of Environment, 114(12), 2897-2910.
// //            https://github.com/eMapR/LT-GEE

// //########################################################################################################
// //########################################################################################################
// //##### ANNUAL SR TIME SERIES COLLECTION BUILDING FUNCTIONS #####
// //########################################################################################################

// //----- MAKE A DUMMY COLLECTOIN FOR FILLTING MISSING YEARS -----
// var dummyCollection = ee.ImageCollection([ee.Image([0,0,0,0,0,0]).mask(ee.Image(0))]); // make an image collection from an image with 6 bands all set to 0 and then make them masked values


// //------ L8 to L7 HARMONIZATION FUNCTION -----
// // slope and intercept citation: Roy, D.P., Kovalskyy, V., Zhang, H.K., Vermote, E.F., Yan, L., Kumar, S.S, Egorov, A., 2016, Characterization of Landsat-7 to Landsat-8 reflective wavelength and normalized difference vegetation index continuity, Remote Sensing of Environment, 185, 57-70.(http://dx.doi.org/10.1016/j.rse.2015.12.024); Table 2 - reduced major axis (RMA) regression coefficients
// var harmonizationRoy = function(oli) {
//   var slopes = ee.Image.constant([0.9785, 0.9542, 0.9825, 1.0073, 1.0171, 0.9949]);        // create an image of slopes per band for L8 TO L7 regression line - David Roy
//   var itcp = ee.Image.constant([-0.0095, -0.0016, -0.0022, -0.0021, -0.0030, 0.0029]);     // create an image of y-intercepts per band for L8 TO L7 regression line - David Roy
//   var y = oli.select(['B2','B3','B4','B5','B6','B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']) // select OLI bands 2-7 and rename them to match L7 band names
//             .resample('bicubic')                                                          // ...resample the L8 bands using bicubic
//             .subtract(itcp.multiply(10000)).divide(slopes)                                // ...multiply the y-intercept bands by 10000 to match the scale of the L7 bands then apply the line equation - subtract the intercept and divide by the slope
//             .set('system:time_start', oli.get('system:time_start'));                      // ...set the output system:time_start metadata to the input image time_start otherwise it is null
//   return y.toShort();                                                                       // return the image as short to match the type of the other data
// };


// //------ RETRIEVE A SENSOR SR COLLECTION FUNCTION -----
// var getSRcollection = function(year, startDay, endDay, sensor, aoi2) {
//   // get a landsat collection for given year, day range, and sensor
//   var srCollection = ee.ImageCollection('LANDSAT/'+ sensor + '/C01/T1_SR') // get surface reflectance images
//                       .filterBounds(aoi2)                                  // ...filter them by intersection with AOI
//                       .filterDate(year+'-'+startDay, year+'-'+endDay);    // ...filter them by year and day range

//   // apply the harmonization function to LC08 (if LC08), subset bands, unmask, and resample
//   srCollection = srCollection.map(function(img) {
//     var dat = ee.Image(
//       ee.Algorithms.If(
//         sensor == 'LC08',                                                  // condition - if image is OLI
//         harmonizationRoy(img.unmask()),                                    // true - then apply the L8 TO L7 alignment function after unmasking pixels that were previosuly masked (why/when are pixels masked)
//         img.select(['B1', 'B2', 'B3', 'B4', 'B5', 'B7'])                   // false - else select out the reflectance bands from the non-OLI image
//           .unmask()                                                       // ...unmask any previously masked pixels
//           .resample('bicubic')                                            // ...resample by bicubic
//           .set('system:time_start', img.get('system:time_start'))         // ...set the output system:time_start metadata to the input image time_start otherwise it is null
//       )
//     );

//     // make a cloud, cloud shadow, and snow mask from fmask band
//     var qa = img.select('pixel_qa');                                       // select out the fmask band
//     var mask = qa.bitwiseAnd(8).eq(0).and(                                 // include shadow
//               qa.bitwiseAnd(16).eq(0)).and(                               // include snow
//               qa.bitwiseAnd(32).eq(0));                                   // include clouds

//     // apply the mask to the image and return it
//     return dat.mask(mask); //apply the mask - 0's in mask will be excluded from computation and set to opacity=0 in display
//   });

//   return srCollection; // return the prepared collection
// };


// //------ FUNCTION TO COMBINE LT05, LE07, & LC08 COLLECTIONS -----
// var getCombinedSRcollection = function(year, startDay, endDay, aoi2) {
//     var lt5 = getSRcollection(year, startDay, endDay, 'LT05', aoi2);       // get TM collection for a given year, date range, and area
//     var le7 = getSRcollection(year, startDay, endDay, 'LE07', aoi2);       // get ETM+ collection for a given year, date range, and area
//     var lc8 = getSRcollection(year, startDay, endDay, 'LC08', aoi2);       // get OLI collection for a given year, date range, and area
//     var mergedCollection = ee.ImageCollection(lt5.merge(le7).merge(lc8)); // merge the individual sensor collections into one imageCollection object
//     return mergedCollection;                                              // return the Imagecollection
// };


// //------ FUNCTION TO REDUCE COLLECTION TO SINGLE IMAGE PER YEAR BY MEDOID -----
// /*
//   LT expects only a single image per year in a time series, there are lost of ways to
//   do best available pixel compositing - we have found that a mediod composite requires little logic
//   is robust, and fast

//   Medoids are representative objects of a data set or a cluster with a data set whose average
//   dissimilarity to all the objects in the cluster is minimal. Medoids are similar in concept to
//   means or centroids, but medoids are always members of the data set.
// */

// // make a medoid composite with equal weight among indices
// var medoidMosaic = function(inCollection, dummyCollection) {

//   // fill in missing years with the dummy collection
//   var imageCount = inCollection.toList(1).length();                                                            // get the number of images
//   var finalCollection = ee.ImageCollection(ee.Algorithms.If(imageCount.gt(0), inCollection, dummyCollection)); // if the number of images in this year is 0, then use the dummy collection, otherwise use the SR collection

//   // calculate median across images in collection per band
//   var median = finalCollection.max();                                                                       // calculate the median of the annual image collection - returns a single 6 band image - the collection median per band

//   // calculate the different between the median and the observation per image per band
//   var difFromMedian = finalCollection.map(function(img) {
//     var diff = ee.Image(img).subtract(median).pow(ee.Image.constant(2));                                       // get the difference between each image/band and the corresponding band median and take to power of 2 to make negatives positive and make greater differences weight more
//     return diff.reduce('sum').addBands(img);                                                                   // per image in collection, sum the powered difference across the bands - set this as the first band add the SR bands to it - now a 7 band image collection
//   });

//   // get the medoid by selecting the image pixel with the smallest difference between median and observation per band
//   return ee.ImageCollection(difFromMedian).reduce(ee.Reducer.min(7)).select([1,2,3,4,5,6], ['B1','B2','B3','B4','B5','B7']); // find the powered difference that is the least - what image object is the closest to the median of teh collection - and then subset the SR bands and name them - leave behind the powered difference band
// };


// //------ FUNCTION TO APPLY MEDOID COMPOSITING FUNCTION TO A COLLECTION -------------------------------------------
// var buildMosaic = function(year, startDay, endDay, aoi2, dummyCollection) {                                                                      // create a temp variable to hold the upcoming annual mosiac
//   var collection = getCombinedSRcollection(year, startDay, endDay, aoi2);  // get the SR collection
//   var img = medoidMosaic(collection, dummyCollection)                     // apply the medoidMosaic function to reduce the collection to single image per year by medoid
//               .set('system:time_start', (new Date(year,8,1)).valueOf());  // add the year to each medoid image - the data is hard-coded Aug 1st
//   return ee.Image(img);                                                   // return as image object
// };


// //------ FUNCTION TO BUILD ANNUAL MOSAIC COLLECTION ------------------------------
// var buildMosaicCollection = function(startYear, endYear, startDay, endDay, aoi2, dummyCollection) {
//   var imgs = [];                                                                    // create empty array to fill
//   for (var i = startYear; i <= endYear; i++) {                                      // for each year from hard defined start to end build medoid composite and then add to empty img array
//     var tmp = buildMosaic(i, startDay, endDay, aoi2, dummyCollection);               // build the medoid mosaic for a given year
//     imgs = imgs.concat(tmp.set('system:time_start', (new Date(i,8,1)).valueOf()));  // concatenate the annual image medoid to the collection (img) and set the date of the image - hard coded to the year that is being worked on for Aug 1st
//   }
//   return ee.ImageCollection(imgs);                                                  // return the array img array as an image collection
// };


// //########################################################################################################
// //##### UNPACKING LT-GEE OUTPUT STRUCTURE FUNCTIONS #####
// //########################################################################################################

// // ----- FUNCTION TO EXTRACT VERTICES FROM LT RESULTS AND STACK BANDS -----
// var getLTvertStack = function(LTresult) {
//   var emptyArray = [];                              // make empty array to hold another array whose length will vary depending on maxSegments parameter
//   var vertLabels = [];                              // make empty array to hold band names whose length will vary depending on maxSegments parameter
//   var iString;                                      // initialize variable to hold vertex number
//   for(var i=1;i<=run_params.maxSegments+1;i++){     // loop through the maximum number of vertices in segmentation and fill empty arrays
//     iString = i.toString();                         // define vertex number as string
//     vertLabels.push("vert_"+iString);               // make a band name for given vertex
//     emptyArray.push(0);                             // fill in emptyArray
//   }

//   var zeros = ee.Image(ee.Array([emptyArray,        // make an image to fill holes in result 'LandTrendr' array where vertices found is not equal to maxSegments parameter plus 1
//                                 emptyArray,
//                                 emptyArray]));

//   var lbls = [['yrs_','src_','fit_'], vertLabels,]; // labels for 2 dimensions of the array that will be cast to each other in the final step of creating the vertice output

//   var vmask = LTresult.arraySlice(0,3,4);           // slices out the 4th row of a 4 row x N col (N = number of years in annual stack) matrix, which identifies vertices - contains only 0s and 1s, where 1 is a vertex (referring to spectral-temporal segmentation) year and 0 is not

//   var ltVertStack = LTresult.arrayMask(vmask)       // uses the sliced out isVert row as a mask to only include vertice in this data - after this a pixel will only contain as many "bands" are there are vertices for that pixel - min of 2 to max of 7.
//                       .arraySlice(0, 0, 3)          // ...from the vertOnly data subset slice out the vert year row, raw spectral row, and fitted spectral row
//                       .addBands(zeros)              // ...adds the 3 row x 7 col 'zeros' matrix as a band to the vertOnly array - this is an intermediate step to the goal of filling in the vertOnly data so that there are 7 vertice slots represented in the data - right now there is a mix of lengths from 2 to 7
//                       .toArray(1)                   // ...concatenates the 3 row x 7 col 'zeros' matrix band to the vertOnly data so that there are at least 7 vertice slots represented - in most cases there are now > 7 slots filled but those will be truncated in the next step
//                       .arraySlice(1, 0, run_params.maxSegments+1) // ...before this line runs the array has 3 rows and between 9 and 14 cols depending on how many vertices were found during segmentation for a given pixel. this step truncates the cols at 7 (the max verts allowed) so we are left with a 3 row X 7 col array
//                       .arrayFlatten(lbls, '');      // ...this takes the 2-d array and makes it 1-d by stacking the unique sets of rows and cols into bands. there will be 7 bands (vertices) for vertYear, followed by 7 bands (vertices) for rawVert, followed by 7 bands (vertices) for fittedVert, according to the 'lbls' list

//   return ltVertStack;                               // return the stack
// };

// //########################################################################################################
// //##### BUILD COLLECTION AND RUN LANDTRENDR #####
// //########################################################################################################

// //----- BUILD LT COLLECTION -----
// // build annual surface reflection collection
// var annualSRcollection = buildMosaicCollection(startYear, endYear, startDay, endDay, aoi2, dummyCollection); // put together the cloud-free medoid surface reflectance annual time series collection

// // apply the function to calculate the segmentation index and adjust the values by the distDir parameter - flip index so that a vegetation loss is associated with a postive delta in spectral value
// annualIndexCollection2 = annualSRcollection.map(segIndex)                                             // map the function over every image in the collection - returns a 1-band annual image collection of the spectral index
//                                               .map(function(img) {return img.multiply(distDir)           // ...multiply the segmentation index by the distDir to ensure that vegetation loss is associated with a positive spectral delta
//                                               .set('system:time_start', img.get('system:time_start'))}); // ...set the output system:time_start metadata to the input image time_start otherwise it is null

// print(annualIndexCollection2,'annualIndexCollection2')
// //Map.addLayer(annualIndexCollection.select(0),{},'annualIndexCollection1984')
// }
// MNDWICHART();



// var MNDWIcharts = ui.Chart.image.series(annualIndexCollection2, point, ee.Reducer.mean(), 30);
// MNDWIcharts.setOptions({
//   title: 'MNDWI',
//   vAxis: {title: 'MNDWI Values', minValue: -1, maxValue:1,  palette: '2ddc0d' },
//   hAxis: {title: 'Years'},
// })


//panel.add(MNDWIcharts);
