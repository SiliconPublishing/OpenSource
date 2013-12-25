//MakeStackedSWF.jsx
//
//Places every page of an InDesign file into a multi-state object, which you can then export as a SWF
//with navigational buttons.
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
#target 'indesign'
main();	
function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	//Display a standard Open File dialog box.
	var idFile = File.openDialog("Choose an InDesign File");
	if((idFile != "")&&(idFile != null)){
		var document = app.documents.add();
		placeInDesignFile(document, idFile);
	}
}
//Places each page of the source InDesign document in a state in a multi-state object.
function placeInDesignFile(document, idFile){
	var counter, file;
	var state, rectangle;
	var page = document.pages.item(0);
	adjustPageSize(page, idFile);
	var topLeft = page.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.PASTEBOARD_COORDINATES);
	var bottomRight = page.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.PASTEBOARD_COORDINATES);
	var multiStateObject = document.pages.item(0).multiStateObjects.add();
	topLeft = topLeft[0];
	bottomRight = bottomRight[0];
	multiStateObject.reframe(CoordinateSpaces.PASTEBOARD_COORDINATES, [topLeft, bottomRight]);
	counter = 0;
	var done = false;
	while(done == false){
		if(counter > 1){
			state = multiStateObject.states.add();
			//$.writeln("new state contains: " + state.pageItems.length + " page items");
		}
		state = multiStateObject.states.item(counter);
		state.name = "Page " + counter + 1;
		rectangle = state.rectangles.add({geometricBounds:multiStateObject.geometricBounds, strokeWeight:0});
		rectangle.fillColor = document.swatches.item("Paper");
		//$.writeln("state now contains: " + state.pageItems.length + " page items");
		if(state.pageItems.length > 1){
			state.pageItems.item(0).remove();
		}
		app.importedPageAttributes.pageNumber = counter + 1;
		file = File(idFile);
		var idPage = rectangle.place(file);
		idPage = idPage[0];
		if(counter == 0){
			var firstPage = idPage.pageNumber;
		}
		else{
			if(idPage.pageNumber == firstPage){
				idPage.parent.remove();
				multiStateObject.states.item(-1).remove();
				done = true;
			}
		}
		counter = counter + 1;
	}
	makeNavigationButtons(multiStateObject);
}
//Adds simple next/previous state buttons for navigating the page stack.
function makeNavigationButtons(multiStateObject){
	var page = multiStateObject.parentPage;
	var bounds = multiStateObject.geometricBounds;
	var bottomEdge = bounds[2];
	var topEdge = bottomEdge - 24;
	var horizontalCenter = bounds[1] + ((bounds[3]-bounds[1])/2);
	var redColor = addColor("Red", ColorSpace.RGB, ColorModel.process, [255, 0, 0]);
	var grayColor = addColor("Gray", ColorSpace.RGB, ColorModel.process, [128, 128, 128]);
	var rightArrow = page.polygons.add({fillColor:app.documents.item(0).colors.item("Gray"), name:"GoToNextState"});
	rightArrow.paths.item(0).entirePath = [[horizontalCenter + 6, topEdge],[horizontalCenter + 30, topEdge + 12],[horizontalCenter + 6, bottomEdge]];
	var button = page.buttons.add({geometricBounds:[topEdge, horizontalCenter + 6, bottomEdge, horizontalCenter + 30]});
	button.states.item(0).addItemsToState(rightArrow);
	var gotoNextStateBehavior = button.gotoNextStateBehaviors.add({behaviorEvent:BehaviorEvents.mouseUp, associatedMultiStateObject:multiStateObject});
	var leftArrow = page.polygons.add({fillColor:app.documents.item(0).colors.item("Gray"), name:"GoToNextState"});
	leftArrow.paths.item(0).entirePath = [[horizontalCenter - 6, topEdge],[horizontalCenter - 30, topEdge + 12],[horizontalCenter - 6, bottomEdge]];
	button = page.buttons.add({geometricBounds:[topEdge, horizontalCenter - 6, bottomEdge, horizontalCenter - 30]});
	button.states.item(0).addItemsToState(leftArrow);
	var gotoPreviousStateBehavior = button.gotoPreviousStateBehaviors.add({behaviorEvent:BehaviorEvents.mouseUp, associatedMultiStateObject:multiStateObject});
}
//Makes the page size of the new document match the page size of the source document.
function adjustPageSize(page, idFile){
	app.importedPageAttributes.importedPageCrop = ImportedPageCropOptions.CROP_CONTENT;
	app.importedPageAttributes.pageNumber = 1;
	var idPage = page.place(idFile);
	idPage = idPage[0];
	var topLeft = idPage.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.PASTEBOARD_COORDINATES);
	var bottomRight = idPage.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.PASTEBOARD_COORDINATES);
	//topLeft and bottomRight are arrays.
	topLeft = topLeft[0];
	bottomRight = bottomRight[0];
	page.reframe(CoordinateSpaces.PASTEBOARD_COORDINATES, [topLeft, bottomRight]);
	idPage.parent.remove();
}
//Adds a named color if the color does not already exist.
function addColor(colorName, colorSpace, colorModel, colorValue){
	var color;
	var document = app.documents.item(0);
	if(document.colors.item(colorName).isValid == false){
		color = document.colors.add({name:colorName});
	}
	else{
		color = document.colors.item(colorName);
	}
	color.properties = {space:colorSpace, model:colorModel, colorValue:colorValue};
	return color;
}