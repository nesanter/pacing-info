//
// TODO: clean up and refactor
//
const app = function () {
	const page = {
		body: null,
    notice: null,
    contents: null,
    navigation: null,
    announcements: null,
    tasksforweek: null,
    navbarlist: null,
    calendar: null
	};
	
	const settings = {
		coursekey: null,
    numweeks: null,
    weeknum: null,
    urlAnnouncementsBase: null,
    announcementsWidth: null,
    announcementsHeight: null,
    calendarSummary: null,
    instance: null,
    currentDate: null
	};
	
  const termToWeeks = {
    "semester1": 18,
    "semester2": 18,
    "trimester1": 12,
    "trimester2": 12,
    "trimester3": 12,
    "summer": 10
  };

  const pacingCalendarLink = 'https://ktsanter.github.io/pacing-info/pacing-calendar.html';  
  const pacingIndexMenuLink = 'https://drive.google.com/open?id=172L_BNdFQ90jsBvfFTMaeiQ1jP3zGgsQ';
  const pacingIndexMenuLinkAP = 'https://drive.google.com/open?id=11qDWqfUHmJK_oZV0EXkuXAv14euIwjMd';
  const pacingIndexMenuImage = 'https://drive.google.com/uc?id=172L_BNdFQ90jsBvfFTMaeiQ1jP3zGgsQ';
  const pacingIndexMenuImageAP = 'https://drive.google.com/uc?id=11qDWqfUHmJK_oZV0EXkuXAv14euIwjMd';
  const pacingIndexFindingEndDateLink = 'https://drive.google.com/open?id=1HIl_0nFL3-9lOJ-cl3KMiOKaU0Lcsvpe';
  const pacingIndexFindingEndDateImage = 'https://drive.google.com/uc?id=1HIl_0nFL3-9lOJ-cl3KMiOKaU0Lcsvpe';
    
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
    page.calendar = document.getElementById('calendar');
		
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
  //  date: override for current date (just for testing)
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
    params.date = urlParams.has('date')? new Date(urlParams.get('date')) : new Date();

		settings.coursekey = params.coursekey;
    settings.term = params.term;
    settings.numweeks = termToWeeks[settings.term];
		settings.urlAnnouncementsBase = params.announce + '&rm=minimal'; // rm parameter eliminates control bar from slides
    settings.instance = params.instance;
    settings.announcementsWidth = params.awidth;
    settings.announcementsHeight = params.aheight;
    settings.currentDate = params.date;
       
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
    _loadPacingCalendar();
    _setWeek(0);
  }
  
  function _renderNavigation() {
    var apCourse = fullPacingInfo.pacinginfo.apcourse;
    var start1Info = settings.calendarSummary.start1;
    var start2Info = settings.calendarSummary.start2;
    var start3Info = settings.calendarSummary.start3;
    var startAPInfo = settings.calendarSummary.startAP;
    
    //-- make navbar item for "home" page
    page.navbarlist.appendChild(_makeNavbarItem('home00', '', 'overview of this week-by-week pacing tool', 'home <span class="sr-only">(current)</span>'));
    
    //-- make navbar item for current week corresponding to each start
    var title = '';
    if (!apCourse) {
      title = 'start1: ' + _formatPacingDate(start1Info.startDate) + '-' + _formatPacingDate(start1Info.endDate);
      page.navbarlist.appendChild(_makeNavbarItem(_navItemId(start1Info.currentWeekNum), '', title, 'week ' + start1Info.currentWeekNum));
    }
    if (apCourse) {
      page.navbarlist.appendChild(_makeNavbarItem(_navItemId(startAPInfo.currentWeekNum), '', 'current week', 'week ' + startAPInfo.currentWeekNum));
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
    
    $("#homepage").hide();
    $("#announcements").show();
  }
  
  function _renderHomePage() {
    var elemHomePage = document.getElementById('homepage');
    elemHomePage.style.width = settings.announcementsWidth + 'px';
    elemHomePage.style.height = settings.announcementsHeight + 'px';

    var idTitle = 'homepageTitle';
    var idContents = 'homepageContents';
    var elemTitle = document.getElementById(idTitle);
    var elemContents = document.getElementById(idContents);
    if (elemTitle != null) elemTitle.parentNode.removeChild(elemTitle);
    if (elemContents != null) elemContents.parentNode.removeChild(elemContents);
    
    elemTitle = document.createElement('div');
    elemTitle.id = idTitle;
    elemContents = document.createElement('div', {id: idContents});
    elemContents.id = idContents;
   
    elemTitle.innerHTML = fullPacingInfo.pacinginfo.coursename;
    
    var elemContents1 = document.createElement('div');    
    elemContents1.innerHTML = 'This tool provides week-by-week pacing information for the course<br><br>' + 'According to the pacing guide: ';
    
    elemContents.appendChild(elemContents1);
    elemContents.appendChild(_makeHomePageWeekList());
    elemContents.appendChild(_renderHomePageMenuHelp());
    
    elemHomePage.appendChild(elemTitle);
    elemHomePage.appendChild(elemContents);
    
    $("#homepage").show();
    $("#announcements").hide();
  }
  
  function _makeHomePageWeekList() {
    var apCourse = fullPacingInfo.pacinginfo.apcourse;
    var start1Info = settings.calendarSummary.start1;
    var start2Info = settings.calendarSummary.start2;
    var start3Info = settings.calendarSummary.start3;
    var startAPInfo = settings.calendarSummary.startAP;
    var html;
    var atLeastOneHasntStarted = false;
    
    var elemList = document.createElement('ul');
    var elemListItem;

    if (!apCourse) {
      elemListItem = document.createElement('li');
      html = 'if the dates of your term are ' + _formatPacingDate(start1Info.startDate) + ' - ' + _formatPacingDate(start1Info.endDate) + ' then ';
      if (start1Info.notStarted) {
        html += 'your course hasn\'t started yet.';
        atLeastOneHasntStarted = true;
      } else {
        html += 'you should be on ' + _formatHomePageWeek(start1Info.currentWeekNum);
      }      
      elemListItem.innerHTML = html;
      elemList.appendChild(elemListItem);
    }
    
    elemListItem = document.createElement('li');
    if (apCourse) {
      html = 'you should be on ' + _formatHomePageWeek(startAPInfo.currentWeekNum);
    } else {
      html = 'if the dates of your term are ' + _formatPacingDate(start2Info.startDate) + ' - ' + _formatPacingDate(start2Info.endDate) + ' then ';
      if (start2Info.notStarted) {
        html += 'your course hasn\'t started yet.';
        atLeastOneHasntStarted = true;
      } else {
        html += 'you should be on ' + _formatHomePageWeek(start2Info.currentWeekNum);
      }      
    }
    elemListItem.innerHTML = html;
    elemList.appendChild(elemListItem);
    
    if (!apCourse) {
      elemListItem = document.createElement('li');
      html = 'if the dates of your term are ' + _formatPacingDate(start3Info.startDate) + ' - ' + _formatPacingDate(start3Info.endDate) + ' then ';
      if (start3Info.notStarted) {
        html += 'your course hasn\'t started yet.';
        atLeastOneHasntStarted = true;
      } else {
        html += 'you should be on ' + _formatHomePageWeek(start3Info.currentWeekNum);
      }      
      elemListItem.innerHTML = html;
      elemList.appendChild(elemListItem);
    }

    var elemContainer = elemList;
    
    if (atLeastOneHasntStarted) {
      var elemContainer = document.createElement('div');
      var elemNote = document.createElement('div');
      elemNote.innerHTML = 'If your course hasn\'t officially started yet you are welcome to begin the material for ' + _formatHomePageWeek(1) + '<br><br>';
      elemContainer.appendChild(elemList);
      elemContainer.appendChild(elemNote);
    }
    
    return elemContainer;
  }
  
  function _formatHomePageWeek(weeknum) {
    var html = '';
    html += '<span class="pidx-weeknumber">week ' + weeknum + '</span>';
    return html;
  }
  
  function _renderHomePageMenuHelp() {
    var apCourse = fullPacingInfo.pacinginfo.apcourse;
    var elemHelp = document.createElement('div');
    elemHelp.id = 'homepageHelp';
    
    var elemHelpInstructions = document.createElement('div');
    elemHelpInstructions.id = 'homepageHelpInstructions';
    elemHelpInstructions.innerHTML = 'You can use the menu to access info for your current pacing week or any other.';
    
    var elemHelpLink = document.createElement('a');
    if (apCourse) {
      elemHelpLink.href = pacingIndexMenuLinkAP;
    } else {
      elemHelpLink.href = pacingIndexMenuLink;
    }
    elemHelpLink.target = '_blank';
    
    var elemHelpImage = document.createElement('img');
    elemHelpImage.id = 'homepageHelpImage';
    if (apCourse) {
      elemHelpImage.src = pacingIndexMenuImageAP;
    } else {
      elemHelpImage.src = pacingIndexMenuImage;
    }
    elemHelpImage.title = 'click to see larger image';
    elemHelpLink.appendChild(elemHelpImage);
    
    var elemEndDateInstructions = document.createElement('div');
    elemEndDateInstructions.id = 'homepageEndDateInstructions';
    elemEndDateInstructions.innerHTML = 'You can find your start and end dates in the SLP';
    
    var elemEndDateLink = document.createElement('a');
    elemEndDateLink.href = pacingIndexFindingEndDateLink;
    elemEndDateLink.target = '_blank';
    
    var elemEndDateImage = document.createElement('img');
    elemEndDateImage.id = 'homepageEndDateImage';
    elemEndDateImage.src = pacingIndexFindingEndDateImage;
    elemEndDateImage.title = 'click to see larger image';
    elemEndDateLink.appendChild(elemEndDateImage);
    
    elemHelp.appendChild(elemHelpInstructions);
    elemHelp.appendChild(elemHelpLink);
    if (!apCourse) {
      elemHelp.appendChild(elemEndDateInstructions);
      elemHelp.appendChild(elemEndDateLink);
    }
    
    return elemHelp;
  }
  
  function _renderPacingDetails() {
    var idTitle = 'tasksforweekTitle';
    var idList = 'tasksforweekDetails';
    var elemTitle = document.getElementById(idTitle);
    var elemList = document.getElementById(idList);
    if (elemTitle != null) elemTitle.parentNode.removeChild(elemTitle);
    if (elemList != null) elemList.parentNode.removeChild(elemList);
    
    var apCourse = fullPacingInfo.pacinginfo.apcourse;
    var calendar = fullPacingInfo.pacingcalendar;
    
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
    
    $("#tasksforweek").show();
    $("#calendar").hide();
  }
  
  function _loadPacingCalendar() {
    page.calendar.height = settings.announcementsHeight;
    page.calendar.frameborder = 0;
    page.calendar.allowfullscreen = true;
    page.calendar.mozallowfullscreen = true;
    page.calendar.webkitallowfullscreen = true;
    var source = pacingCalendarLink;
    source += '?term=' + fullPacingInfo.pacingcalendar.start1.term;
    if (fullPacingInfo.pacinginfo.apcourse) source += '&ap';
    source += '&highlight="' + _formatPacingCalendarDate(settings.currentDate) + '"';
    console.log(source);

    page.calendar.src = source;
  }
  
  function _renderPacingCalendar() {
    $("#tasksforweek").hide();
    $("#calendar").show();
  }
    
  //-------------------------------------------------------------------------
  // determine what week number(s) based on course type and pacing calendar
	//-------------------------------------------------------------------------
  function _calculateCurrentWeeks() {
    var calendar = fullPacingInfo.pacingcalendar;
    var now = settings.currentDate; //new Date();
     
    settings.calendarSummary = {};
    
    var maxloop = 3;
    if (fullPacingInfo.pacinginfo.apcourse) max = 1;
    for (var i = 0; i < maxloop; i++) {
      var summary = {};
      var key = 'start' + (i + 1);
      if (fullPacingInfo.pacinginfo.apcourse) {
        key = 'startAP';
      }
        
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
      
      summary.notStarted = false;
      if (foundWeek == null) {
        foundWeek = new Date(origSummary['week1']);
        foundWeekNum = 1;
        summary.notStarted = true;
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
    _setWeek(weeknum);
  }
  
	function _setWeek(weeknum) {
    settings.weeknum = weeknum;
    
    if (weeknum == 0) {
      _renderHomePage();
      _renderPacingCalendar();
      
    } else {
      _renderAnnouncements();
      _renderPacingDetails();
    }
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

  
  function _formatPacingCalendarDate(pacingdate) {
    var formattedDate = '';
    
    if (pacingdate != null & pacingdate != '') {
      objDate = new Date(pacingdate);
      var day = objDate.getDate();
      var month = objDate.getMonth() + 1;
      var year = objDate.getFullYear();
      formattedDate = month + "/" + day + "/" + year;
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