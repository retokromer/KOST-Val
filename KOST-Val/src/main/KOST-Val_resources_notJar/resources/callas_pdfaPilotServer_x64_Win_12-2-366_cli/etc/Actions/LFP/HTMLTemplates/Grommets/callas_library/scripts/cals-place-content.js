//-------------------------------------------------------------------------------------------------
// Support functions specific to the place content fix-up. These include:
// - resizing the page generated
// - getting information from the calsDocInfo JSON file generated by pdfToolbox (in the 
//.  callas_tmp folder)
// - positioning elements in an easy way
//
// Dependencies: 
// - jQuery
//-------------------------------------------------------------------------------------------------
// Author: David van Driessche
// Copyright: Copyright © 2018 - Four Pees
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// GETTING INFORMATION FROM THE JSON FILE
//-------------------------------------------------------------------------------------------------

// An enum to represent the different pageboxes
//
var pcPagebox = {
	cropbox: 		{ value: "cropbox" },
	mediabox: 		{ value: "mediabox" },
	trimbox: 		{ value: "trimbox" },
	artbox: 		{ value: "artbox" },
	bleedbox: 		{ value: "bleedbox" }
};
Object.freeze(pcPagebox);


// Given the page index for a page (0-based), returns the page box asked for.
// Example: var theTrimBox = pcGetPagebox( 0, pcPagebox.trimbox )
// 
// inPageNumber: the (0-based) page number for the page you're interested in
// inPagebox: the pagebox you're interested in
//
// Returns: an array with the lower left (X and Y), width and height of the pagebox in points
//
function pcGetPagebox( inPageNumber, inPagebox ) {

	// Get the page object
	var thePage = cals_doc_info.pages[inPageNumber];

	// Handle each page box
	if (inPagebox.value === 'trimbox') {
		if ( thePage.trimbox != null) {
			return thePage.trimbox;
		} else {
			return pcGetPagebox( inPageNumber, pcPagebox.cropbox);
		}
	}
	if (inPagebox.value === 'bleedbox') {
		if (thePage.bleedbox != null) {
			return thePage.bleedbox;
		} else {
			return pcGetPagebox( inPageNumber, pcPagebox.cropbox);
		}
	}
	if (inPagebox.value === 'artbox') {
		if (thePage.artbox != null) {
			return thePage.artbox;
		} else {
			return pcGetPagebox( inPageNumber, pcPagebox.cropbox);
		}
	}
	if (inPagebox.value === 'cropbox') {
		if (thePage.cropbox != null) {
			return thePage.cropbox;
		} else {
			return pcGetPagebox( inPageNumber, pcPagebox.mediabox);
		}
	}

	// Coming to the end of the line, we always return mediabox to cover all bases
	return thePage.mediabox;
}

// Given the page index for a page (0-based), get an array with information for it. The coordinate system 
// for the information returned is the **HTML** coordinate system: (0,0) equals top left corner, 
// x-axis pointing right, y-axis pointing down. 
// Example: var theTrimBox = pcGetPageboxInfo( 0, pcPagebox.trimbox )
//
// inPageNumber: the (0-based) page number for the page you're interested in
// inPagebox: the pagebox you're interested in
//
// Returns: an array with the following information in it:
// 0: left
// 1: top
// 2: right
// 3: bottom
// 4: width
// 5: height
// 6: center (X)
// 7: middle (Y)
//
function pcGetPageboxInfo( inPageNumber, inPagebox ) {

	// Start an empty array
	var theInfo = [];

	// Get the mediabox and the requested pagebox
	var theMediabox = pcGetPagebox( inPageNumber, pcPagebox.mediabox );
	var thePagebox = pcGetPagebox( inPageNumber, inPagebox );

	// The left of the box is the left of the pagebox - the left of the mediabox
	var theLeft = (thePagebox[0] - theMediabox[0]);

	// The width and height are independent of the mediabox
	var theWidth = thePagebox[2];
	var theHeight = thePagebox[3];

	// The right of the box is the left + width
	var theRight = theLeft + theWidth;

	// The bottom of the page box is the height of the mediabox - the y offset of the page box
	var theBottom = theMediabox[3] - (thePagebox[1] - theMediabox[1]); 

	// The top of the page box is the bottom of the pagebox - its height
	var theTop = theBottom - theHeight;

	// Center and middle
	var theCenter = theLeft + (theWidth / 2);
	var theMiddle = theTop + (theHeight / 2);

	// Store results
	theInfo.push( theLeft ); theInfo.push( theTop ); theInfo.push( theRight );
	theInfo.push( theBottom ); theInfo.push( theWidth ); theInfo.push( theHeight );
	theInfo.push( theCenter ); theInfo.push( theMiddle );

	// Return the information
	return theInfo;
}

