//
//
const app = function () {
	const PAGE_TITLE = 'Pacing info'
		
	const page = {
		body: null,
    notice: null,
    contents: null
	};
	
	const settings = {
		coursekey: null,
    numweeks: null
	};
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.body = document.getElementsByTagName('body')[0];
    page.notice = document.getElementById('notice');
		page.contents = document.getElementById('contents');
						
		
		_setNotice('initializing...');
		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		} else {
			_setNotice('');
      _getPacingInfo(settings.coursekey, settings.numweeks, _setNotice, _renderPage);
		}
	}
	
	//-------------------------------------------------------------------------------------
	// query params:
	//------------------------------------------------  -------------------------------------
	function _initializeSettings() {
		var result = false;

		var params = {};
		var urlParams = new URLSearchParams(window.location.search);
		params.coursekey = urlParams.has('coursekey') ? urlParams.get('coursekey') : null;
    params.numweeks = urlParams.has('numweeks') ? urlParams.get('numweeks') : null;

		settings.coursekey = params.coursekey;
    settings.numweeks = params.numweeks;
		
		if (params.coursekey != null && params.numweeks != null) {
			result = true;
		}

		return result;
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
	function _renderPage() {
    var html = ''
    
    html += 'Parameters' + '<br>';
    html += 'coursekey = ' + settings.coursekey + '<br>';
    html += 'numweeks = ' + settings.numweeks + '<br>';
    
    page.contents.innerHTML = html;
	}	
		
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------
	
	//---------------------------------------
	// utility functions
	//----------------------------------------
	function _setNotice (label) {
		page.notice.innerHTML = label;

		if (label == '') {
			page.notice.style.display = 'none'; 
			page.notice.style.visibility = 'hidden';
		} else {
			page.notice.style.display = 'block';
			page.notice.style.visibility = 'visible';
		}
	}
		
	function _makeButton(id, className, label, tooltip, listener) {
		var btn = document.createElement('button');
		btn.id = id;
		btn.classList.add(className);
		btn.innerHTML = label;
		btn.title = tooltip;
		btn.addEventListener('click', listener, false);
		return btn;
	}
	
	function displayMenu(command) {
		page.menu.style.display = (command == "show" ? "block" : "none");
		page.menuitem.innerHTML = settings.contextmenuitem.name;
	};

	function setMenuPosition(left, top) {
		page.menu.style.left = left.toString() + 'px';
		page.menu.style.top = top.toString() + 'px';
		displayMenu('show');
	};		
		
	return {
		init: init
 	};
}();