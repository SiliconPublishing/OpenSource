//CheckIndexNotes.jsx
//
//An InDesign CS5/CS5.5 JavaScript by Olav Martin Kvern (okvern@ix.netcom.com).
//
//Checks the page numbers of notes and hyperlink text destinations added by AddIndexNotes.jsx.
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
	if(app.documents.length > 0){
		if(app.documents.item(0).stories.length > 0){
			var errorArray = new Array;
			checkIndexNotes(app.documents.item(0), errorArray);
			if(errorArray.length > 0){
				var string = "Errors found in: ";
				errorArray.reverse();
				for(var counter = 0; counter < errorArray.length; counter++){
					string += errorArray[counter];
					if(counter != errorArray.length -1){
						string += ", ";
					}
				}
				alert(string);
			}
		}
	}
}
function checkIndexNotes(document, errorArray){
	var hyperlinkTextDestination, note, story, storyCounter, counter, pageName;
	var notePageName, paragraph, paragraphIndex, destinationPageName;
	for(storyCounter = 0; storyCounter < document.stories.length; storyCounter++){
		story = document.stories.item(storyCounter);
		if(story.notes.length > 0){
			for(counter = story.paragraphs.length-1; counter >= 0; counter--){
				paragraph = story.paragraphs.item(counter);
				if(paragraph.notes.length > 0){
					note = paragraph.notes.item(0);
					if(note.extractLabel("AddIndexNotes") != ""){
						notePageName = note.texts.item(0).contents.replace(/.+p(\d+).+/gim, "$1");
						pageName = paragraph.insertionPoints.item(0).parentTextFrames[0].parentPage.name;
						if(notePageName != pageName){
							errorArray.push("Note " + note.texts.item(0).contents + " page number should be " + pageName);
						}
					}
				}
			}
		}
	}
	if(document.hyperlinkTextDestinations.length > 0){
		for(counter = document.hyperlinkTextDestinations.length-1; counter >= 0; counter--){
			hyperlinkTextDestination = document.hyperlinkTextDestinations.item(counter);
			if(hyperlinkTextDestination.extractLabel("AddIndexNotes") != ""){
				//hyperlinkTextDestination.remove();
				parent = hyperlinkTextDestination.destinationText;
				pageName = parent.parentTextFrames[0].parentPage.name;
				destinationPageName = hyperlinkTextDestination.name.replace(/.+p(\d+).+/gim, "$1");
				if(destinationPageName != pageName){
					errorArray.push("Hyperlink " + hyperlinkTextDestination.name + " page number should be " + pageName)
				}				
			}
		}
	}
}