// Get the full file name of the file we're processing, with or without extension
//
// inWithExtension: set to "false" or omit to get the filename without extension. Set to true to get everything
//
// Returns: the name of the processed PDF file from the JSON file
//
function pcGetFileName( inWithExtension ) {

	// By default return the filename without extension
	inWithExtension = typeof inWithExtension !== 'undefined' ? inWithExtension : false;

	// Get the filename itself and return the correct value	
	return (inWithExtension === true) ? cals_doc_info.document.name : cals_doc_info.document.name.split('.')[0];
}

// Get the path to the file we're processing
//
// Returns: the full path of the processed PDF file from the JSON file 
//
function pcGetFilePath() {

	return cals_doc_info.document.path;
}

// Get the number of pages in the document
//
// Returns: the number of pages of the processed PDF file from the JSON file 
//
function pcGetNumberOfPages() {

	return cals_doc_info.document.numberofpages;
}

// Get the value of the named variable (or null) if it doesn't exist
//
// inName: the name of the variable you want to retrieve
//
// Returns: the value of the variable from the JSON file if found, null if the variable doesn't exist
//
function pcGetVariableValue( inName ) {

	// Get the array with variables
	var theVariables = cals_doc_info.document.variables;

	// Loop over them and try to find the correct one
	for (var theIndex = 0; theIndex < theVariables.length; theIndex++) {
		if (theVariables[theIndex].name === inName) return theVariables[theIndex].value;
	}

	// Found nothing
	return null;
}

// Get the value of the named variable or use the default if it doesn't exist
//
// inName: the name of the variable you want to retrieve
// inDefault: the default value to return if the variable doesn't exist
//
// Returns: 
function pcGetVariableValueWithDefault( inName, inDefault ) {

	// Get the array with variables
	var theVariables = cals_doc_info.document.variables;

	// Loop over them and try to find the correct one
	for (var theIndex = 0; theIndex < theVariables.length; theIndex++) {
		if (theVariables[theIndex].name === inName) return theVariables[theIndex].value;
	}

	// Found nothing
	return inDefault;
}

// Gets the user units for a page
//
function pcGetUserUnits( inPageNumber ) {

	return cals_doc_info.pages[inPageNumber].userunit;
}

// Gets the list of inks for a page
//
function pcGetInkList( inPageNumber ) {

	return cals_doc_info.pages[inPageNumber].inks;
}

// Gets the number of inks for a page
//
function pcGetInkCount( inPageNumber ) {

	return cals_doc_info.pages[inPageNumber].inks.length;
}

// Returns a textual color definition that is understood by cchip for a specific ink
//
function pcGetInkDefinitionAsText( inInk ) {

	// Look at the ink name and differentiate between the different possibilities
	if (inInk.name === 'Cyan') return '-cchip-cmyk( 1.0, 0, 0, 0)';
	if (inInk.name === 'Magenta') return '-cchip-cmyk( 0, 1.0, 0, 0)';
	if (inInk.name === 'Yellow') return '-cchip-cmyk( 0, 0, 1.0, 0)';
	if (inInk.name === 'Black') return '-cchip-cmyk( 0, 0, 0, 1.0)';

	// Coming here we have a spot color. Look at the alternate name to decide what kind of model
	if (inInk.alternatename === 'cmyk') {
		return '-cchip-cmyk( "' + inInk.name + '", ' + inInk.alternatecomps.join( ', ') + ')'; 
	}
	if (inInk.alternatename === 'lab') {

		return '-cchip-lab( "' + inInk.name + '", ' + inInk.alternatecomps.join( ', ') + ')'; 
	}

	// Unknown case, just return something wrong and obviously wrong
	return 'pink';
}

