//IterativePathCuts.jsx
//An InDesign JavaScript
//
//Converts the selected InDesign paths to g-code for use in a CNC ("Computer Numeric Control"--basically, a
//computer controlled router. To use the output files (which you should give the extension ".nc"), you'll
//need some kind of machine control software, such as MACH 3.
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
#target "indesign"
main();
function main(){
	var myObjectList = new Array;
	if(app.documents.length > 0){
		if(app.selection.length > 0){
			for(var myCounter = 0; myCounter < app.selection.length; myCounter++){
				switch(app.selection[myCounter].constructor.name){
					case "Rectangle":
					case "Oval":
					case "Polygon":
					case "GraphicLine":
						myObjectList.push(app.selection[myCounter]);
						break;
				}
			}
			if(myObjectList.length > 0){
				myDisplayDialog(myObjectList);
			}
		}
	}
}
function myDisplayDialog(myObjectList){
	var myLabelWidth = 100;
	var myMMWidth = 30;
    var myDialog = app.dialogs.add({name:"Convert Path to GCode"});
    with(myDialog.dialogColumns.add()){
        with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Start Z:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myStartZField = realEditboxes.add({editValue:12});
			}
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"mm", minWidth:myMMWidth});
			}
		}
        with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Start X:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myStartXField = realEditboxes.add({editValue:0});
			}
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"mm", minWidth:myMMWidth});
			}
		}
        with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Start Y:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myStartYField = realEditboxes.add({editValue:0});
			}
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"mm", minWidth:myMMWidth});
			}
		}
        with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"End Z:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myEndZField = realEditboxes.add({editValue:0});
			}
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"mm", minWidth:myMMWidth});
			}
		}
        with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Interim Z:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myInterimZField = realEditboxes.add({editValue:15});
			}
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"mm", minWidth:myMMWidth});
			}
		}
        with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Step:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myStepField = realEditboxes.add({editValue:2});
			}
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"mm", minWidth:myMMWidth});
			}
		}	
        with(dialogRows.add()){
			var myAddPauseCheckbox = checkboxControls.add({staticLabel:"Pause between objects at end", checkedState:false});
		}	
	}
	var myResult = myDialog.show();
	if(myResult == true){
		var myStep = myStepField.editValue;
		var myStartZ = myStartZField.editValue;
		var myEndZ = myEndZField.editValue;
		var myInterimZ = myInterimZField.editValue;
		var myStartX = myStartXField.editValue;
		var myStartY = myStartYField.editValue;
		var myAddPause = myAddPauseCheckbox.checkedState;
		myDialog.destroy();
		myConvertPathsToGCode(myObjectList, myStartZ, myEndZ, myStep, myStartX, myStartY, myInterimZ, myAddPause);
	}
	else{
		myDialog.destroy();
	}
}
function myConvertPathsToGCode(myObjectList, myStartZ, myEndZ, myStep, myStartX, myStartY, myInterimZ, myAddPause){
	//Display a save file dialog box.
	var myFile = File.saveDialog("Save gCode File as:");
	var myNumberOfIterations = Math.round((myStartZ - myEndZ)/myStep);
	if((myFile != null)&&(myFile != "")){
		//Open the file and add job header info.
		myFile.open("w");
		try{
			myFile.writeln(";File: " + app.documents.item(0).filePath + "\r");
			//$.writeln(";File: " + app.documents.item(0).filePath + "\r");
		}
		catch(myError){
			myFile.writeln(";File: Untitled\r");
			//$.writeln(";File: Untitled\r");			
		}
		var myDate = Date();
		myFile.writeln(";" + myDate);
		//$.writeln(";" + myDate);
		myFile.writeln(";Speed\rf 300\r\r");
		//$.writeln(";Speed\rf 240\r\r");
		//Lift and move to initial position.
		myFile.writeln(";Move to starting position.\rg0 z 20\rg0 x 0 y 0\r");
		//$.writeln(";Move to starting position.\rg0 z 20\rg0 x 0 y 0\r");
		//Iteration works like this: per step, per object, and then per path. That way,
		//fewer objects are completely cut out before the end of the job.
		for(var myCounter = 0; myCounter <= myNumberOfIterations; myCounter++){
			myFile.writeln(";Pass: " + myCounter + "\r");
			//$.writeln(";Pass: " + myCounter + "\r");
			if(myCounter == myNumberOfIterations){
				myCurrentStep = myEndZ;
			}
			else{
				myCurrentStep = myStartZ - (myStep * myCounter);
			}
			for(var myPageItemCounter = 0; myPageItemCounter < myObjectList.length; myPageItemCounter++){		
				myFile.writeln(";Page Item: " + myPageItemCounter + "\r");
				//$.writeln(";Page Item: " + myPageItemCounter + "\r");
				myPageItem = myObjectList[myPageItemCounter];
				for(var myPathCounter = 0; myPathCounter < myPageItem.paths.length; myPathCounter++){
					myConvertToGCode(myFile, myPageItem.paths.item(myPathCounter), myCurrentStep, myStartX, myStartY, myInterimZ);
				}
				if((myAddPause == true)&&(myCounter == myNumberOfIterations)){
					myFile.writeln(";Pause\rm00\r;");
				}
			}
		}
		//Lift and move to final position.
		myFile.writeln("g0 z 20\rg0 x 0 y 0\r");
		//$.writeln("g0 z 20\rg0 x 0 y 0\r");
		alert("Done!");
	}
}
function myConvertToGCode(myFile, myPath, myCurrentStep, myStartX, myStartY, myInterimZ){
	var myPathPoints = myPath.pathPoints;
	myFile.writeln(";New path\r");
	//$.writeln(";New path\r");
	for(var myPointCounter = 0; myPointCounter < myPathPoints.length; myPointCounter++){
		myX = myStartX + truncate(myPathPoints.item(myPointCounter).anchor[0]);
		//InDesign vertical axis is upside down, so invert.
		myY = myStartY + truncate(-1*(myPathPoints.item(myPointCounter).anchor[1]));
		if(myPointCounter == 0){
			//Move to the first point on the path at engine speed.
			myFile.writeln("g0 x " + myX + " y " + myY);
			//$.writeln("g1 x " + myX + " y " + myY);
			//Lower the router to the current z location.
			myFile.writeln(";\r;Lower router\rg1 z " + myCurrentStep + "\r");
			//$.writeln(";\r;Lower router\rg1 z " + myCurrentStep + "\r");
		}
		else{
			//Move the router to the next point on the path.
			//$.writeln("g1 x " + myX + " y " + myY);
			myFile.writeln("g1 x " + myX + " y " + myY);
		}
	}
	//Back to the start.
	if(myPath.pathType == PathType.CLOSED_PATH){
		myX = myStartX + truncate(myPathPoints.item(0).anchor[0]);
		//InDesign vertical axis is upside down, so invert.
		myY = myStartY + truncate(-1*(myPathPoints.item(0).anchor[1]));
		//$.writeln(";Close path\rg1 x " + myX + " y " + myY);
		myFile.writeln(";Close path\rg1 x " + myX + " y " + myY);
	}
	myFile.writeln(";End of path");
	//$.writeln(";End of path");
	//Lift to iterim and pause.
	myFile.writeln("g0 z " + myInterimZ + "\r;m00\r;");
	//$.writeln("g0 z " + myInterimZ + "\r;m00\r;");
}
function truncate(myNumber){
	myNumber = (Math.round(myNumber * 10000))/10000;
	return myNumber;
}