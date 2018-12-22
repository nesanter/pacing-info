//
//
const app = function () {
  const baseURLPacingIndex = 'https://ktsanter.github.io/pacing-info/pacing-index.html';
  
	const page = {
		body: null,
    course: null,
    term: null,
    announcementslink: null,
    embedbutton: null,
    embednotice: null
	};
	
	const settings = {
	};
	
  const courses = {
    "javascript": "Advanced Web Design: JavaScript",
    "apcsp1": "AP Computer Science Principles (S1)",
    "apcsp2": "AP Computer Science Principles (S2)"
  }
  
  const terms = {
    "semester1": "semester 1",
    "semester2": "semester 2",
    "trimester1": "trimester 1",
    "trimester2": "trimester 2",
    "trimester3": "trimester 3",
    "summer": "summer"
  };
  
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.body = document.getElementsByTagName('body')[0];
    page.course = document.getElementById('selCourse');
    page.term = document.getElementById('selTerm');
    page.announcementslink = document.getElementById('txtAnnouncementsLink');
    page.embedbutton = document.getElementById('btnCreateEmbed');
    page.embednotice = document.getElementById('embedNotice');
    
    _loadCourseSelections(page.course);
    _loadTermSelections(page.term);
    _initializeLinkField(page.announcementslink);
    _setEmbedNotice('');
    
    page.course.addEventListener('change', _specificationChangeHandler);
    page.term.addEventListener('change', _specificationChangeHandler);
    page.announcementslink.addEventListener('input', _specificationChangeHandler);
    page.embedbutton.addEventListener('click', _embedButtonHandler);
  }
  
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
  function _loadCourseSelections(elemCourses) {
    for (var key in courses) {
      var elemOption = document.createElement('option');
      elemOption.id = key;
      elemOption.innerHTML = courses[key];
      elemCourses.appendChild(elemOption);
    }
  }
  
  function _loadTermSelections(elemTerms) {
    for (var key in terms) {
      var elemOption = document.createElement('option');
      elemOption.id = key;
      elemOption.innerHTML = terms[key];
      elemTerms.appendChild(elemOption);
    }
  }
  
  function _initializeLinkField(elemLinkText) {
    elemLinkText.placeholder = 'paste link here';
  }
  
  function _setEmbedNotice(msg) {
    page.embednotice.innerHTML = msg;
    
    if (msg == '') {
      page.embednotice.style.display = 'none';
    } else {
      page.embednotice.style.display = 'block';
    }
  }
  
  function _makeEmbedCode() {
    var coursekey = page.course.options[page.course.selectedIndex].id;
    var term = page.term.options[page.term.selectedIndex].id;  
    var slidelink = page.announcementslink.value.replace('/pub?', '/embed?');
    
    var embedCode = baseURLPacingIndex;
    embedCode += '?coursekey=' + coursekey;
    embedCode += '&term=' + term;
    embedCode += '&announce=' + slidelink;
    
    return embedCode;
  }
  
  //--------------------------------------------------------------------------
  // handlers
	//--------------------------------------------------------------------------
  function _specificationChangeHandler() {
    _setEmbedNotice('');
  }
  
  function _embedButtonHandler() {
    _copyStringToClipboard(_makeEmbedCode());
    _setEmbedNotice('embed code copied to clipboard');
  }
  
	//---------------------------------------
	// utility functions
	//----------------------------------------  
	function _copyStringToClipboard(string) {
    var idTextArea = 'temp_textarea_for_clipboard_copy';
    var elemTextArea = document.createElement('textarea');

    elemTextArea.id = idTextArea;
		elemTextArea.value = string;
		elemTextArea.style.display = 'block';
    page.body.appendChild(elemTextArea);
    
		elemTextArea.select();
		document.execCommand("Copy");
		elemTextArea.selectionEnd = elemTextArea.selectionStart;
		elemTextArea.style.display = 'none';
    
    elemTextArea.parentNode.removeChild(elemTextArea);
	}
  
	return {
		init: init
 	};
}();