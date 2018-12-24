//
//
const app = function () {
  const baseURLPacingIndex = 'https://ktsanter.github.io/pacing-info/pacing-index.html';
  const resizerScript = 'https://drive.google.com/uc?id=1DtVaRfly5LQtGT-jIOFQZ3KiKdCPy7Zn';
  
	const page = {
		body: null,
    course: null,
    term: null,
    announcementslink: null,
    instance: null,
    linkbutton: null,
    embedbutton: null,
    embednotice: null
	};
	
	const settings = {
	};
	
  const courses = {
    "game_design": "Advanced Programming: Game Design & Animation",
    "javascript": "Advanced Web Design: JavaScript",
    "apcsp1": "AP Computer Science Principles (S1)",
    "apcsp2": "AP Computer Science Principles (S2)",
    "html_css": "Basic Web Design: HTML & CSS",
    "digital_literacy": "Digital Literacy & Programming",
    "fpb": "Foundations of Programming B"
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
    page.instance = document.getElementById('numInstance');
    page.linkbutton = document.getElementById('btnCreateLink');
    page.embedbutton = document.getElementById('btnCreateEmbed');
    page.embednotice = document.getElementById('embedNotice');
    
    _loadCourseSelections(page.course);
    _loadTermSelections(page.term);
    _initializeLinkField(page.announcementslink);
    _setEmbedNotice('');
    
    page.course.addEventListener('change', _specificationChangeHandler);
    page.term.addEventListener('change', _specificationChangeHandler);
    page.announcementslink.addEventListener('input', _specificationChangeHandler);
    page.instance.addEventListener('input', _specificationChangeHandler);
    page.linkbutton.addEventListener('click', _linkButtonHandler);
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
  
  function _makeLinkCode() {
    var coursekey = page.course.options[page.course.selectedIndex].id;
    var term = page.term.options[page.term.selectedIndex].id;  
    var slidelink = page.announcementslink.value.replace('/pub?', '/embed?');
    var instance = page.instance.value;
    
    var linkCode = baseURLPacingIndex;
    linkCode += '?instance=' + instance;
    linkCode += '&coursekey=' + coursekey;
    linkCode += '&term=' + term;
    linkCode += '&announce=' + slidelink;
    
    return linkCode;
  }
  
  function _makeEmbedCode() {
    var linkCode = _makeLinkCode();
    var instance = page.instance.value;
    
    var embedCode = '<p>';
    embedCode += '<script type="text/javascript" src="' + resizerScript + '"></script>';
    embedCode += '</p>';
    
    embedCode += '<p>';
    embedCode += '<iframe id="iframe-pacingindex' + instance + '"';
    embedCode += ' width="100%"';
    embedCode += ' height="240"';
    embedCode += ' src="' + linkCode + '"';
    embedCode += ' frameborder="0"';
    embedCode += ' allowfullscreen="true"';
    embedCode += ' mozallowfullscreen="true"';
    embedCode += ' webkitallowfullscreen="true"';
    embedCode += '>';
    embedCode += '</iframe>';
    embedCode += '</p>';

    return embedCode;
  }
  
  //--------------------------------------------------------------------------
  // handlers
	//--------------------------------------------------------------------------
  function _specificationChangeHandler() {
    _setEmbedNotice('');
  }
  
  function _linkButtonHandler() {
    _copyStringToClipboard(_makeLinkCode());
    _setEmbedNotice('link copied to clipboard');
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