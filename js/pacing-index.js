//
// TODO: make configuration tool to generate BB embeddable code for this "package"
// TODO: add pop-up or similar for full pacing calendar
// TODO: create "home" page
//
const app = function () {
	const page = {
		body: null,
    notice: null,
    contents: null,
    navigation: null,
    announcements: null,
    tasksforweek: null,
    navbarlist: null
	};
	
	const settings = {
		coursekey: null,
    numweeks: null,
    weeknum: null,
    urlAnnouncementsBase: null,
    announcementsWidth: null,
    announcementsHeight: null,
    calendarSummary: null,
    instance: null
	};
	
  const termToWeeks = {
    "semester1": 18,
    "semester2": 18,
    "trimester1": 12,
    "trimester2": 12,
    "trimester3": 12,
    "summer": 10
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
    page.tasksforweek = document.getElementById('tasksforweek');    
    page.navbarlist = document.getElementById('navbarlist');
		
		_setNotice('initializing...');

		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		} else {
			_setNotice('');
      _getPacingInfo(settings.coursekey, settings.term, _setNotice, _processPacingInfo);
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
  //  term: semester1, semester2, trimester1, trimester2, trimester3, summer
  //  instance: optional integer indicating which of multiple instances on the page this is
	//-------------------------------------------------------------------------------------
	function _initializeSettings() {
		var result = false;

		var params = {};
		var urlParams = new URLSearchParams(window.location.search);
		params.coursekey = urlParams.has('coursekey') ? urlParams.get('coursekey') : null;
    params.term = urlParams.has('term') ? urlParams.get('term') : null;
    params.announce = urlParams.has('announce') ? urlParams.get('announce') : null;
    params.instance = urlParams.has('instance') ? urlParams.get('instance') : 1;   // optional - if not provided then assumed 1
    params.awidth = urlParams.has('awidth') ? urlParams.get('awidth') : 600;  // optional - if not provided then the default
    params.aheight = urlParams.has('aheight') ? urlParams.get('aheight') : 450;  // optional - if not provided then the default

		settings.coursekey = params.coursekey;
    settings.term = params.term;
    settings.numweeks = termToWeeks[settings.term];
		settings.urlAnnouncementsBase = params.announce + '&rm=minimal'; // rm parameter eliminates control bar from slides
    settings.instance = params.instance;
    settings.announcementsWidth = params.awidth;
    settings.announcementsHeight = params.aheight;
    //settings.urlAnnouncementsBase = 'https://docs.google.com/presentation/d/e/2PACX-1vTLXCiT2X9QX71zuMly2wDhIt4aSIOS9KpXTOStvL6nw0o4V726dAyX0rPYPKlM-uO4ifln5PAoZ0dO/embed?rm=minimal&start=false&amp;loop=false&amp;delayms=3000;rm=minimal';
    
    if (params.coursekey != null && params.term != null && params.announce != null) {
			result = true;
		}

		return result;
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
  function _renderPacingIndex() {
    _calculateCurrentWeeks();
    _renderNavigation();
    _setWeek(1);
  }
  
  function _renderNavigation() {
    var apCourse = fullPacingInfo.pacinginfo.apcourse;
    var start1Info = settings.calendarSummary.start1;
    var start2Info = settings.calendarSummary.start2;
    var start3Info = settings.calendarSummary.start3;
    
    //-- make navbar item for "home" page
    page.navbarlist.appendChild(_makeNavbarItem('home00', '', 'overview of this week-by-week pacing tool', 'home <span class="sr-only">(current)</span>'));
    
    //-- make navbar item for current week corresponding to each start
    var title = '';
    if (!apCourse) {
      title = 'start1: ' + _formatPacingDate(start1Info.startDate) + '-' + _formatPacingDate(start1Info.endDate);
      page.navbarlist.appendChild(_makeNavbarItem(_navItemId(start1Info.currentWeekNum), '', title, 'week ' + start1Info.currentWeekNum));
    }
    if (apCourse) {
      page.navbarlist.appendChild(_makeNavbarItem(_navItemId(start2Info.currentWeekNum), '', 'current week', 'week ' + start2Info.currentWeekNum));
    } else {
      title = 'start2: ' + _formatPacingDate(start2Info.startDate) + '-' + _formatPacingDate(start2Info.endDate);
      page.navbarlist.appendChild(_makeNavbarItem(_navItemId(start2Info.currentWeekNum), '', title, 'week ' + start2Info.currentWeekNum));
    }
    if (!apCourse) {
      title = 'start3: ' + _formatPacingDate(start3Info.startDate) + '-' + _formatPacingDate(start3Info.endDate);
      page.navbarlist.appendChild(_makeNavbarItem(_navItemId(start3Info.currentWeekNum), '', title, 'week ' + start3Info.currentWeekNum));
    }
    
    //-- make navbar drop down item for all weeks  
     page.navbarlist.appendChild(_makeNavbarDropdown());
     
    //-- add event handlers
    $(".nav-link").each( function() {
      if (this.id != 'navbarDropdown') {
        this.addEventListener('click', _makeNavlinkHandler(this)); 
      }
    });

    $(".dropdown-item").each( function() {
      this.addEventListener('click', _makeNavlinkHandler(this)); 
    });
  }
  
  function _makeNavbarItem(id, classtext, title, innerHTML) {
    var elemListItem = document.createElement('li');
    elemListItem.classList.add('navitem');
    
    var elemAnchor = document.createElement('a');
    elemAnchor.classList.add('nav-link');
    if (classtext != '') elemAnchor.classList.add(classtext);
    elemAnchor.id = id;
    elemAnchor.title = title;
    elemAnchor.innerHTML = innerHTML;
    elemAnchor.href = '#';
    elemListItem.appendChild(elemAnchor);
    
    return elemListItem;
  }
  
  function _makeNavbarDropdown() {
     var elemDropdown = document.createElement('li');
     elemDropdown.classList.add('nav-item');
     elemDropdown.classList.add('dropdown');
     
     var elemAnchor = document.createElement('a');
     elemAnchor.id = 'navbarDropdown'
     elemAnchor.classList.add('nav-link');
     elemAnchor.classList.add('dropdown-toggle');
     elemAnchor.title = 'all weeks';
     elemAnchor.href = '#';
     elemAnchor.setAttribute('role', 'button');
     elemAnchor.setAttribute('data-toggle', 'dropdown');
     elemAnchor.setAttribute('aria-haspopup', 'true');
     elemAnchor.setAttribute('aria-expanded', 'false');
     
     var elemDiv = document.createElement('div');
     elemDiv.classList.add('dropdown-menu');
     elemDiv.setAttribute('aria-labelledby', 'navbarDropdown');
     for (var i = 0; i < settings.numweeks; i++) {
       elemDiv.appendChild(_makeNavbarDropdownItem(_navItemId(i+1), '', 'week ' + (i+1) ));
     }
     
     elemDropdown.appendChild(elemAnchor);
     elemDropdown.appendChild(elemDiv);

     return elemDropdown;
  }
  
  function _makeNavbarDropdownItem(id, classtext, innerHTML) {
    var elemAnchor = document.createElement('a')
    elemAnchor.id = id;
    elemAnchor.classList.add('dropdown-item');
    if (classtext != '') elemAnchor.classList.add(classtext);
    elemAnchor.innerHTML = innerHTML;
    elemAnchor.href = '#';
    
    return elemAnchor;
  }
  
  function _navItemId(weeknum) {
    return 'navweek' + ('00' + weeknum).slice(-2);
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
    var apCourse = fullPacingInfo.pacinginfo.apcourse;
    var calendar = fullPacingInfo.pacingcalendar;
    var idTitle = 'tasksforweekTitle';
    var idList = 'tasksforweekDetails';
    var elemTitle = document.getElementById(idTitle);
    var elemList = document.getElementById(idList);
    if (elemTitle != null) elemTitle.parentNode.removeChild(elemTitle);
    if (elemList != null) elemList.parentNode.removeChild(elemList);
    
    var pacingWeek = fullPacingInfo.pacinginfo.pacing[settings.weeknum];
    elemTitle = document.createElement('div');
    elemTitle.id = idTitle;

    elemTitle.innerHTML = 'Tasks for week #' + settings.weeknum;
    
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
        
      if (pacingWeek[i].graded) {
        var elemDefDueDate = document.createElement('span');
        elemDefDueDate.classList.add('pidx-duedate');
        if (apCourse) {
          elemDefDueDate.innerHTML = ' (due ' + _formatDueDate(pacingWeek[i].duedate) + ')';
        } else {
          elemDefDueDate.innerHTML = ' (graded)';
        }
        elemDefItem.appendChild(elemDefDueDate);  
      }
  
      if (pacingWeek[i].progresscheck) elemDefItem.classList.add('pidx-progress-check');
      elemList.appendChild(elemDefItem);
    }

    elemTitle.classList.add('pidx-pacing-title');
    elemList.classList.add('pidx-pacing-info');
    page.tasksforweek.appendChild(elemTitle);
    page.tasksforweek.appendChild(elemList);
  }
    
  //-------------------------------------------------------------------------
  // determine what week number(s) based on course type and pacing calendar
	//-------------------------------------------------------------------------
  function _calculateCurrentWeeks() {
    var calendar = fullPacingInfo.pacingcalendar;
    var now = new Date();
    
    settings.calendarSummary = {};
    
    for (var i = 0; i < 3; i++) {
      var summary = {};
      var key = 'start' + (i + 1);
      var origSummary = calendar[key];
      var numWeeks = termToWeeks[origSummary.term];
      
      var foundWeek = null;
      var foundWeekNum = null;
      for (var week = numWeeks; week > 0 && foundWeek == null; week--) {
        var weekKey = 'week' + week;
        var weekData = new Date(origSummary[weekKey]);
        if (now >= weekData) {
          foundWeek = weekData;
          foundWeekNum = week;
        }
      }
      
      summary.startDate = origSummary.startdate;
      summary.endDate = origSummary.enddate;
      summary.currentWeek = foundWeek;
      summary.currentWeekNum = foundWeekNum;
      
      settings.calendarSummary[key] = summary;
    }
  }  
	
  //--------------------------------------------------------------------------
  // handlers
	//--------------------------------------------------------------------------
  function _makeNavlinkHandler(e) {
    return function() {
      _navlinkHandler(parseInt(e.id.slice(-2)));
    };
  }
  
  function _navlinkHandler(weeknum) {
    if (weeknum == 0) {
      console.log('handle home page');
    } else {
      _setWeek(weeknum);
    }
  }
  
	function _setWeek(weeknum) {
    settings.weeknum = weeknum;
    
    _renderAnnouncements();
    _renderPacingDetails();
    _postHeightChangeMessage();
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
  
  function _formatDueDate(duedate) {
    var formattedDate = '';
    
    if (duedate != null && duedate != '') {
      var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      objDate = new Date(duedate);
      var dayofweek = objDate.getDay();
      var day = objDate.getDate();
      var month = objDate.getMonth() + 1;
      formattedDate = days[dayofweek] + ' ' + month + "/" + day;
    }
    
    return formattedDate;
  }
  
  function _formatPacingDate(pacingdate) {
    var formattedDate = '';
    
    if (pacingdate != null & pacingdate != '') {
      objDate = new Date(pacingdate);
      var day = objDate.getDate();
      var month = objDate.getMonth() + 1;
      formattedDate = month + "/" + day;
    }
    
    return formattedDate;
  }
  
  	
	//-----------------------------------------------------------------------------------
	// iframe responsive height - post message to parent (if in an iframe) to resizeBy
	//-----------------------------------------------------------------------------------
	function _postHeightChangeMessage() {
		var msg = document.body.scrollHeight + '-' + 'PacingIndex' + '-' + settings.instance;
		console.log('posting to parent: ' + msg);
		window.parent.postMessage(msg, "*");
	}
		
	return {
		init: init
 	};
}();