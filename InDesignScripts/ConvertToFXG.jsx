//ConvertToFXG.jsx
//
//Convert the InDesign page items to FXG. This is very much a work in progress.
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
//
//A couple of globals (sorry, got lazy):
var xOffset = 0;
var yOffset = 0;
var scaleFactor = 1;
main();
function main(){
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	var objectList = new Array;
	if(app.documents.length > 0){
		if(app.selection.length > 0){
			objectList = displayDialog();
			if(objectList.length > 0){
				convertToFXG(objectList);
				alert("Done converting to FXG.");
			}
			else{
				alert("No qualifying object selected. Please select a rectangle, ellipse, polygon, graphic line, or group, and try again.");
			}
		}
		else{
			alert("Please select an object or objects and try again.");			
		}
	}
}
function main(){
	if(app.documents.length > 0){
		if(app.selection.length > 0){
			var pageItem, groupElement;
			//Have to have the FXG namespace.
			var xml = new XML("<Graphic version=\"2.0\" xmlns=\"http://ns.adobe.com/fxg/2008\"></Graphic>");
			//Make a list of the ids of the objects in the selection. Need to do this because potential document.revert() commands
			//will clear the selection list.
			var objectList = new Array;
			for(var counter = 0; counter < app.selection.length; counter++){
				switch(app.selection[counter].constructor.name){
					case "GraphicLine":
					case "Rectangle":
					case "Oval":
					case "Polygon":
					case "Group":
					case "TextFrame":
						objectList.push(app.selection[counter].id);
						break;
				}
			}
			//If the selection contained qualifying items, process the items.
			if(objectList.length > 0){
				//Figure out the bounds for the FXG.
				xml = setFXGBounds(objectList, xml);
				for(counter = 0; counter < objectList.length; counter++){
					//Add a group to the <Graphic> element.
					groupElement = new XML("<Group>");
					xml.appendChild(groupElement);
					pageItem = app.documents.item(0).pageItems.itemByID(objectList[counter]);
					if(pageItem.constructor.name == "Group"){
						for(groupItemCounter = 0; groupItemCounter < group.pageItems.length; groupItemCounter++){
							xml = processPageItem(pageItem.pageItems.item(groupItemCounter), xml);
						}
					}
					else{
						xml = processPageItem(pageItem, xml);
					}
				}
				saveFile(xml);
			}
		}
	}
}
//
function saveFile(xml){
	var file = File.saveDialog ("Save FXG as");
	if(file != null){
		file.open ("w");
		file.encoding = "UTF-8";
		file.write("<?xml version=\"1.0\" encoding=\"utf-8\" ?>\r" + xml.toXMLString());
		file.close();
	}
}
function processPageItem(pageItem, xml){
	xml = makeFXGPath(pageItem, xml);
	return xml;
}
function setFXGBounds(objectList, xml){
	var pageItem;
	var bounds = app.documents.item(0).pageItems.itemByID(objectList[0]).visibleBounds;
	//Set some initial bounds.
	var x1 = bounds[1];
	var y1 = bounds[0];
	var x2 = bounds[2];
	var y2 = bounds[3];
	for(var counter = 0; counter < objectList.length; counter++){
		//If the page item has a text path, we need to expand the item to get the bounds.
		pageItem = app.documents.item(0).pageItems.itemByID(objectList[counter]);
		if(pageItem.textPaths.length > 0){
			//Ignore empty text paths.
			if(pageItem.textPaths.item(0).texts.item(0).contents != ""){
				try{
					var array =app.documents.item(0).pageItems.itemByID(objectList[counter]).textPaths.item(0).texts.item(0).createOutlines(false);
					var group = array[0];
					bounds = group.visibleBounds;
					//Revert after getting the bounds.
					//Turn off user interaction to suppress revert alert.
					app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
					app.documents.item(0).revert();
					app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
				}
				catch(error){
					//Couldn't create text path for some reason.
				}
			}
		}
		else{
			bounds = app.documents.item(0).pageItems.itemByID(objectList[counter]).visibleBounds;
		}
		//Compare the bounds values to the stored bounds.
		//If a given bounds value is less than (for x1 and y1) or 
		//greater than (for x2 and y2) the stored value,
		//then replace the stored value with the bounds value.
		if (bounds[0] < y1){
			y1 = bounds[0];
		}
		if (bounds[1] < x1){
			x1 = bounds[1];
		}
		if (bounds[2] > y2){
			y2 = bounds[2];
		}
		if (bounds[3] > x2){
			x2 = bounds[3];
		}		
	}
	//At this point, we should have a valid visible bounds for 
	//all of the specified page items.
	var width = x2-x1;
	var height = y2-y1;
	xOffset = x1;
	yOffset = y1;
	//Set the bounds of the graphic element.
	xml.@viewWidth = String(width);
	xml.@viewHeight = String(height);
	return xml;
}
function makeFXGPath(pageItem, xml){
	var string = "";
	//Set localCoordinates to false to get the object position in page coordinates,
	//rather than removing the offsets.
	var localCoordinates = true;
	//
	for(var counter = 0; counter < pageItem.paths.length; counter++){
		entirePath = pageItem.paths.item(counter).entirePath;
		//Remove the offsets if using local coordinates.
		if(localCoordinates == true){
			entirePath = removeOffsets(entirePath);
		}
		string += convertPath(entirePath, pageItem.paths.item(counter).pathType);
	}
	var pathElement = new XML("<Path>");
	pathElement.@data = string;
	pathElement = getFormatting(pageItem, pathElement);
	xml.Group[0].appendChild(pathElement);
	//$.writeln(xml.toXMLString());
	return xml;
}
function getFormatting(pageItem, pathElement){
	var strokeElement = new XML("<stroke>");
	var strokeColor = getRGBColor(pageItem.strokeColor);
	var solidColorStrokeElement = new XML("<SolidColorStroke>");
	solidColorStrokeElement.@color = strokeColor;
	solidColorStrokeElement.@weight = String(pageItem.strokeWeight);
	//Add these properties later.
	solidColorStrokeElement.@caps="none";
	solidColorStrokeElement.@joints="miter";
	solidColorStrokeElement.@miterLimit="10";
	//Add the stroke formatting to the stroke element.
	strokeElement.appendChild(solidColorStrokeElement);
	//Add the stroke element to the path element (unless the stroke color is "None"--if that's the case, 
	//don't add the stroke element at all).
	if(strokeColor != "None"){
		pathElement.appendChild(strokeElement);
	}
	var fillElement = new XML("<fill>");
	var fillColorElement = new XML("<SolidColor>");
	var fillColor = getRGBColor(pageItem.fillColor);
	fillColorElement.@color = String(fillColor);
	//Add the fill color to the fill element.
	fillElement.appendChild(fillColorElement);
	//Add the fill element to the path element (unless the fill color is "None"--if that's the case, 
	//don't add the stroke element at all).
	if(fillColor != "None"){
		pathElement.appendChild(fillElement);
		//$.writeln(pathElement.toXMLString());
	}
	return pathElement;
}
function getRGBColor(color){
	switch(color.name){
		case "None":
			hexValue = "None";
			break;
		case "Black":
		case "Registration":
			hexValue = "#000000";
			break;
		default:
			switch(color.space){
				case(ColorSpace.CMYK):
				case(ColorSpace.LAB):
				case(ColorSpace.MIXEDINK):
					//Convert to RGB, then convert to hex.
					color.space = ColorSpace.RGB;
					break;
			}
			var hexValue = toHex(Math.round(color.colorValue[0])) + toHex(Math.round(color.colorValue[1])) + toHex(Math.round(color.colorValue[2]));
			hexValue = "#" + hexValue;
			break;
	}
	return hexValue;
}
//Cute hexadecimal conversion function found on the web.
function toHex(n) {
	n = parseInt(n,10);
	if (isNaN(n)) return "00";
		n = Math.max(0,Math.min(n,255));
		return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
}
//Remove offsets
function removeOffsets(array){
	var newArray = new Array;
	for(var counter = 0; counter < array.length; counter++){
		switch(array[counter].length){
			case 2:
				newArray.push([array[counter][0]-xOffset, array[counter][1]-yOffset]);
			break;
			case 3:
				newArray.push([[array[counter][0][0]-xOffset, array[counter][0][1]-yOffset], [array[counter][1][0]-xOffset, array[counter][1][1]-yOffset], [array[counter][2][0]-xOffset, array[counter][2][1]-yOffset]]);
			break;
		}
	}
	//$.writeln(newArray.toSource());
	return newArray;
}
//Takes a path point array and returns a string suitable for use in <Path> element data attribute.
function convertPath(entirePath, pathType){
	var point, anchor, nextAnchor;
	var string = "";
	for(var counter = 0; counter < entirePath.length; counter++){
		point = entirePath[counter];
		if(counter < entirePath.length-1){
			nextPoint = entirePath[counter+1];
		}
		else{
			if(pathType == PathType.CLOSED_PATH){
				nextPoint = entirePath[0];
			}
			else{
				nextPoint = null;
			}
		}
		if(nextPoint != null){
			anchor = getAnchor(point);
			//nextAnchor = getAnchor(nextPoint);
			if(counter == 0){
				//moveto the first point on the path.
				string += "M " + anchor[0] + " " + anchor[1] + " "
			}
			switch(true){
				case(isCurvePoint(point)&&isCurvePoint(nextPoint)):
					//curveto current point right direction, next point right direction, next point anchor.
					string += "C " + point[2][0] + " " + point[2][1] + " " + nextPoint[0][0] + " " + nextPoint[0][1] + " " + nextPoint[1][0] + " " + nextPoint[1][1] + " ";				
				break;
				case(!isCurvePoint(point)&&isCurvePoint(nextPoint)):
					//curveto current point anchor, next point right direction, next point anchor.
					string += "C " + point[0] + " " + point[1] + " " + nextPoint[0][0] + " " + nextPoint[0][1] + " " + nextPoint[1][0] + " " + nextPoint[1][1] + " ";
				break;
				case(isCurvePoint(point)&&!isCurvePoint(nextPoint)):
					//curveto current point right direction, next point anchor, next point anchor.
					string += "C " + point[2][0] + " " + point[2][1] + " " + nextPoint[0] + " " + nextPoint[1] + " " + nextPoint[0] + " " + nextPoint[1] + " ";
				break;
				case(!isCurvePoint(point)&&!isCurvePoint(nextPoint)):
					//lineto current point anchor, next point anchor.
					string += "L " + nextPoint[0] + " " + nextPoint[1] + " ";
				break;
			}
		}
	}
	//closepath
	if(pathType == PathType.CLOSED_PATH){
		string += "Z ";
	}
	return string;
}
function isCurvePoint(array){
	var result = false;
	if(array.length == 3){
		result = true;
	}
	return result;	
}	
function getAnchor(array){
	var anchor;
	//If the point is a curve point, then the anchor is the second array in the array.
	if(array.length == 3){
		anchor = array[1];
	}
	else{
		anchor = array;
	}
	return anchor;
}