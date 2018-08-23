RMET
V1 Code created: 08/06/18


River Morphology Evaluation Toolbox - RMET - is a tool developed in Google Earth Engine for the Green River corridor which flows from the Flaming Gorge Dam into the Colorado River in the southern reaches of Canyonlands National Park. The study area also includes the Yampa River in Dinosaur National Monument until its confluence with the Green River, the confluence of the White River with the Green River, and the Colorado River in Canyonlands National Park. It creates both a binary landcover class map using a user chosen spectral index and threshold, as well as a spectral change trend map. This can be done with both 30 m Landsat data which has a better temporal resolution, and 10m Sentinel-2 which has a better spatial resolution. The user can also produce NDVI graphs which view the values across the 33 year Landsat time span for a particular pixel by clicking on the layer.  

RMET was developed over one term with NASA DEVELOP:
* Authors v1.0: Margaret Mulhern, Kristen Dennis, Nathaniel Penrod, and Daniel Carver 

Running RMET
Hit the “run” button in the center panel to make the widget appear. 


Using RMET
The user can do the following things:


* Area of interest: Choose from the entire Project Study Area, Canyonlands National Park, Dinosaur National Monument, Colorado River, Green River, White River, Yampa River, or choose Your asset to perform the analysis on an asset you load yourself see Loading an Asset for instructions on loading your own asset (below). The default is Project Study Area.
* Binary Map year: The year must be in YYYY format. It is the year you would like vegetation and water land cover classification for. The default is 2018. 
* Binary Map Threshold: Allows user to change thresholding value by moving the slider. Default is suggestion by team based on validation processes.
* Add Bivariate map: Performs the Binary map analysis on the spectral index and area of interest and adds that layer to the map with the ‘0’ values masked.
*Change Map years: The years must be in YYYY format. The first box is the start year and is defaulted to 1985. The second box is the end year and is defaulted to 2018.
* Add Change Maps: There are four trend options to map using both the NDVI and MNDWI Spectral Indices. The More Green Trend Map isolates areas where NDVI values increased from the start year to the end year. Conversely, the Less Green Trend Map isolates areas where NDVI values decreased between the years. Similarly, the More Wet Trend Map isolates areas where MNDWI values increased from the start year to the end year, whereas the Less Wet Trend Map isolates areas where MNDWI values decreased between the years. Adds that layer, along with NDVI/MNDWI layers for the Start and End years.
* Reset Map: Clears all layers. Note: it does not reset the area of interest or any items in the widget. To reset the area of interest, choose a different area of interest from the dropdown before running a new analysis. 
* Change Inspector: Click on any pixel of the change map layers and a graph of the NDVI change from 1984 - 2018 for that particular point will appear at the bottom of the widget. Click the little box with the arrow in the upper right hand corner of the graph to open the graph in a new tab. You can download this graph from this new tab. 



Loading an Asset
RMET 1.0 allows the user to input their own assets to run analyses on. To load an asset, click on the "Assets" tab in the upper left hand box of Google Earth Engine, then click the red "new" button. Select "table upload", then double click the red "select" button and find your shapefile on your local computer. Be sure to select all of the shapefile files (you can complete this by holding the ctrl button while you select them), then click “ok.” If you look in the upper right hand box, the tasks tab should be highlighted. Your asset is now being uploaded, do not close your browser until it is complete. After a few minutes (between 5-20 depending on the asset) your asset should show up in the left hand box. You should click the share button and make it "Anyone can read". You can now input this asset in the text boxes provided in the widget. The asset structure is users/*YOUR USER NAME HERE*/*YOUR ASSET NAME HERE*. Years need to be in YYYY format. The filter works by looking for a range of numbers. 



Dictionary Upkeep
RMET is currently operational for years 1984-2018 for Landsat 30 meter resolution imagery and for years 2016-2018 for Sentinel-2 10 meter resolution imagery. To update the program each year:
* In line 129, update the variable currentyr to equal the current year
 		currentyr = 2018
* update 2018 in line 608, 662, 666, 670, 791, 811, 815, 821, 866 to current year


Contact
If you have questions please contact Kristen Dennis at dennisk.kristen@gmail.com or develop.geoinformatics@gmail.com