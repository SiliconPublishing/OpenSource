//NINA.jsx
//An InDesign JavaScript
//
//Draws fascinating "spirograph" patterns. For more on NINAs, see http://www.washington.edu/bibsys/mattf/nina/index.html
//
//Position the zero point where you want the center of your NINA, then run the script.
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
	if(app.documents.length != 0){
		if(app.activeWindow.constructor.name == "LayoutWindow"){
			myDisplayDialog();
		}
	}
	else{
		alert("Please open or create a document and try again.");
	}
}
function myDisplayDialog(){
	var myDialog = app.dialogs.add({name:"NINA"});
	with(myDialog){
		//Add a dialog column.
		myDialogColumn = dialogColumns.add()	
		with(myDialogColumn){
			with(borderPanels.add()){
				with(dialogColumns.add()){
					staticTexts.add({staticLabel:"Number of iterations:"})	;
					staticTexts.add({staticLabel:"a_pulse:"});	
					staticTexts.add({staticLabel:"b_pulse:"});	
					staticTexts.add({staticLabel:"Line length (in points):"});	
				}
				with(dialogColumns.add()){
					//The following line shows how to set multiple properties as you create an object.
					//201:16:161:72 makes a nice example NINA.	
					myNumberOfLinesField = integerEditboxes.add({editValue:201, minWidth:60});
					myAPulseField = integerEditboxes.add({editValue:16, minWidth:60});
					myBPulseField = integerEditboxes.add({editValue:161, minWidth:60});
					myLengthField = integerEditboxes.add({editValue:72, minWidth:60});
				}
			}
			with(borderPanels.add()){
				with(radiobuttonGroups.add()){
					myClosedPathButton = radiobuttonControls.add({staticLabel:"Closed path", checkedState:true});
					myOpenPathButton = radiobuttonControls.add({staticLabel:"Open path"});
				}
			}
		}
	}
	myReturn = myDialog.show();
	if (myReturn == true){
		//Get the values from the dialog box.
		myNumberOfLines = myNumberOfLinesField.editValue;
		a_pulse = myAPulseField.editValue;
		b_pulse = myBPulseField.editValue;
		myLength = myLengthField.editValue;
		myClosedPath = myClosedPathButton.checkedState;
		myDialog.destroy();
		myDrawNina(myNumberOfLines, a_pulse, b_pulse, myLength, myClosedPath);
	}
	else{
		myDialog.destroy();
	}
}
function myDrawNina(myNumberOfLines, a_pulse, b_pulse, myLength, myClosedPath){
	var cur_x, cur_y;
	var myAnchor = new Array(2);
	var myArray = new Array;
	//Rather than draw the entire path point-by-point, we'll fill an array and then
	//use it to fill in all of the point locations at once using the entirePath property.
	//Fill in the Array "myArray" with a list of coordinates.
	for (var myCounter = 0; myCounter < myNumberOfLines; myCounter++){
		cur_x = (Math.cos((-2 * Math.PI * a_pulse * myCounter) / myNumberOfLines) + Math.cos((-2 * Math.PI * b_pulse * myCounter) / myNumberOfLines)) * myLength;
		cur_y = (Math.sin((-2 * Math.PI * a_pulse * myCounter) / myNumberOfLines) + Math.sin((-2 * Math.PI * b_pulse * myCounter) / myNumberOfLines)) * myLength;
		myAnchor = [cur_x, cur_y];
		myArray.push(myAnchor);
	}
	app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
	app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
	var myPage = app.activeWindow.activePage;
	var myGraphicLine = myPage.graphicLines.add();
	myGraphicLine.move(undefined, ["1p","1p"]);
	var myPath = myGraphicLine.paths.item(0);
	//Now set the entire path to the contents of the array.
	myPath.entirePath = myArray;
	if(myClosedPath == true){
		myPath.pathType = PathType.closedPath;
	}
	else{
		myPath.pathTYpe = PathType.openPath;
	}
	//Label the graphic line with the parameters used to create it.
	myGraphicLine.label = "number_of_lines = " + myNumberOfLines + ", a_pulse = " + a_pulse + ", b_pulse = " + b_pulse;
}