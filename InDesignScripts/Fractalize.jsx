//Fractalize.jsx
//
//Repeats a fractal figure between each point on a path.
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
//ASCII art explanation...
//Given two points (*):
//    *---------*
//The figure produced will be:
//        ---
//    *---   ---*
//Just a reminder (where "*" is the current point):
//--------------------
//  135  90  45
//    \  |  /
//     \ | /
//180 -- *  -- 0
//    /  | \
//   /   |  \
// 225  270  315
//--------------------
#target indesign
main();
//The "main" function processes the objects in the selection, and
//passes qualifying page items to the fractal-generating functions.
//If no qualifying objects are selected, the function displays
//an error message.
function main(){
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	var myObjectList = new Array;
	if(app.documents.length != 0){
		if(app.selection.length !=0){
			for(var myCounter = 0; myCounter < app.selection.length; myCounter++){
				switch (app.selection[myCounter].constructor.name){
					case "Rectangle":
					case "Oval":
					case "Polygon":
					case "TextFrame":
					case "Button":
					case "GraphicLine":
						//If the object is one of the above, add it to the
						//array of objects to be processed.
						myObjectList.push(app.selection[myCounter]);
						break;
				}
			}
			if (myObjectList.length != 0){
				myDisplayDialog(myObjectList);
			}
			else{
				alert ("Please select a page item and try again.");
			}
		}
		else{
			alert ("Please select an object and try again.");
		}
	}
	else{
 	   alert ("Please open a document, select an object, and try again.");
	}
}
function myDisplayDialog(myObjectList){
	var myDialog = app.dialogs.add({name:"Fractalize"});
	with(myDialog.dialogColumns.add()){
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Fractal Pattern:"});
			}
			with(dialogColumns.add()){
				var myPatternDropdown = dropdowns.add({stringList:["F+F-F-F+F", "F+F+F-FF-FFFF+FF+F+F-F-F", "Koch Fractal"], selectedIndex:0});
			}
		}
	}
	var myResult = myDialog.show();
	if(myResult == true){
		var myFractalType = myPatternDropdown.selectedIndex;
		myDialog.destroy();
		myFractalizeObjects(myObjectList, myFractalType);
	}
	else{
		myDialog.destroy();
	}
}
function myFractalizeObjects(myObjectList, myFractalType){
	var myObject;
	for(var myCounter = 0; myCounter < myObjectList.length; myCounter ++){
		myObject = myObjectList[myCounter];
		myFractalizeObject(myObject, myFractalType);
	}
}
function myFractalizeObject(myObject, myFractalType){
	var myPath;
	for(var myCounter = 0; myCounter<myObject.paths.length; myCounter++){
		myPath = myObject.paths.item(myCounter);
		myFractalizePath(myPath, myFractalType);
	}
}
//The function myFractalizePath is the part of the script that does
//all of the work. It doesn't actually move points on the path or add points
//to the path one-by-one. Instead, it calculates an array containing all of 
//the path point locations on the path and then uses the entirePath property
//to set all of the points at once. It's faster this way, trust me.
function myFractalizePath(myPath, myFractalType){
	var myIndex, myPoint, myNextPoint, myDistance, myAngle, myNewPoint, myMove;
	var myPathPoints = new Array;
	outsideloop:
	for(var myCounter = 0; myCounter < myPath.pathPoints.length; myCounter ++){
		myPoint = myPath.pathPoints.item(myCounter);
		myPathPoints.push(myPoint.anchor);
		//Using the mod operator (%) we can loop around
		//the path points in the path.
		myIndex = (myCounter+1)%(myPath.pathPoints.length);
		//$.write("----------\r");
		//$.write("Counter:" + myCounter + "\r");
		//$.write("Index:" + myIndex + "\r");
		//Special case code for dealing with the last point
		//on a closed path (where the next point on the path
		//will be the first point on the path).		
		if(myCounter != myPath.pathPoints.length -1){
			myNextPoint = myPath.pathPoints.item(myIndex);
		}
		else{
			if(myPath.pathType == PathType.closedPath){
				myNextPoint = myPath.pathPoints.item(0);			
			}
			else{
				//If the point is the last point on an open path,
				//then we're done, so break outside the loop.
				break outsideloop;
			}
		}
		//$.write("Next Point Anchor X:" + myNextPoint.anchor[0] + "\r");
		//$.write("Next Point Anchor Y:" + myNextPoint.anchor[1] + "\r");
		//myDistance is the distance between the current point and the next point.
		myDistance = myCalculateDistance(myPoint.anchor, myNextPoint.anchor);
		//myAngle is the angle between the current point and the next point.
		myAngle = myCalculateAngle(myPoint.anchor, myNextPoint.anchor);	
		//$.write("Angle:" + myAngle + "\r");
		//$.write("Distance:" + myDistance + "\r");	
		//This segment is the actual fractal figure. It adds
		//four points between the current and next point on the path.
		//It should be obvious that other figures could be added here.
		//In L-systems terms, the following would be:
		//δ = 90
		//d = myDistance/3
		//F+F-F-F+F
		//where:
		//F = move d
		//+ = turn turtle left
		//- = turn turtle right
		switch(myFractalType){
			case 0:
				//F+F-F-F+F
				myMove = myDistance/3;
				$.writeln("move:" + myMove);
				$.writeln("angle:" + myAngle);
				myNewPoint = myTranslate(myPoint.anchor, myMove, myAngle);
				$.writeln("1:" + myNewPoint);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove, myAngle+90);
				$.writeln("2:" + myNewPoint);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove, myAngle);
				$.writeln("3:" + myNewPoint);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove, myAngle-90);
				$.writeln("4:" + myNewPoint);
				myPathPoints.push(myNewPoint);
				break;
			case 1:
				//F+F+F-FF-FFFF+FF+F+F-F-F
				myMove = myDistance/4;
				myNewPoint = myTranslate(myPoint.anchor, myMove, myAngle);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove, myAngle+90);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove, myAngle-180);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove, myAngle+90);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove*2, myAngle);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove*4, myAngle-90);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove*2, myAngle);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove, myAngle+90);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove, myAngle-180);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint, myMove, myAngle+90);
				myPathPoints.push(myNewPoint);				
				break;
			case 2:
				//Koch fractal
				myMove = myDistance/3;
				myNewPoint = myTranslate(myPoint.anchor, myMove, myAngle);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint,  myMove*Math.sin(45*(Math.PI/180)), myAngle+45);
				myPathPoints.push(myNewPoint);
				myNewPoint = myTranslate(myNewPoint,  myMove*Math.sin(45*(Math.PI/180)), myAngle-45);
				myPathPoints.push(myNewPoint);
				break;
		}
		//$.write("New Point Anchor X:" + myNewPoint[0] + "\r");
		//$.write("New Point Anchor Y:" + myNewPoint[1] + "\r");
	}
	myPath.entirePath = myPathPoints;
}
//Calclulate the distance between the two points using the Pythagorean theorem.
function myCalculateDistance(myPoint, myNextPoint){
	return Math.sqrt(Math.pow(myNextPoint[0]-myPoint[0], 2) + Math.pow(myNextPoint[1]-myPoint[1], 2));
}

function myCalculateAngle(pointA, pointB){
	var dx = pointB[0] - pointA[0];
	var dy = (pointB[1] - pointA[1]);
	return ((Math.atan2(dy, dx)*180)/Math.PI)*-1;
}

//The myTranslate function returns a the point at myDistance
//from myPoint along the axis specified by myAngle. This is often
//called "turtle graphics" after the drawing command used in
//the Logo programming language.
function myTranslate(myPoint, myDistance, myAngle){
	myAngle = myAngle * (Math.PI/180);
	var myX = myPoint[0] + (myDistance*Math.cos(myAngle));
	var myY = myPoint[1] - (myDistance*Math.sin(myAngle));
	return [myX, myY];
}