// Returns a textual color definition that is understood by cchip for a specific ink
//
function pcGetInkDefinitionWithTintAsText( inInk, inTint ) {

	// Look at the ink name and differentiate between the different possibilities - for CMYK the tint
	// is taken as the actual value
	if (inInk.name === 'Cyan') return '-cchip-cmyk( inTint, 0, 0, 0)';
	if (inInk.name === 'Magenta') return '-cchip-cmyk( 0, inTint, 0, 0)';
	if (inInk.name === 'Yellow') return '-cchip-cmyk( 0, 0, inTint, 0)';
	if (inInk.name === 'Black') return '-cchip-cmyk( 0, 0, 0, inTint)';

	// Coming here we have a spot color. Look at the alternate name to decide what kind of model. In each
	// case return the spot color value including a tint
	if (inInk.alternatename === 'cmyk') {
		return '-cchip-cmyk( "' + inInk.name + '", ' + inInk.alternatecomps.join( ', ') + ',' + inTint + ')'; 
	}
	if (inInk.alternatename === 'lab') {

		return '-cchip-lab( "' + inInk.name + '", ' + inInk.alternatecomps.join( ', ') + ',' + inTint + ')'; 
	}

	// Unknown case, just return something wrong and obviously wrong
	return 'pink';
}



//-------------------------------------------------------------------------------------------------
// RESIZING THE GENERATED PAGES
//-------------------------------------------------------------------------------------------------

// Adjusts the size of the HTML page to the size of the mediabox of the given page (0-based)
// of the PDF document being processed.
// Example: pcAdjustDocumentSizeToMediabox( 0 )
//
// inPageNumber: the 0-based page number from which to take the size
//
function pcAdjustDocumentSizeToMediabox( inPageNumber ) {

	// Get the page object
	var thePage = cals_doc_info.pages[inPageNumber];
	var theMediaboxWidth = thePage.mediabox[2]; 
	var theMediaboxHeight = thePage.mediabox[3]; 

	// Add a new style object to play with
	var cssPagedMedia = (function () {
    	var style = document.createElement('style');
    	document.head.appendChild(style);
    	return function (rule) {
        	style.innerHTML = rule;
    	};
	}());

	// We're actually going to add a margin and then use the pdfChip cropbox feature to get
	// the correct size
	var theMargin = 5;

	// Change the size
	cssPagedMedia('@page {size: ' + (theMediaboxWidth + theMargin) + 'pt ' + (theMediaboxHeight + theMargin) + 'pt; ' + 
				  '-cchip-cropbox: 0 ' + theMargin + 'pt ' + theMediaboxWidth + 'pt ' + theMediaboxHeight + 'pt;' +
				  '}');
}

// Adjusts the size of the HTML page to the size of the specified element
// Example: pcAdjustDocumentSizeToHtmlElement( "#container" )
//
// ElementID: the JQuery identifier for the object you want to take the size from.
//
function pcAdjustDocumentSizeToHtmlElement( inElementID ) {

	// Get the width and height of the element in points
	var theElementWidth = $(inElementID).width() * 0.75 + 12;
	var theElementHeight = $(inElementID).height() * 0.75 + 6;

	// Add a new style object to play with
	var cssPagedMedia = (function () {
    	var style = document.createElement('style');
    	document.head.appendChild(style);
    	return function (rule) {
        	style.innerHTML = rule;
    	};
	}());

	// Change the size
	cssPagedMedia('@page {size: ' + theElementWidth + 'pt ' + theElementHeight + 'pt;}');
}

