//ReadPMTags.jsx
//An InDesign JavaScript
//
//Shows how to use regular expressions to read an imported PageMaker paragraph tags file.
//PageMaker paragraph tags (which are not the same as PageMaker tagged text format files) are a
//simplified text markup scheme. Paragraph style names appear at the start of a paragraph:
//<heading1>This is some text.
//<body_text>This is body text.
//
//To use this script, open a new InDesign file and import your PMTags file as plain text. Run the script.
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
			readPMTags(story);
		}
	}	
}
function readPMTags(story){
	var name, string, style, styleName;
	var document= app.documents.item(0);
	//Reset the findGrepPreferences to ensure that previous settings do not affect the search.
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	//Find local formatting first (bold and italic).
	app.findGrepPreferences.findWhat = "<b>(.+?)<\/b>";
	var foundItems = story.findGrep();
	if(foundItems.length != 0){
		var boldCharacterStyle = document.characterStyles.item("bold");
		if(boldCharacterStyle.isValid == false){
			boldCharacterStyle = document.characterStyles.add({name:"bold", fontStyle:"Bold"});
		}
		app.changeGrepPreferences.changeTo = "$1";
		app.changeGrepPreferences.appliedCharacterStyle = boldCharacterStyle;
		story.changeGrep();
	}
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	app.findGrepPreferences.findWhat = "<i>(.+?)<\/i>";
	var foundItems = story.findGrep();
	if(foundItems.length != 0){
		var boldCharacterStyle = document.characterStyles.item("italic");
		if(boldCharacterStyle.isValid == false){
			boldCharacterStyle = document.characterStyles.add({name:"italic", fontStyle:"Italic"});
		}
		app.changeGrepPreferences.changeTo = "$1";
		app.changeGrepPreferences.appliedCharacterStyle = boldCharacterStyle;
		story.changeGrep();
	}
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	app.findGrepPreferences.findWhat = "<.+?>";
	var foundItems = story.findGrep();
	if(foundItems.length != 0){
		var foundTags = new Array;
		for(var counter = 0; counter<foundItems.length; counter++){
			foundTags.push(foundItems[counter].contents);
		}
		foundTags = removeDuplicates(foundTags);
		//At this point, we have a list of tags to search for.
		for(counter = 0; counter < foundTags.length; counter++){
			string = foundTags[counter];
			//Find the tag using findWhat.
			app.findTextPreferences.findWhat = string;
			//Extract the style name from the tag.
			styleName = string.substring(1, string.length-1);
			//Create the style if it does not already exist.
			style = document.paragraphStyles.item(styleName);
			if(style.isValid == false){
				style = document.paragraphStyles.add({name:styleName});
			}
			//Apply the style to each instance of the tag.
			app.changeTextPreferences.appliedParagraphStyle = style;
			story.changeText();
			//Reset the changeTextPreferences.
			app.changeTextPreferences = NothingEnum.nothing;
			//Set the changeTo to an empty string.
			app.changeTextPreferences.changeTo = "";
			//Search to remove the tags.
			story.changeText();
			//Reset the find/change preferences again.
			app.changeTextPreferences = NothingEnum.nothing;			
		}
	}
	//Reset the findGrepPreferences.
	app.findGrepPreferences  = NothingEnum.nothing;
}
function removeDuplicates(array){ 
	//Semi-clever method of removing duplicate array items; much faster 
	//than comparing every item to every other item! 
	var newArray = new Array; 
	array = array.sort(); 
	newArray.push(array[0]); 
	if(array.length > 1){ 
		for(var counter = 1; counter < array.length; counter ++){ 
			if(array[counter] != newArray[newArray.length -1]){ 
				newArray.push(array[counter]); 
			} 
		} 
	} 
	return newArray; 
} 