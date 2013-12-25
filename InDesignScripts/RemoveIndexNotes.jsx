//RemoveIndexNotes.jsx
//
//An InDesign CS5/CS5.5 JavaScript by Olav Martin Kvern (okvern@ix.netcom.com).
//
//Removes notes and hyperlink text destinations added by AddIndexNotes.jsx.
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
			removeIndexNotes(app.documents.item(0));
		}
	}
}
function removeIndexNotes(document){
	var hyperlinkTextDestination, note, story, storyCounter, counter;
	for(storyCounter = 0; storyCounter < document.stories.length; storyCounter++){
		story = document.stories.item(storyCounter);
		if(story.notes.length > 0){
			for(counter = story.notes.length-1; counter >= 0; counter--){
				note = story.notes.item(counter);
				if(note.extractLabel("AddIndexNotes") != ""){
					note.remove();
				}
			}
		}
	}
	if(document.hyperlinkTextDestinations.length > 0){
		for(counter = document.hyperlinkTextDestinations.length-1; counter >= 0; counter--){
			hyperlinkTextDestination = document.hyperlinkTextDestinations.item(counter);
			if(hyperlinkTextDestination.extractLabel("AddIndexNotes") != ""){
				hyperlinkTextDestination.remove();
			}
		}
	}
}