// Adjusts the size of the HTML page to the given size in points
// Example: pcAdjustDocumentSizeToSizeInPoints( 720, 720 )
//
// inWidth: the desired width (in points)
// inHeight: the desired height (in points)
//
function pcAdjustDocumentSizeToSizeInPoints( inWidth, inHeight ) {

	// Add a new style object to play with
	var cssPagedMedia = (function () {
    	var style = document.createElement('style');
    	document.head.appendChild(style);
    	return function (rule) {
        	style.innerHTML = rule;
    	};
	}());

	// Change the size
	cssPagedMedia('@page {size: ' + Math.ceil( inWidth ) + 'pt ' + Math.ceil( inHeight ) + 'pt;}');
}

// Adjusts the size of the HTML page to the given size in points and set a trimbox
// Example: pcAdjustDocumentSizeToSizeInPointsWithTrimbox( 720, 720, 10, 10, 700, 700 )
//
// inWidth: the desired width (in points)
// inHeight: the desired height (in points)
// inTrimboxLeft: the left of the set trimbox (in points)
// inTrimboxTop: the top of the set trimbox (in points)
// inTrimboxWidth: the width of the set trimbox (in points)
// inTrimboxHeight: the height of the set trimbox (in points)
//
function pcAdjustDocumentSizeToSizeInPointsWithTrimbox( inWidth, inHeight, inTrimboxLeft, inTrimboxTop, inTrimboxWidth, inTrimboxHeight ) {

	// Add a new style object to play with
	var cssPagedMedia = (function () {
    	var style = document.createElement('style');
    	document.head.appendChild(style);
    	return function (rule) {
        	style.innerHTML = rule;
    	};
	}());

	// Change the size
	cssPagedMedia('@page {size: ' + Math.ceil( inWidth ) + 'pt ' + Math.ceil( inHeight ) + 'pt; ' +
				  '-cchip-trimbox: ' + inTrimboxLeft + 'pt ' + inTrimboxTop + 'pt ' + 
				  inTrimboxWidth + 'pt ' + inTrimboxHeight + 'pt;}');
}

// Adjusts the size of the HTML page to the given size in points and set a trimbox
// Example: pcAdjustDocumentSizeToSizeInPointsWithTrimboxAndBleedbox( 720, 720, 10, 10, 700, 700, 5 )
//
// inWidth: the desired width (in points)
// inHeight: the desired height (in points)
// inTrimboxLeft: the left of the set trimbox (in points)
// inTrimboxTop: the top of the set trimbox (in points)
// inTrimboxWidth: the width of the set trimbox (in points)
// inTrimboxHeight: the height of the set trimbox (in points)
// inBleedSize: the desired bleed (in points)
//
function pcAdjustDocumentSizeToSizeInPointsWithTrimboxAndBleedbox( inWidth, inHeight, inTrimboxLeft, inTrimboxTop, inTrimboxWidth, inTrimboxHeight, inBleedSize ) {

	// Add a new style object to play with
	var cssPagedMedia = (function () {
    	var style = document.createElement('style');
    	document.head.appendChild(style);
    	return function (rule) {
        	style.innerHTML = rule;
    	};
	}());

	// Change the size
	cssPagedMedia('@page {size: ' + Math.ceil( inWidth ) + 'pt ' + Math.ceil( inHeight ) + 'pt; ' +
				  '-cchip-trimbox: ' + inTrimboxLeft + 'pt ' + inTrimboxTop + 'pt ' + 
				  inTrimboxWidth + 'pt ' + inTrimboxHeight + 'pt; ' +
				  '-cchip-bleedbox: ' + (inTrimboxLeft-inBleedSize) + 'pt ' + (inTrimboxTop-inBleedSize) + 'pt ' + 
				  (inTrimboxWidth+(inBleedSize*2)) + 'pt ' + (inTrimboxHeight+(inBleedSize*2)) + 'pt; }');
}



