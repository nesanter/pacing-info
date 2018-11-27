//
// TODO: make pacing info toggle-able (?)
// TODO: make configuration tool to generate BB embeddable code for this "package"
//
const app = function () {
	const page = {
		body: null,
    notice: null,
    contents: null,
    navigation: null,
    navigationkey: null,
    announcements: null,
    pacing: null
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
    page.navigationkey = document.getElementById('navigationkey');
    page.announcements = document.getElementById('announcements');
    page.pacing = document.getElementById('pacing');						
		
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

    // ?? parameterize these
    settings.weeknum = 1;  // announcement week displayed on load

		return result;
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
  function _renderPacingIndex() {
    _calculateCurrentWeeks();
    _renderNavigation();
    _renderNavigationKey();
    _setWeek(1);
  }
  
  function _renderNavigation() {
    var apCourse = fullPacingInfo.pacinginfo.apcourse;
    var start1Info = settings.calendarSummary.start1;
    var start2Info = settings.calendarSummary.start2;
    var start3Info = settings.calendarSummary.start3;
    
    for (var i = 1; i <= settings.numweeks; i++) {
      var elemNavButton = _makeButton(
        _navButtonId(i),
        'pidx-navbutton', 
        'week ' + i, 
        '', 
        makeSetWeekFunction(i));
      
      if (i == start1Info.currentWeekNum && !apCourse) {
        elemNavButton.classList.add('pidx-nav-start1')
        elemNavButton.title = 'start ' + _formatPacingDate(start1Info.startDate) + ', end ' + _formatPacingDate(start1Info.endDate);
      }
      if (i == start2Info.currentWeekNum) {
        elemNavButton.classList.add('pidx-nav-start2')
        if (!apCourse) elemNavButton.title = 'start ' + _formatPacingDate(start2Info.startDate) + ', end ' + _formatPacingDate(start2Info.endDate);
      }
      if (i == start3Info.currentWeekNum && !apCourse) {
        elemNavButton.classList.add('pidx-nav-start3')
        elemNavButton.title = 'start ' + _formatPacingDate(start3Info.startDate) + ', end ' + _formatPacingDate(start3Info.endDate);
      }
      
      page.navigation.appendChild(elemNavButton);
      if (i == 10) page.navigation.appendChild(document.createElement('br'));
    }  
  }
  
  function _navButtonId(weeknum) {
    return 'btnWeek' + weeknum;
  }
  
  function _renderNavigationKey() {
    if (fullPacingInfo.pacinginfo.apcourse) {
      page.navigationkey.style.display = 'none';
      return;
    }
    
    page.navigationkey.innerHTML = 'Pacing key: ';
    var startInfo = [start1Info = settings.calendarSummary.start1, settings.calendarSummary.start2, settings.calendarSummary.start3];
    var keyClass = ['pidx-nav-start1', 'pidx-nav-start2', 'pidx-nav-start3'];
    
    for (var i = 0; i < 3; i++) {
      var elemKey = document.createElement('span');
      elemKey.innerHTML = 'start ' + _formatPacingDate(startInfo[i].startDate) + ', end ' + _formatPacingDate(startInfo[i].endDate);
      elemKey.style.paddingRight = '10px';
      //if (i < 2) elemKey.innerHTML += '<br>';
      elemKey.classList.add(keyClass[i]);
      page.navigationkey.appendChild(elemKey);
    }
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
    var idTitle = 'pacingDetailsTitle';
    var idList = 'pacingDetailsList';
    var elemTitle = document.getElementById(idTitle);
    var elemList = document.getElementById(idList);
    if (elemTitle != null) elemTitle.parentNode.removeChild(elemTitle);
    if (elemList != null) elemList.parentNode.removeChild(elemList);
    
    var pacingWeek = fullPacingInfo.pacinginfo.pacing[settings.weeknum];
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
    
    page.pacing.appendChild(elemList);
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
		
	function _makeButton(id, className, label, tooltip, listener) {
		var btn = document.createElement('button');
		btn.id = id;
		btn.classList.add(className);
		btn.innerHTML = label;
		btn.title = tooltip;
		btn.addEventListener('click', listener, false);
		return btn;
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