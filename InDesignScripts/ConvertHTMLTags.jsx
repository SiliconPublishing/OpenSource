//ReadHTMLTags.jsx
//An InDesign JavaScript
//
//Shows how to use regular expressions to apply styles to an imported HTML document. This
//will only work for very simple HTML files, and only for HTML that is well-formed. This script won't
//apply any formatting apart from bold and italic--to change the formatting, change the definitions
//of the styles that have been applied to the text.
//
//Run the script. You'll be asked to locate an HTML file to import.
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
	var htmlFile = File.openDialog ("Select an HTML file", "HTML files: *.html; All files:*.*", false);
	if((htmlFile != null)&&(htmlFile !="")){
		readHTML(htmlFile);
	}
}
function readHTML(htmlFile){
	var name, string, style, styleName;
	var document= app.documents.add();
	var htmlTagNames = new Array("h1", "h2", "h3", "h4", "h4", "h5", "h6", "p", "li");
	var bounds = getBounds(document, document.pages.item(0));
	var textFrame = document.pages.item(0).textFrames.add({geometricBounds:bounds});
	textFrame.insertionPoints.item(0).place(htmlFile);
	var story = textFrame.parentStory;
	//Reset the findGrepPreferences to ensure that previous settings do not affect the search.
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	//Find local formatting first (bold and italic).
	app.findGrepPreferences.findWhat = "<b>(.+?)<\/b>";
	var boldCharacterStyle = document.characterStyles.item("bold");
	if(boldCharacterStyle.isValid == false){
		boldCharacterStyle = document.characterStyles.add({name:"bold", fontStyle:"Bold"});
	}
	app.changeGrepPreferences.changeTo = "$1";
	app.changeGrepPreferences.appliedCharacterStyle = boldCharacterStyle;
	story.changeGrep();
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	app.findGrepPreferences.findWhat = "<i>(.+?)<\/i>";
	var boldCharacterStyle = document.characterStyles.item("italic");
	if(boldCharacterStyle.isValid == false){
		boldCharacterStyle = document.characterStyles.add({name:"italic", fontStyle:"Italic"});
	}
	app.changeGrepPreferences.changeTo = "$1";
	app.changeGrepPreferences.appliedCharacterStyle = boldCharacterStyle;
	story.changeGrep();
	for(var counter = 0; counter < htmlTagNames.length; counter++){
		app.findGrepPreferences = NothingEnum.nothing;
		app.changeGrepPreferences = NothingEnum.nothing;
		tag = htmlTagNames[counter];
		//Create the style if it does not already exist.
		style = document.paragraphStyles.item(tag);
		if(style.isValid == false){
			style = document.paragraphStyles.add({name:tag});
		}		
		app.findGrepPreferences.findWhat = "<" + tag + ">(.+?)<\/" + tag + ">";
		app.changeGrepPreferences.changeTo = "$1";
		app.changeGrepPreferences.appliedParagraphStyle = style;
		var foundItems = story.changeGrep();
	}
	//Reset the findGrepPreferences.
	app.findGrepPreferences  = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
}
function getBounds(document, page){
	var pageWidth = document.documentPreferences.pageWidth;
	var pageHeight = document.documentPreferences.pageHeight
	if(page.side == PageSideOptions.leftHand){
		var x2 = page.marginPreferences.left;
		var x1 = page.marginPreferences.right;
	}
	else{
		var x1 = page.marginPreferences.left;
		var x2 = page.marginPreferences.right;
	}
	var y1 = page.marginPreferences.top;
	var x2 = pageWidth - x2;
	var y2 = pageHeight - page.marginPreferences.bottom;
	return [y1, x1, y2, x2];
}