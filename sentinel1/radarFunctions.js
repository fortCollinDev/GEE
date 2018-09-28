/*
9/28/2018
carver.dan1@gmail

The script contained the content for working with Sentinal 1 data in GEE
Specific this was created to summarize the work done on the Spring 2018 DEVELOP
project on wild rice
*/

// function for reducing the edge effects associated with the ovelaping regions
// of imager
function maskEdge(img) {
  var mask = img.select(0)
  .unitScale(-25, 5)
  .multiply(255)
  .toByte()
  .connectedComponents(ee.Kernel.rectangle(1,1), 100);
  return img.updateMask(mask.select(0));
}


// Pull in Sentinel 1 data, at VV polarization. (most powerful return)
// need to define geometry
var sentinel1_clip = ee.ImageCollection('COPERNICUS/S1_GRD')
.filterBounds(geometry)
.filterDate('2015-04-01','2015-10-31')
.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV')) //stick with VV polarization
.select('VV')

// apply masking function and variance reducer
// apply the mask edge fucntion and clip the layer to the study area
var radarVariance = sentinel1_clip
.map(maskEdge)
.clip(geometry)
// visual the featute
Map.addLayer(radarVariance.clip(geometry),
{min: -50, max: 70}, "senVV_2015_maskedge");


//Filters based on capture mode and orbital properties
var sentinel1_vv_iw = sentinel1_clip
.filter(ee.Filter.eq('instrumentMode', 'IW'))
.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));


// generate a histogram of values
// Make the histogram, set the options.
var histogramVH = ui.Chart.image.histogram(sentinel1_vv_iw, geomentry, 30)
    .setSeriesNames(['blue'])
    .setOptions(options);
// Display the histogram.
print(histogramVH);

// generate binary values based on a given threshold
var var30 = radarVariance.expression(
  " band >= 30" , {
      'band': radarVariance.select('VV_variance')
})
// visual results
Map.addLayer(var30,
{min:0, max:1}, "var30",false);

// export feature
// Export the image, specifying scale and region.
Export.image.toDrive({
  image: var30,
  description: 'RadarVariance',
  scale: 30,
  maxPixels: 595777842,
  region: geometry
});
