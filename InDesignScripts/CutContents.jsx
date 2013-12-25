//CutContents.jsx
//An InDesign JavaScript
//
//Cuts the contents of the selected page items and places
//them in the proper page position and stacking order.
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
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
main();
function main(){
	var myObjectList = new Array;
	if(app.documents.length != 0){
		if(app.selection.length != 0){
			for(var myCounter = 0; myCounter < app.selection.length;
			myCounter ++){
				switch(app.selection[myCounter].constructor.name){
					case "Rectangle":
					case "Oval":
					case "Polygon":
					case "GraphicLine":
						//If the item is a page item, add the item to the list.
						if(app.selection[myCounter].pageItems.length != 0){
							myObjectList.push(app.selection[myCounter]);
						}
						break;
				}
			}
			//If there were qualifying items in the selection, pass them
			//on to the myCutContents routine for processing.
			if(myObjectList.length != 0){
				myCutContents(myObjectList);
			}
		}
	}
}
function myCutContents(myObjectList){
	var myPageItem;
	var myGeometricBounds;
	for(var myCounter = 0; myCounter < myObjectList.length; 
	myCounter ++){
		var myDone = false;
		myPageItem = myObjectList[myCounter];
		do{
			if((myPageItem.constructor.name != "Group")&&
			(myPageItem.pageItems.length != 0)){
				myPageItem = myPageItem.pageItems.item(0);
				app.select(myPageItem, SelectionOptions.replaceWith);
				app.cut();
				app.pasteInPlace();
				myPageItem = app.selection[0];
			}
			else{
				myDone = true;
			}
		} while(myDone == false);
	}
}
