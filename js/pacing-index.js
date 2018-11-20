//
// TODO: set up query params
// TODO: format and post pacing info in setWeek
// TODO: refactor for query params and generalization
// TODO: play with demo announcement slides for size and such
// TODO: commonize identification of current week for each start date and the start/end date pairings
// TODO: include color-coding and key (or similar) in nav section
// TODO: pretty up formatting
// TODO: make pacing info toggle-able
// TODO: make size of announcements iframe configurable
// TODO: make configuration tool to generate embeddable code for this "package"
//
const app = function () {
	const page = {
		body: null,
    notice: null,
    contents: null,
    navigation: null,
    announcements: null,
    pacing: null
	};
	
	const settings = {
		coursekey: null,
    numweeks: null,
    weeknum: null,
    urlAnnouncementsBase: null,
    announcementsWidth: null,
    announcementsHeight: null
	};
	
  var fullPacingInfo = null;
  
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.body = document.getElementsByTagName('body')[0];
    page.notice = document.getElementById('notice');
		page.contents = document.getElementById('contents');
    page.navigation = document.getElementById('navigation');
    page.announcements = document.getElementById('announcements');
    page.pacing = document.getElementById('pacing');						
		
		_setNotice('initializing...');

		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		} else {
			_setNotice('');
      _getPacingInfo(settings.coursekey, settings.numweeks, _setNotice, _processPacingInfo);
		}
  }
	
  function _processPacingInfo(jsonData) {
    fullPacingInfo = jsonData;
    _renderPacingIndex();
  }
  
	//-------------------------------------------------------------------------------------
	// query params:
  //
  //  coursekey: short course name, e.g. fpa, javascript
  //  numweeks:  10, 12, or 18
	//-------------------------------------------------------------------------------------
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

    // parameterize these
    settings.weeknum = 1;
    settings.urlAnnouncementsBase = 'https://docs.google.com/presentation/d/e/2PACX-1vTLXCiT2X9QX71zuMly2wDhIt4aSIOS9KpXTOStvL6nw0o4V726dAyX0rPYPKlM-uO4ifln5PAoZ0dO/embed?rm=minimal&start=false&amp;loop=false&amp;delayms=3000;rm=minimal';
    settings.announcementsWidth = 600;
    settings.announcementsHeight = 450;

		return result;
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
  function _renderPacingIndex() {
    _renderNavigation();
    //_renderAnnouncements();
    //_renderPacingDetails();
    _setWeek(1);
  }
  
  function _renderNavigation() {
    for (var i = 1; i <= settings.numweeks; i++) {
      var elemNavButton = _makeButton(
        _navButtonId(i),
        'pidx-navbutton', 
        'week ' + i, 
        'support and pacing for week #' + i, 
        makeSetWeekFunction(i));
      page.navigation.appendChild(elemNavButton);
      if (i == 10) page.navigation.appendChild(document.createElement('br'));
    }  
  }
  
  function _navButtonId(weeknum) {
    return 'btnWeek' + weeknum;
  }

  function _renderAnnouncements() {
    page.announcements.width = settings.announcementsWidth;
    page.announcements.height = settings.announcementsHeight;
    page.announcements.frameborder = 0;
    page.announcements.allowfullscreen = true;
    page.announcements.mozallowfullscreen = true;
    page.announcements.webkitallowfullscreen = true;
    
    var newSrc = settings.urlAnnouncementsBase + '#' + settings.weeknum;
    page.announcements.src = newSrc;
  }
  
  function _renderPacingDetails() {
    var idTitle = 'pacingDetailsTitle';
    var idList = 'pacingDetailsList';
    var elemTitle = document.getElementById(idTitle);
    var elemList = document.getElementById(idList);
    if (elemTitle != null) elemTitle.parentNode.removeChild(elemTitle);
    if (elemList != null) elemList.parentNode.removeChild(elemList);
    
    var pacingWeek = fullPacingInfo.pacing[settings.weeknum];
    elemTitle = document.createElement('p');
    elemTitle.id = idTitle;
    elemTitle.innerHTML = 'Pacing for week #' + settings.weeknum;
    elemTitle.classList.add('pidx-pacingheader');
    page.pacing.appendChild(elemTitle);
    
    var unit = '**dummy**';
    elemList = document.createElement('dl');
    elemList.id = idList;
    
    for (var i = 0; i < pacingWeek.length; i++) {
      if (unit != pacingWeek[i].unit) {
        unit = pacingWeek[i].unit;
        var elemDefTitle = document.createElement('dt');
        elemDefTitle.innerHTML = unit;
        elemDefTitle.classList.add('pidx-pacingitemtitle');
        elemList.appendChild(elemDefTitle);
      }
      
      var elemDefItem = document.createElement('dd');
      elemDefItem.innerHTML = pacingWeek[i].item;
      elemDefItem.classList.add('pidx-pacingitem');
      if (pacingWeek[i].graded) elemDefItem.classList.add('pidx-pacinggraded');
      if (pacingWeek[i].progresscheck) elemDefItem.classList.add('pidx-progress-check');
      elemList.appendChild(elemDefItem);
    }
    
    page.pacing.appendChild(elemList);
  }
    
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------  
  function makeSetWeekFunction(weeknum) {
    return function() {
      _setWeek(weeknum); 
    }
  }
  
	function _setWeek(weeknum) {
    var selectedClass = 'pidx-navbuttonselected';
    
    settings.weeknum = weeknum;

    for (var i = 1; i <= settings.numweeks; i++) {
      var id = _navButtonId(i);
      var btn = document.getElementById(id);

      if (btn.classList.contains(selectedClass)) {
        btn.classList.remove(selectedClass);
      }
      if (i == settings.weeknum) {
        btn.classList.add(selectedClass);
      }
    }
    
    _renderAnnouncements();
    _renderPacingDetails();
  }
  
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
  
  function _formatDueDate(duedate) {
    var formattedDate = '';
    
    if (duedate != null && duedate != '') {
      var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      objDate = new Date(duedate);
      var dayofweek = objDate.getDay();
      var day = objDate.getDate() + 1;
      var month = objDate.getMonth() + 1;
      formattedDate = days[dayofweek] + ' ' + month + "/" + day;
    }
    
    return formattedDate;
  }
		
	return {
		init: init
 	};
}();