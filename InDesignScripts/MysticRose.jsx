//MysticRose.jsx
//An InDesign JavaScript
//
//Draws a "mystic rose" geometric pattern, a type of construction also
//known as "string art".
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
//
#target "indesign"
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
main();
function main(){
	if(app.documents.length!=0){
		if(app.activeWindow.constructor.name == "LayoutWindow"){
			var myArray = myDisplayDialog();
			var myDrawRose = myArray[0];
			if(myDrawRose == true){
				var myOldXUnits = app.activeDocument.viewPreferences.horizontalMeasurementUnits;
				var myOldYUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits;
				app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
				app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
				var myCenterPoint = myArray[1];
				var myNumberOfPoints = myArray[2];
				var myDiameter = myArray[3];
				var mySkipLength = myArray[4];
				var myEvenOddFill = myArray[5];
				var myPathPoints = myCalculatePolygon(myCenterPoint, myDiameter/2, myNumberOfPoints);
				myDrawMagicRose(myPathPoints, mySkipLength, myEvenOddFill, myNumberOfPoints);
				app.activeDocument.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
				app.activeDocument.viewPreferences.verticalMeasurementUnits = myOldYUnits;
			}

		}
	}
}
function myDisplayDialog(){
	var myLabelWidth = 90;
	var myDialog = app.dialogs.add({name:"MysticRose"});
	with(myDialog.dialogColumns.add()){
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Center Point:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"X:"});
			}
			with(dialogColumns.add()){
				var myXField = measurementEditboxes.add({editValue:0, editUnits:MeasurementUnits.points});
			}
		}
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Y:"});
			}
			with(dialogColumns.add()){
				var myYField = measurementEditboxes.add({editValue:0, editUnits:MeasurementUnits.points});
			}
		}
		myLabelWidth = 115;
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Diameter:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myDiameterField = measurementEditboxes.add({editValue:144, editUnits:MeasurementUnits.points});
			}
		}
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Number of Points:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myNumberOfPointsField = integerEditboxes.add({editValue:21});
			}
		}
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Skip Array:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var mySkipLengthField = textEditboxes.add({editContents:"1,2,3,4,5,6,7,8,9,10"});
			}
		}
		var myEvenOddCheckbox = checkboxControls.add({staticLabel:"Even/Odd Fill"});
	}
	var myResult = myDialog.show();
	//Turn the skip pattern into the string version of an array.
	var mySkipLength = "[" + mySkipLengthField.editContents + "]";
	var myNumberOfPoints = myNumberOfPointsField.editValue;
	var myDiameter = myDiameterField.editValue;
	var myX = myXField.editValue;
	var myY = myYField.editValue;
	var myEvenOddFill = myEvenOddCheckbox.checkedState;
	if(myResult == true){
		myDrawRose = true;
		myDialog.destroy();
	}
	else{
		myDialog.destroy();
		myDrawRose = false;
	}
	return [myDrawRose, [myX, myY], myNumberOfPoints, myDiameter, mySkipLength, myEvenOddFill];
}
function myDrawMagicRose(myPathPoints, mySkipArray, myEvenOddFill, myNumberOfPoints){
	var myIndex;
	var myNewPathPoints = new Array;
	var myDone = false;
	var myCounter = 1;
	var myIndex = 0;	
	mySkipArray = eval(mySkipArray);
	myNewPathPoints.push(myPathPoints[0]);
	do{
		for(var mySkipCounter = 0; mySkipCounter < mySkipArray.length;mySkipCounter++){
			var myIndex = (myIndex + mySkipArray[mySkipCounter])%myPathPoints.length;
			myNewPathPoints.push(myPathPoints[myIndex]);
		}
		if(myIndex == 0){
		//When we reach the starting point at the end of the sequence
		//of steps, we're done. Note that we can reach the starting point
		//many times *inside* the step sequence.
			myDone = true;
		}
		else{
			myCounter ++;
		}
	}while (myDone != true);
	var myPolygon = app.activeWindow.activePage.polygons.add();
	myPolygon.paths.item(0).entirePath = myNewPathPoints;
	if(myEvenOddFill == 1){
		var myNewPolygon = myPolygon.duplicate();
		myPolygon.addPath(myNewPolygon);
	}
}
//Function calculates the points for an n-sided polygon around a given center point.
function myCalculatePolygon(myCenterPoint, myRadius, myNumberOfPoints){
	myAngleIncrement = (360/myNumberOfPoints)*(Math.PI/180);
	var myPathPoints = new Array;
	for (myPointCounter = 0; myPointCounter < myNumberOfPoints;myPointCounter ++){
		myX = myCenterPoint[0] + (myRadius * Math.cos(myAngleIncrement*myPointCounter));
		myY = myCenterPoint[1] + (myRadius * Math.sin(myAngleIncrement*myPointCounter));
		myPathPoints.push([myX, myY]);
	}
	return myPathPoints;	
}