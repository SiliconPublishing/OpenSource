//ReplaceTextWithGraphic.jsx
//An InDesign JavaScript
//
//Replaces each instance of a string with a specified graphic file. The string has the pattern:
//<graphic:file_name>
//Where "file_name" is the full path to the graphic you want to place, in URI notation, for example:
//<graphic:/c/test/image.jpg>
//
//by Olav Martin Kvern
//Distributed by Silicon Publishing, Inc., for PEPCON, San Francisco, 2012.
//
//Our web site says, "Silicon Publishing, Inc. provides electronic publishing solutions and customizations 
//that automate the distribution of information between multiple sources and destinations." But what does
//that really mean? We make custom software for publishing. Some of it is for intense, data-driven, high-
//volume applications--think: directories, catalogs, and customized itineraries. Some of it is for web-to-print 
//or print-to-web applications--think: business cards, flyers, brochures, data sheets. Some of it is none of the 
//above. Use your imagination--if there's some chance that we can make your work easier, drop us a line! 
//sales@siliconpublishing.com
//
#target indesign
main();
function main(){
	if(app.documents.length > 0){
		if(app.documents.item(0).stories.length > 0){
			var story = document.stories.item(0);
			replaceTextWithGraphic();
		}
	}	
}
function replaceTextWithGraphic(){
	//<fragment>
	var inlineGraphic, x1, y1, x2, y2, foundItem;
	var regExp = "(?i)<graphic\\:\\s?(.*)\\s?>"
	var document = app.documents.item(0);
	document.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
	document.viewPreferences.verticalMeasurementUnits = MeasurementUnits.POINTS;
	//Clear the grep find/change preferences.
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	app.findGrepPreferences.findWhat = regExp;
	//Search the document.
	var foundItems = document.findGrep(true);
	//Clear the find/change preferences after the search.
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	if(foundItems.length != 0){
		for(var counter = 0; counter < foundItems.length; counter ++){
			//A potential problem comes up here: what if the graphic is too big 
			//to fit on the page? What if the text is overset? There are no 
			//foolproof solutions that can handle all of the possible problems 
			//that can arise; your best bet is to adjust your scripts to deal
			//with the specific layouts of specific documents rather than to try to
			//create a single function that can handle all situations for all
			//possible documents.
			//
			//In this case, we simply make the frame a set size and place the graphic
			//into the frame, then fit the graphic to the frame proportionally, and
			//then fit the frame to the resized graphic.
			foundItem = foundItems[counter];
			x1 = foundItem.characters.item(0).horizontalOffset;
			y1 = foundItem.characters.item(0).baseline;
			x2 = x1 + 72;
			y2 = y1 + 72;
			fileName = foundItem.contents.replace(/<graphic:(.+?)>/i, "$1");
			frame = foundItem.insertionPoints.item(0).rectangles.add();
			//Recompose the text after adding the inline frame.
			foundItem.parent.recompose();
			frame.geometricBounds = [y1, x1, y2, x2];
			try{
				inlineGraphic = frame.place(File(fileName))[0];
				frame.fit(FitOptions.proportionally);
				frame.fit(FitOptions.frameToContent);
			} catch(error){}
		}
	}
	//Now replace the tags.
	app.findGrepPreferences.findWhat = regExp;
	app.changeGrepPreferences.changeTo = "";
	document.changeGrep();
	//Clear the find/change preferences after the search.
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
}