//VerifyIndexLinks.jsx
//An InDesign CS5/CS5.5 JavaScript by Olav Martin Kvern (okvern@ix.netcom.com).
//
//Verifies the page numbers of notes and hyperlink text destinations added by AddIndexNotes.jsx.
//
//For more on how to use this script, go to:
//http://www.wrightinformation.com/Indesign%20scripts/Indesignscripts.html
//
//This script is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//See: http://creativecommons.org/licenses/by-nc-sa/3.0/
//
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
	if(app.books.length > 0){
		var book = app.books.item(0);
		var destinationMap = makeDestinationMap(book);
		var locatorMap = getLocatorMap();
		var errorList = verifyLocators(locatorMap, destinationMap);
		if(errorList.length > 0){
			var logFile = File.saveDialog ("Errors found. Save error list to:", "Text files:*.txt", false);
			if((logFile != null)&&(logFile != "")){
				if(File(logFile).exists == true){
					File(logFile).remove();
				}
				logFile = new File(logFile);
				logFile.open("w");
				for(var counter = 0; counter < errorList.length; counter++){
					logFile.writeln(errorList[counter]);
				}
				logFile.close();	
			}
		}
		else{
			alert("No missing locators were found! Yay.");
		}
	}
}
function makeDestinationMap(book){
	//Create an array of mapItem objects.
	var filePath, document, destinationCounter;
	var destinationMap = "";
	for(var counter = 0; counter < book.bookContents.length; counter++){
		filePath = book.bookContents.item(counter).fullName;
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
		document = app.open(filePath);
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
		if(document.hyperlinkTextDestinations.length > 0){
			for(destinationCounter = 0; destinationCounter < document.hyperlinkTextDestinations.length; destinationCounter++){
				destination = document.hyperlinkTextDestinations.item(destinationCounter);
				//Check for the presence of the private label left by AddIndexNotes.
				if(destination.extractLabel("AddIndexNotes") != ""){
					destinationMap += destination.name + "\r";
				}
			}
			document.close(SaveOptions.NO);
		}
		else{
			document.close(SaveOptions.NO);
		}
	}
	return destinationMap;
}
function getLocatorMap(){
	var locatorMap = new Array;
	var locatorItem;
	var indexFile = File.openDialog ("Open the index text file", "Text files:*.txt", false);
	indexFile.open ("r");
	indexString = indexFile.read();
	indexFile.close();
	//Try to split using return character.
	var indexArray = indexString.split("\r");
	//If that didn't work, try to split using line end character.
	if(indexArray.length == 1){
		indexArray = indexString.split("\n");
	}
	$.writeln(indexArray.length);
	if(indexArray.length > 1){
		for(var counter = 0; counter<indexArray.length; counter++){
			if(indexArray[counter].match(/^\d*/gi) != null){
				locatorItem = {};
				locatorItem.id = indexArray[counter].match(/^\d*/gi);
				locatorItem.locatorArray = getLocatorArray(indexArray[counter]);
				locatorMap.push(locatorItem);
			}
		}
	}
	return locatorMap;
}
function getLocatorArray(string){
	var locatorArray = new Array;
	string = string.match(/c.*?(?=\")/gim);
	for(var counter = 0; counter < string.length; counter ++){
		locatorArray.push(string[counter]);
	}
	return locatorArray;
}
function verifyLocators(locatorMap, destinationMap){
	var locator, locatorExists;
	var errorArray = new Array;
	for(var counter = 0; counter < locatorMap.length; counter++){
		locator = locatorMap[counter];
		for(var locatorCounter = 0; locatorCounter < locator.locatorArray.length; locatorCounter ++){
			locatorExists = verifyLocator(locator.locatorArray[locatorCounter], destinationMap);
			if(locatorExists == false){
				errorArray.push("Locator id " + locator.id + "(" + locator.locatorArray[locatorCounter] + ") not found.");
			}
		}
	}
	return errorArray;
}
function verifyLocator(locator, destinationMap){
	var result = false;
	if(destinationMap.match(locator + "\r") != null){
		result = true;
	}
	return result;
}