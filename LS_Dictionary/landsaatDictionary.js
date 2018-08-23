
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
  var y_list = ee.List.sequence(2013, 2018)
  var ystr_list = y_list.map(function(y){return ee.Number(y).format('%1d')})
  var ls8 = y_list.map(function(y){return ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                                          .filterDate(ee.String(ee.Number(y).format('%1d')).cat(startMonth),
                                                      ee.String(ee.Number(y).format('%1d')).cat(endMonth))
                                          .filterBounds(geometry)
                                          .median()})
  var ls8_dict = ee.Dictionary.fromLists(ystr_list, ls8);

  // construct a disctionary for LS7
  var y_list7 = ee.List.sequence(2012, 2012)
  var ystr_list7 = y_list7.map(function(y){return ee.Number(y).format('%1d')})
  var ls7 = y_list7.map(function(y){return ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
                                          .filterDate(ee.String(ee.Number(y).format('%1d')).cat(startMonth),
                                                      ee.String(ee.Number(y).format('%1d')).cat(endMonth))
                                          .filterBounds(geometry)
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
                                          .median()})
  var ls5_dict = ee.Dictionary.fromLists(ystr_list5, ls5);
  // combine the dictionary
  var LS_Dict = ls8_ls7_dict.combine(ls5_dict)

  return(LS_Dict)}


var dict_ls = constructLSDict(geometry)
print(dict_ls, 'dictLS')

/*
You can write functions to compute indicies and added them to the image as bands
*/

// // A function to compute NDVI for Landsat 8.
// var NDVI8 = function(image) {
//   return image.normalizedDifference(["B5","B4"]).rename("NDVI");
// };


//Function for selection year and adding bands
var selectYearAddBands = function(dictionary, year, geometry)
  /*
  This function takes in a dictionary and a user inputed value from
  the gui. From this it pulls a year from the dictionary, calcualted
  indicies, and adds though indices to the image. The final image is
  returned.
  */
  {
  var imageYear = ee.Image(dictionary.get(year)).clip(geometry)
  var outImage = imageYear//.addBands(NDVI8(imageYear))
  return (outImage)
}

var singleImage = selectYearAddBands(dict_ls, "2015", geometry)
print(singleImage, 'singleImage')
