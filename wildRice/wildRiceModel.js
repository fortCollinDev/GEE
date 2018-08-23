//////////////////////////////////////////Indices Naming Conventions//////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Index name, Year (if applicable; Radar is only for 2015), Time period.
// IndexYear_Tx
// 3 time periods designated with T1, T2, and T3.

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////                      Radar                     //////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
function maskEdge(img) {
  var mask = img.select(0).unitScale(-25, 5).multiply(255).toByte().connectedComponents(ee.Kernel.rectangle(1,1), 100);
  return img.updateMask(mask.select(0));
}


// filter the sentinel1 data to the minnisota Polygon
var sentinel1_clip = ee.ImageCollection('COPERNICUS/S1_GRD')
.filterBounds(roi)
.filterDate('2015-04-01','2015-11-30')
.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV')) //stick with VV polarization
.select('VV')

print(sentinel1_clip) // determine the number of images within the collection
//subset a series of images from 3 date ranges to use as predictors

////////////////////////////////////////////////
/////////////Radar Time 1 (T1)//////////////////
///////////////////////////////////////////////
var Radar_T1 = sentinel1_clip
.filterDate('2015-06-01', '2015-08-21')
print(Radar_T1,'T1') //determine the number of predictors prsent


Map.addLayer(Radar_T1, //add the layer as a median, I not sure if we want to use
{min: -50, max: 70}, "senVV_2015",false);

var radarVariance_T1 = Radar_T1
.map(maskEdge)
.reduce(ee.Reducer.sampleVariance()).rename('VV_variance_T1')

print(radarVariance_T1,'radarVariance_T1')
Map.addLayer(radarVariance_T1.clip(roi),
{min: -50, max: 70}, "senVV_2015_maskedge1",false);
print(radarVariance_T1);


/////////////////////////////////////////////////////
///////////  Radar T2  //////////////////////////////
////////////////////////////////////////////////////
var Radar_T2 = sentinel1_clip
.filterDate('2015-08-01', '2015-10-31')
print(Radar_T2,'T2')//determine the number of predictors prsent

Map.addLayer(Radar_T2, //add the layer as a median, I not sure if we want to use
{min: -50, max: 70}, "senVV_2015",false);

var radarVariance_T2 = Radar_T2
.map(maskEdge)
.reduce(ee.Reducer.sampleVariance()).rename('VV_variance_T2')
Map.addLayer(radarVariance_T2.clip(roi),
{min: -50, max: 70}, "senVV_2015_maskedge2",false);


var Radar_full = sentinel1_clip
    .filterDate('2015-06-01', '2015-10-31')

var radarVariance_all = Radar_full
.map(maskEdge)
.reduce(ee.Reducer.sampleVariance()).rename('VV_variance_all')
Map.addLayer(radarVariance_all,
{min: -50, max: 70}, "senVV_2015_maskedge3",false);

print(radarVariance_all,'radar_all')
////////////////////////////////////////////////////////////////////////////////////
///////////         Radar I1                   ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
var Radar_I1 = sentinel1_clip
.filterDate('2015-06-01', '2015-08-21').mosaic().clip(roi).rename('radar_June_Aug');
print(Radar_I1,'I1');//determine the number of predictors prsent

Map.addLayer(Radar_I1,{},'I1',false);


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////                      NDVI    2015             //////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////
////////////// NDVI  2015 T3 /////////
/////////////////////////////////////
var composite8_T3 = ee.ImageCollection(surface8).filterBounds(roi)
  .filterDate('2015-08-21', '2015-11-10')
  .filterMetadata('CLOUD_COVER', 'less_than', 25).median();

var ndvi15_T3 = composite8_T3.select('B5').subtract(composite8_T3.select('B4'))
            .divide(composite8_T3.select('B5').add(composite8_T3.select('B4'))).clip(roi);

var ndvi_15_T3 = ndvi15_T3.select('B5').rename('ndvi_15_T3');
Map.addLayer(ndvi_15_T3, {},'NDVI_15_T3',false);



// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////               Tasseled Cap Landsat 8                ///////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////
//////////////  TCAP 2015 T3 /////////
/////////////////////////////////////
var LS8TOAraw_T3 = ee.ImageCollection(surface8)
  .filterDate('2015-08-21', '2015-11-10').filterBounds(roi)
  .filterMetadata('CLOUD_COVER', 'less_than', 25);

