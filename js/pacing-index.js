//
// TODO: set up query params
// TODO: use pacing API to retrieve
// TODO: format and post pacing info in setWeek
// TODO: refactor for query params and generalization
// TODO: play with demo announcement slides for size and such
// TODO: commonize identification of current week for each start date and the start/end date pairings
// TODO: include color-coding and key (or similar) in nav section
// TODO: pretty up formatting
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
    numweeks: null
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
    _renderNavigation();
    _renderAnnouncements();
    _setWeek(1);
   /* _renderPacingGuide();*/
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

		return result;
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
  function _renderNavigation() {
    for (var i = 1; i < 5; i++) {
      var elemNavButton = document.createElement('button');
      elemNavButton.id = 'btnWeek' + i;
      elemNavButton.innerHTML = "week " + i;
      elemNavButton.addEventListener('click', makeSetWeekFunction(i), false);
      page.navigation.appendChild(elemNavButton);
    }  
  }

  function _renderAnnouncements() {
    page.announcements.width = 504;
    page.announcements.height = 447;
   // page.announcements.src = 'https://docs.google.com/presentation/d/e/2PACX-1vTLXCiT2X9QX71zuMly2wDhIt4aSIOS9KpXTOStvL6nw0o4V726dAyX0rPYPKlM-uO4ifln5PAoZ0dO/embed?rm=minimal&start=false&amp;loop=false&amp;delayms=3000';
    page.announcements.frameborder = 0;
    page.announcements.allowfullscreen = true;
    page.announcements.mozallowfullscreen = true;
    page.announcements.webkitallowfullscreen = true;
  }
  
	function _renderPacingGuide() {
    var pacing = fullPacingInfo.pacing;
    var apCourse = fullPacingInfo.apcourse;
    var borderClass = 'pi-border';
    
    page.contents.appendChild(_buildPacingGuideTitle());
    
    var elemTable = document.createElement('table');
    elemTable.classList.add(borderClass);

    elemTable.appendChild(_buildPacingGuideHeaderRow());
    
    for (var i = 0; i < settings.numweeks; i++) {
      var weekKey = (i + 1) + '';
      var weekInfo = pacing[weekKey];
      
      for (var j = 0; j < weekInfo.length; j++) {
        var elemRow = document.createElement('tr');
        elemRow.classList.add(borderClass);
        if (i % 2 == 0) {
          elemRow.classList.add('pi-even-row');
        } else {
          elemRow.classList.add('pi-odd-row');
        }
        
        var cell1 = document.createElement('td');
        var cell2 = document.createElement('td');
        var cell3 = document.createElement('td');
        var cell4 = document.createElement('td');
        
        cell1.classList.add(borderClass);
        cell1.classList.add('pi-center-text');
        cell2.classList.add(borderClass);
        cell3.classList.add(borderClass);
        if (weekInfo[j].progresscheck) cell3.classList.add('pi-progress-check');
        if (weekInfo[j].graded) {
          cell3.classList.add('pi-graded');
        } else {
          cell3.classList.add('pi-notgraded');
        }
        cell4.classList.add(borderClass);
        
        cell1.innerHTML = weekKey;
        cell2.innerHTML = weekInfo[j].unit;
        cell3.innerHTML = weekInfo[j].item;
        if (apCourse) {
          cell4.innerHTML = _formatDueDate(weekInfo[j].duedate);
        } else {
          cell4.innerHTML = '';
        }
        
        elemRow.appendChild(cell1);
        elemRow.appendChild(cell2);
        elemRow.appendChild(cell3);
        elemRow.appendChild(cell4);
     
        elemTable.appendChild(elemRow);
      }
    }
    
    page.contents.appendChild(elemTable);
	}	
  
  function _buildPacingGuideTitle() {
    var elemTitle = document.createElement('div');
    elemTitle.classList.add('pi-title');
    elemTitle.innerHTML = fullPacingInfo.coursename + ' ' + settings.numweeks + ' Week Pacing Guide';
    return elemTitle;
  }
  
  function _buildPacingGuideHeaderRow() {
    var apCourse = fullPacingInfo.apcourse;
    var headerLabels = ['Week', 'Unit / Module', 'Lessons and Assignments', 'Complete?<br>Yes or No', 'Due Date<br>by 11:59pm'];
    var borderClass = 'pi-border';

    var elemHeadRow = document.createElement('tr');
    elemHeadRow.classList.add(borderClass);

    for (var i = 0; i < headerLabels.length - 1; i++) {
      var cell = document.createElement('th');
      if (i <= 2) {
        cell.innerHTML = headerLabels[i];
      } else if (apCourse) {
        cell.innerHTML = headerLabels[4];
      } else {
        cell.innerHTML = headerLabels[3];
      }
      cell.classList.add(borderClass);
      cell.classList.add('pi-header');
      if (i == 3) cell.classList.add('pi-center-text');
      elemHeadRow.appendChild(cell);
    }
    
    return elemHeadRow;
  }
  
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
		
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------  
  function makeSetWeekFunction(weeknum) {
    return function() { _setWeek(weeknum); }
  }
  
	function _setWeek(weeknum) {
    var urlAnnouncementsBase = 'https://docs.google.com/presentation/d/e/2PACX-1vTLXCiT2X9QX71zuMly2wDhIt4aSIOS9KpXTOStvL6nw0o4V726dAyX0rPYPKlM-uO4ifln5PAoZ0dO/embed?rm=minimal&start=false&amp;loop=false&amp;delayms=3000;rm=minimal';
    var newSrc = urlAnnouncementsBase + '#' + weeknum;
    console.log("weeknum=" + weeknum);
    page.announcements.src = newSrc;
    
    var pacingWeek = fullPacingInfo.pacing[weeknum];
    console.log(JSON.stringify(pacing));
    var html = 'pacing for week #' + weeknum + '<br>';
    html += JSON.stringify(pacingWeek);
    page.pacing.innerHTML = html;
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
  
	return {
		init: init
 	};
}();