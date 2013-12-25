//AddIndexNotes.jsx
//
//An InDesign CS5/CS5.5 JavaScript by Olav Martin Kvern (okvern@ix.netcom.com).
//
//Creates notes and hyperlink text destinations in the stories of a document
//as an aid for indexers trying to index eBooks. Hope it helps!
//
//For more on how to use this script, go to:
//http://www.wrightinformation.com/Indesign%20scripts/Indesignscripts.html
//
//This script is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//See: http://creativecommons.org/licenses/by-nc-sa/3.0/
//
//Note: Run this script after pagination is final. Running the script before pagination is final will result in
//notes and hyperlink text destinations that do not match the text.
//
//Use RemoveIndexNotes.jsx to remove the notes and hyperlink text destinations created by this script, if necessary.
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
//
//OPTIONS
//When breakLongParagraphs is set to true, the script will add markers inside the paragraph (this might help when
//a user is viewing the text on a viewer that can only display a limited  number of characters).
var breakLongParagraphs = true;
//Character limit sets the threshold, in characters, at which the script will add markers inside a paragraph (when
//breakLongParagraphs is set to true).
var characterLimit = 836;
//
main();
function main(){
	if(app.documents.length > 0){
		if(app.documents.item(0).stories.length > 0){
			addIndexNotes(app.documents.item(0));
		}
	}
}
function addIndexNotes(document){
	var paragraph, note, pageName, story, hyperlinkTextDestination, noteCounter;
	var chapterNumber = document.chapterNumberPreferences.chapterNumber;
	for(var storyCounter = 0; storyCounter < document.stories.length; storyCounter ++){
		story = document.stories.item(storyCounter);
		if(!isStoryOnMasterSpreadOrPasteboard(story)){
			noteCounter = 0;
			storyID = story.id;
			for(var counter = 0; counter < story.paragraphs.length; counter++){
				paragraph = story.paragraphs.item(counter);
				try{
					if(breakLongParagraphs == true){
						makeNoteAndDestination(paragraph.insertionPoints.item(0), chapterNumber, storyID, noteCounter);
						noteCounter++;
						if(paragraph.characters.length > characterLimit){
							for(var blockCounter = characterLimit; blockCounter < paragraph.characters.length; blockCounter+=characterLimit){
								makeNoteAndDestination(paragraph.insertionPoints.item(blockCounter), chapterNumber, storyID, noteCounter);
								noteCounter++;
							}
						}
					}
					else{
						makeNoteAndDestination(paragraph.insertionPoints.item(0), chapterNumber, storyID, noteCounter);
						noteCounter++;
					}
				}
				catch(error){
					$.writeln(error.message);
					//Paragraph was in overset text.
				}
			}
		}
	}
}
function isStoryOnMasterSpreadOrPasteboard(story){
	var result = false;
	try{
		if(story.textContainers[0].parentPage.parent.constructor.name == "MasterSpread"){
			result = true;
		}
	}
	catch(error){
		//Story was on the pasteboard.
		result = true;
	}
	return result;
}
function makeNoteAndDestination(insertionPoint, chapterNumber, storyID, noteCounter){
	var pageName = insertionPoint.parentTextFrames[0].parentPage.name;
	note = insertionPoint.notes.add(LocationOptions.BEFORE, insertionPoint);
	note.texts.item(0).insertionPoints.item(-1).contents = "c" + chapterNumber;
	note.texts.item(0).insertionPoints.item(-1).contents = ".s" + storyID;
	note.texts.item(0).insertionPoints.item(-1).contents = ".p" + pageName;
	note.texts.item(0).insertionPoints.item(-1).contents = "." + noteCounter;
	hyperlinkTextDestination = document.hyperlinkTextDestinations.add(insertionPoint, {name:note.texts.item(0).contents});
	//Label the note and the hyperlink text destination (so that we can identify them when/if it's time to remove them).
	hyperlinkTextDestination.insertLabel("AddIndexNotes", "Created by AddIndexNotes.jsx");
	note.insertLabel("AddIndexNotes", "Created by AddIndexNotes.jsx");
}