var LS8TOA_T3 = LS8TOAraw_T3.reduce(ee.Reducer.median()); //takes median of image collection

var TCW_15_T3 = LS8TOA_T3.expression(
  "0.1511 * B2 + 0.1973 * B3 + 0.3283 * B4 + 0.3407 * B5 - 0.7117 * B6 - 0.4559 * B7" , {
  'B2': LS8TOA_T3.select('B2_median'),
  'B3': LS8TOA_T3.select('B3_median'),
  'B4': LS8TOA_T3.select('B4_median'),
  'B5': LS8TOA_T3.select('B5_median'),
  'B6': LS8TOA_T3.select('B6_median'),
  'B7': LS8TOA_T3.select('B7_median')
  }).rename("TCW2015_T3").clip(roi);


  // print(TCW_15_T3, 'TCW_15_T3');
  Map.addLayer(TCW_15_T3, {}, "Tcap wetness_15_T3",false);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////           Reflectance and Thermal     2015                /////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
var bands = ['B1_median', 'B2_median', 'B3_median', 'B4_median',
            'B5_median', 'B6_median', 'B7_median', 'B10_median', 'B11_median']

var BLUE8 = ['B2_median']
var GREEN8 = ['B3_median']
var ULTRA_BLUE8 = ['B1_median']
var RED8 = ['B4_median']
var NIR8 = ['B5_median']
var SWIR1_8 = ['B6_median']
var SWIR2_8 = ['B7_median']
var PAN8 = ['B8_median']
var CIRRUS8 = ['B9_median']


///////////////////////////////////////
////////////// Bands 2015 T1 /////////
/////////////////////////////////////
var ref8_T1 = ee.ImageCollection(surface8).filterDate('2015-06-01', '2015-08-21')
.filterBounds(roi).filterMetadata('CLOUD_COVER', 'less_than', 20);
var T8_T1 = ref8_T1.reduce(ee.Reducer.median()).clip(roi);

print(T8_T1,'T8_T1')

var swir1_15_T1 = T8_T1.select(SWIR1_8).rename("swir1_15_T1")


///////////////////////////////////////
////////////// Bands 2015 T2 /////////
/////////////////////////////////////
var ref8_T2 = ee.ImageCollection(surface8).filterDate('2015-07-20', '2015-09-22')
.filterBounds(roi).filterMetadata('CLOUD_COVER', 'less_than', 20);
var T8_T2 = ref8_T2.reduce(ee.Reducer.median()).clip(roi);

print(T8_T2,'T8_T2')

var t10_15_T2 = T8_T2.select('B10_median').rename('t10_15_T2');
var t11_15_T2 = T8_T2.select('B11_median').rename('t11_15_T2');
print(t10_15_T2,'t10_15_T2')
print(t11_15_T2,'t11_15_T2')

var red_15_T2 = T8_T2.select(RED8).rename("red_15_T2")
var green_15_T2 = T8_T2.select(GREEN8).rename("green_15_T2")
var blue_15_T2 = T8_T2.select(BLUE8).rename("blue_15_T2")
var nir_15_T2 = T8_T2.select(NIR8).rename("nir_15_T2")
var swir1_15_T2 = T8_T2.select(SWIR1_8).rename("swir1_15_T2")
var swir2_15_T2 = T8_T2.select(SWIR2_8).rename("swir2_15_T2")



///////////////////////////////////////
////////////// Bands 2015 T3 /////////
/////////////////////////////////////
var ref8_T3 = ee.ImageCollection(surface8).filterDate('2015-08-21', '2015-11-10')
.filterBounds(roi).filterMetadata('CLOUD_COVER', 'less_than', 25);
var T8_T3 = ref8_T3.reduce(ee.Reducer.median()).clip(roi);
print(T8_T3,'T8_T3')

var nir_15_T3 = T8_T3.select(NIR8).rename("nir_15_T3");
var green_15_T3 = T8_T3.select(GREEN8).rename("green_15_T3");


////////////////////////////////////////////////////////
//////////      MNDWI     2015    T2          /////////
//////////////////////////////////////////////////////

