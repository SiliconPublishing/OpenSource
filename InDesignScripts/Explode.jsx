//Explode.jsx
//
//Breaks the selected InDesign page items into sub-paths, then scatters the resulting paths.
//Note: Explode can be VERY SLOW with complex paths or large numbers of copies!
//
//by Olav Martin Kvern
//Distributed by Silicon Publishing, Inc., for PEPCON, San Francisco, 2012.
//
//Our web site says, "Silicon Publishing, Inc. provides electronic publishing solutions and customizations 
//that automate the distribution of information between multiple sources and destinations." But what does
//that really mean? We make custom software for publishing. Some of it is for intense, data-driven, high-
//volume applications--think: directories, catalogs, and customized itineraries. Some of it is for web-to-print 
//or print-to-web applications--think: business cards, flyers, brochures, data sheets. Some of it is none of the 
//above. Use your imagination--of there's some chance that we can make your work easier, drop us a line! 
//sales@siliconpublishing.com
//
#target 'indesign'
//
main();
function main(){
	if(app.documents.length > 0){
		if(app.selection.length > 0){
			var objectList = buildObjectList();
			if(objectList.length > 0){
				displayDialog(objectList);
			}
			else{
				selectionError();
			}
		}
		else{
			selectionError();
		}
	}
}
function selectionError(){
	alert("Please select a rectangle, ellipse, polygon, or group, and try again. If you are trying to explode a text frame, convert the text in the text frame to outlines first.");
}
function buildObjectList(){
	var objectList = new Array;
	for(var counter = 0; counter < app.selection.length; counter++){
		switch(app.selection[counter].constructor.name){
			case "Rectangle":
			case "Oval":
			case "Polygon":
			case "Group":
				objectList.push(app.selection[counter]);
				break;
		}
	}
	return objectList;
}
function displayDialog(objectList){
	var labelWidth = 100;
    var dialog = app.dialogs.add({name:"Explode"});
	with(dialog.dialogColumns.add()){
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Distance", minWidth:labelWidth});
			}
			with(dialogColumns.add()){
				var distanceField = measurementEditboxes.add({editValue:6});
			}
		}
		with(dialogRows.add()){
			with(dialogColumns.add()){
					staticTexts.add({staticLabel:"Variation", minWidth:labelWidth});
				}
				with(dialogColumns.add()){
					var variationField = measurementEditboxes.add({editValue:2});
				}
			}
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Copies", minWidth:labelWidth});
			}
			with(dialogColumns.add()){
				var copiesField = integerEditboxes.add({editValue:3});
			}
		}
		with(dialogRows.add()){
			var randomRotationCheckbox = checkboxControls.add({staticLabel:"Random rotation", checkedState:true});
		}
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Rotation Limit", minWidth:labelWidth});
			}
			with(dialogColumns.add()){
				var randomRotationAngleField = angleEditboxes.add({editValue:3});
			}
		}
		with(dialogRows.add()){
			var retainOriginalCheckbox = checkboxControls.add({staticLabel:"Retain original object", checkedState:true});
		}
	}
	var result = dialog.show();
	if(result == true){
		var distance = distanceField.editValue;
		var variation = variationField.editValue;
		var copies = copiesField.editValue;
		var angle = randomRotationAngleField.editValue;
		var randomRotation = randomRotationCheckbox.checkedState;
		var randomRotationAngle = randomRotationAngleField.editValue;
		var retainOriginal = retainOriginalCheckbox.checkedState;
		dialog.destroy();
		explodeObjects(objectList, distance, variation, copies, randomRotation, randomRotationAngle, retainOriginal);
	}
	else{
		dialog.destroy();
	}
}
function explodeObjects(objectList, distance, variation, copies, randomRotation, randomRotationAngle, retainOriginal){
	var repeatCounter, objectCenter, groupItems;
	for(var counter = 0; counter < objectList.length; counter++){
		objectCenter = objectList[counter].resolve(AnchorPoint.CENTER_ANCHOR, CoordinateSpaces.PASTEBOARD_COORDINATES)[0];
		for(repeatCounter = 1; repeatCounter < copies + 1; repeatCounter++){
			groupItems = explodeObject(objectList[counter], objectCenter, distance * repeatCounter, variation, randomRotation, randomRotationAngle);
		}
		//Create a group to hold the "exploded" items.
		objectList[counter].parent.groups.add(groupItems);
		if(retainOriginal == false){
			objectList[counter].remove();
		}
	}
}
function explodeObject(pageItem, center, distance, variation, randomRotation, randomRotationAngle){
	var groupItems = new Array;
	var path, entirePath, newPageItem, pointA, pointB, pathPointCounter, adjustCounter;
	for(var counter = 0; counter < pageItem.paths.length; counter++){
		path = pageItem.paths.item(counter);
		entirePath = path.entirePath;
		if(path.pathType == PathType.CLOSED_PATH){
			adjustCounter = 0;
		}
		else{
			adjustCounter = 1;
		}
		for(pathPointCounter = 0; pathPointCounter < path.pathPoints.length-adjustCounter; pathPointCounter ++){
			pointA = entirePath[pathPointCounter];
			if((pathPointCounter == path.pathPoints.length-1)&&(path.pathType == PathType.CLOSED_PATH)){
				pointB = entirePath[0];
			}
			else{
				pointB = entirePath[pathPointCounter + 1];
			}
			subPathArray = new Array(pointA, pointB);
			newPageItem = pageItem.parent.graphicLines.add();
			newPageItem.paths.item(0).entirePath = subPathArray;
			newPageItem.strokeColor = pageItem.strokeColor;
			if(pageItem.strokeColor.name == "None"){
				newPageItem.strokeColor = app.documents.item(0).swatches.item("Black");
			}
			else{
				newPageItem.strokeColor = pageItem.strokeColor;
			}
			if(pageItem.strokeWeight == 0){
				newPageItem.strokeWeight = .5;
			}
			else{
				newPageItem.strokeWeight = pageItem.strokeWeight;
			}
			transform(newPageItem, center, distance, variation, randomRotation, randomRotationAngle);
			groupItems.push(newPageItem);
		}
	}
	return groupItems;
}
function transform(pageItem, center, distance, variation, randomRotation, randomRotationAngle){
	var pageItemCenter = pageItem.resolve(AnchorPoint.CENTER_ANCHOR, CoordinateSpaces.PASTEBOARD_COORDINATES)[0];
	var angle = calculateAngle(pageItemCenter, center);
	var randomVariation = getRandom(variation);
	if(coinToss()==0){
		randomVariation = -randomVariation;
	}
	var offsetArray = getTranslation(distance + randomVariation, angle);
	var translationMatrix = app.transformationMatrices.add();
	translationMatrix = translationMatrix.translateMatrix(offsetArray[0], offsetArray[1]);
	pageItem.transform(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.CENTER_ANCHOR, translationMatrix);
	if(randomRotation == true){
		var rotationMatrix = app.transformationMatrices.add();
		var randomAngle = getRandom(randomRotationAngle);
		if(coinToss() == 0){
			randomAngle = -randomAngle;
		}
		rotationMatrix = rotationMatrix.rotateMatrix(randomAngle);
		try{
			pageItem.transform(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.CENTER_ANCHOR, rotationMatrix);
		}
		catch(error){
		}
	}
}
//Calclulate the distance between the two points using the Pythagorean theorem.
function calculateDistance(pointA, pointB){
	return Math.sqrt(Math.pow(pointB[0]-pointA[0], 2) + Math.pow(pointB[1]-pointA[1], 2));
}
function calculateAngle(pointA, pointB){
	var dx = truncate(pointB[0]) - truncate(pointA[0]);
	var dy = truncate(pointB[1]) - truncate(pointA[1]);
	var result = ((Math.atan2(dy, dx)*180)/Math.PI)*-1;
	return result;
}
function getTranslation(distance, angle){
	var x, y;
	if((angle == 90)||(angle == -90)){
		x = 0;
	}
	else{
		x = -distance*Math.cos(convertToRadians(angle));
	}
	if((angle == 180)||(angle == -180)){
		y = 0;
	}
	else{
		y = distance*Math.sin(convertToRadians(angle));
	}
	return new Array(x, y);
}
function truncate(value){
	return (value * 10000000000000)*.0000000000001;
}
function convertToRadians(angleInDegrees){
	var result = angleInDegrees * (Math.PI/180);
	return result;
}
function convertToDegrees(angleInRadians){
	var result = angleInRadians * (180/Math.PI);
	return result;
}
function getRandom(value){
	return Math.floor(Math.random()*(value + 1));
}
function coinToss(){
	return parseInt(getRandom(2));
}