//-------------------------------------------------------------------------------------------------
// POSITIONING
//-------------------------------------------------------------------------------------------------

// An enum to represent the different anchor points
//
var pcAnchorPoints = {
	leftTop: 		{ value: 1, x: 'left', y: 'top' },
	centerTop: 		{ value: 2, x: 'center', y: 'top' },
	rightTop: 		{ value: 3, x: 'right', y: 'top' },
	leftMiddle: 	{ value: 4, x: 'left', y: 'middle' },
	centerMiddle: 	{ value: 5, x: 'center', y: 'middle' },
	rightMiddle: 	{ value: 6, x: 'right', y: 'middle' },
	leftBottom: 	{ value: 7, x: 'left', y: 'bottom' },
	centerBottom: 	{ value: 8, x: 'center', y: 'bottom' },
	rightBottom: 	{ value: 9, x: 'right', y: 'bottom' }
};
Object.freeze(pcAnchorPoints);

// Positions the given element on the page
// ElementID: the CSS identifier for the object we want to move. Anything supported by jQuery is
//            supported here.
// ElementAnchor: the anchor you want to match up on the element.
// Pagenumber: the page about which we're excited
// Pagebox: the pagebox you want to match up to.
// PageboxAnchor: the anchor you want to match up on the pagebox.
// OffsetX: an additional horizontal offset (positive is to the right) between the anchor points of
//          the object and the pagebox. Specified in pt.
// OffsetY: an additional vertical offset (positive is to the bottom) between the anchor points of
//          the object and the pagebox. Specified in pt.
//
function pcPositionElement( inElementID, inElementAnchor, inPageNumber, inPagebox, inPageboxAnchor, inOffsetX, inOffsetY ) {

	// Start by copying the initial offsets - this will be adjusted to provide anchoring
	var theXPosition = inOffsetX;
	var theYPosition = inOffsetY;

	// Get the information for the anchor box
	var theAnchorboxInfo = pcGetPageboxInfo( inPageNumber, inPagebox );

	// Adjust for pagebox anchoring
	if (inPageboxAnchor.x === 'left') {
		theXPosition += theAnchorboxInfo[0];
	} else if (inPageboxAnchor.x === 'center') {
		theXPosition += theAnchorboxInfo[6];
	} else {
		theXPosition += theAnchorboxInfo[2];
	}
	if (inPageboxAnchor.y === 'top') {
		theYPosition += theAnchorboxInfo[1];

	} else if (inPageboxAnchor.y === 'middle') {
		theYPosition += theAnchorboxInfo[7];
	} else {
		theYPosition += theAnchorboxInfo[3];
	}

	// Get the width and height of the element
	var theElementWidth = $(inElementID).innerWidth() * 0.75;
	var theElementHeight = $(inElementID).innerHeight() * 0.75;

	// Adjust for element anchoring
	if (inElementAnchor.x === 'center') {
		theXPosition -= (theElementWidth / 2);
	} else if (inElementAnchor.x === 'right') {
		theXPosition -= theElementWidth;
	}
	if (inElementAnchor.y === 'middle') {
		theYPosition -= (theElementHeight / 2);
	} else if (inElementAnchor.y === 'bottom') {
		theYPosition -= theElementHeight;
	}

	// Take the final position and adjust the position of the object
	$(inElementID).css({
		position: 'absolute',
		left: theXPosition + 'pt',
		top: theYPosition + 'pt'
	});
}

//-------------------------------------------------------------------------------------------------
// BARCODES
//-------------------------------------------------------------------------------------------------

// Set the correct value to the barcode represented by the given object ID
//
function pcUpdateBarcodeData( inElementID, inValue ) {

	// Find the object and its data member and set the value attribute
	$(inElementID).find('param[name=data]').attr('value', inValue);

	// In order to update the barcode, we need to detach and reattach it
	var theParent = $(inElementID).parent();
	var theBarcode = $(inElementID).detach();
	theParent.append( theBarcode );
}



