var mndwi_15_T2 = green_15_T2.expression(
  '(green - nir)/(green + nir)', {
      'green': green_15_T2.select('green_15_T2'),
      'nir': nir_15_T2.select('nir_15_T2')
    }).rename("mndwi_15_T2");

Map.addLayer(mndwi_15_T2, {},'mndwi_15_T2',false);




/////////////////////////////////////////////////////////////////////////




/////////////Spectral Predictors/////////////////
var all_predictors = nir_15_T3
                            .addBands(ndvi_15_T3)
                            .addBands(mndwi_15_T2)
                            .addBands(TCW_15_T3)
                            .addBands(green_15_T3)
                            .addBands(swir1_15_T1)
                            .addBands(Radar_I1);



print('all_predictors: ', all_predictors);


var PA = ee.FeatureCollection('ft:18oC4SmWXZOy6bsafClcyiOL1FWuEB92crsnxE39D');
print(PA,'PA');
Map.addLayer(PA,{},'PA');


////// create classes tree live, treedead...etc
var classes = [
  {'yes':0, 'description':'absence'},
  {'live70':1,'description':'presence'},
];

var newfc2 = PA.randomColumn('random', 2);

// //// **** CHANGE "properties" (ex. 'treelive', 'random') to sample by your response variable column in fusion table
// ////repeat this change where 'treedead' exists in the code
print(newfc2,'newfc2');

var samples15 = all_predictors.sampleRegions({
  collection: newfc2,
  properties: ['yes','random'],
  scale:30 });
print(samples15,'samples15');

// //// **** CHANGE "properties" (ex. 'PA15', 'x_coord') to sample by your response variable column in fusion table
// ////repeat this change where 'treedead' exists in the code

// var samples15 = all_predictors.sampleRegions({
//   collection: PA,
//   properties: ['PA15','yes'],
//   scale: 30 });
// print(samples15,'samples15');



///////////////                       RANDOM FOREST                     //////////////////////


////Split "samples" into training and testing points (70% for training and 30% for testing)
var training = samples15.filterMetadata('random', 'less_than', 0.8);
print(training,'training')
var testing = samples15.filterMetadata('random', 'not_less_than', 0.2);
//////////Train Random Forest Model
var trainingclassifier = ee.Classifier.randomForest({
                  numberOfTrees: 10,
                  variablesPerSplit: 0,
                  minLeafPopulation: 1 ,
                  bagFraction: 0.5 ,
                  outOfBagMode: false ,
                  seed:7 }).train({
features: training,
classProperty: 'yes'});

var classified = all_predictors.classify(trainingclassifier).clip(roi);

print(classified);

Map.addLayer(classified, {min:0, max:2, palette:['yellow', 'green', 'blue']}, 'classified', false);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////              Confusion Matrix from Model            ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

var trainAccuracy = trainingclassifier.confusionMatrix();
print('Training error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());
// print(testing,'testing')
// print(training, 'training')


var validation = testing.classify(trainingclassifier);
Map.addLayer(validation, {min:0, max:2, palette:['yellow', 'green']}, 'validation', false);

var errorMatrix = validation.errorMatrix('yes', 'classification');
//print('Error Matrix:', errorMatrix);
print('Overall Accuracy:', errorMatrix.accuracy());
print('Kappa Coefficient: ', errorMatrix.kappa());

var var30 = radarVariance_all.expression(
  " band >= 30" , {
      'band': radarVariance_all.select('VV_variance_all')
})

print(var30,'var30')

Map.addLayer(var30,
{min:0, max:1}, "var30",false);

var FFF = function(image) {
var mask = var30.select(['VV_variance_all']).neq(0)
 return image.updateMask(mask);
}

 var image = ee.ImageCollection(classified)
       .map(FFF);

    print(image)

Map.addLayer(image,{min:0, max:2, palette:['green']},'image')

var why = ee.Image(image)


// Export.image.toDrive({
//   image: classified,
//   description: 'PA_2015_radar_full_MN',
//   scale: 30,
//   maxPixels:3319615046400,
//   region: geometry

// });

Export.image.toDrive({
  image: why,
  description: 'top_ricemodel_radarmask_output',
  scale: 30,
  maxPixels:3319615046400,
  region: geometry

});
