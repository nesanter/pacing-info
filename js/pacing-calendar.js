//
// TODO: add AP handling and summer handling (single start date)
//
const app = function () {
	const page = {
		body: null,
    notice: null,
    contents: null,
    start1: null,
    start2: null,
    start3: null
	};
	
	const settings = {
    term: null,
    numweeks: null,
    ap: null
	};
	
  const termToWeeks = {
    "semester1": 18,
    "semester2": 18,
    "trimester1": 12,
    "trimester2": 12,
    "trimester3": 12,
    "summer": 10
  };
    
  var pacingCalendar = null;
  
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.body = document.getElementsByTagName('body')[0];
    page.notice = document.getElementById('notice');
		page.contents = document.getElementById('contents');		
    page.start1 = document.getElementById('start1');
    page.start2 = document.getElementById('start2');
    page.start3 = document.getElementById('start3');    
		
		_setNotice('initializing...');

		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		} else {
			_setNotice('');
      _getPacingCalendarInfo(settings.term, settings.ap, _setNotice, _processPacingInfo);
		}
  }
  
	//-------------------------------------------------------------------------------------
	// query params:
  //
  //  term: semester1, semester2, trimester1, trimester2, trimester3, summer
  //  ap: if present then use AP calendar info
	//-------------------------------------------------------------------------------------
	function _initializeSettings() {
		var result = false;

		var params = {};
		var urlParams = new URLSearchParams(window.location.search);

    params.term = urlParams.has('term') ? urlParams.get('term') : null;
    params.ap = urlParams.has('ap');

    settings.term = params.term;
    settings.numweeks = termToWeeks[settings.term];
    settings.ap = params.ap;
    
    if (params.term != null) {
			result = true;
		}

		return result;
	}
	
	//----------------------------------------------
  // parse the calendar data into a format
  // usable by the rendering routines
  //-----------------------------------------------
  function _processPacingInfo(jsonData) {
    pacingCalendar = jsonData;
    
    var startweek = new Date(pacingCalendar.start1.week1);
    if (settings.ap) {
      startweek = new Date(pacingCalendar.startAP.week1);
    }
      
    var endweek = null;
    if (settings.ap) {
      endweek = new Date(pacingCalendar.startAP['week' + settings.numweeks]);
    } else if (settings.term == 'summer') {
      endweek = new Date(pacingCalendar.start1['week' + settings.numweeks]);
    } else {
      endweek = new Date(pacingCalendar.start3['week' + settings.numweeks]);
    }
      
    var weekList = _buildWeekList(startweek, endweek);
    var mappedWeeks = _mapWeeks(weekList, pacingCalendar);
    
    _renderPacingCalendar(mappedWeeks);
  }
  
  function _buildWeekList(startWeek, endWeek) {
    var objWeek = {};
    
    currentWeek = startWeek;
    while (currentWeek <= endWeek) {
      objWeek[currentWeek] = null;
      currentWeek.setDate(currentWeek.getDate() + 7);
    }
    console.log(JSON.stringify(objWeek));
    return objWeek;
  }
  
  function _mapWeeks(weeklist, calendar) {
    var mapped = {};
    for (var key in weeklist) {
      var matchingWeeks = [];
      for (var i = 0; i < 3; i++) {
        var skipSection = (i == 0 && settings.ap) || 
                          (i == 2 && settings.ap) ||
                          (i == 1 && settings.term == 'summer') ||
                          (i == 2 && settings.term == 'summer');
        if (!skipSection) { 
          var section = calendar['start' + (i + 1)];
          if (settings.ap) section = calendar['startAP'];
          matchingWeeks.push(weekMatchingData(key, section));
        }
      }
      mapped[key] = matchingWeeks;
    }
    
    return mapped;
  }
  
  function weekMatchingData(week, calendarSection) {
    var weeknum = '';
    
    for (var i = 0; i < settings.numweeks && weeknum == ''; i++) {
      if (new Date(calendarSection['week' + (i + 1)]) == week) {
        weeknum = i + 1;
      }
    }
    
    return weeknum;
  }
  
  //-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
  function _renderPacingCalendar(mappedWeeks) { 
    page.contents.appendChild(_renderPacingCalendarTitle());  
    page.contents.appendChild(_renderPacingCalendarTable(mappedWeeks));
  }
  
  function _renderPacingCalendarTitle() {
    var termToText = {
      "semester1": "semester 1",
      "semester2": "semester 2",
      "trimester1": "trimester 1",
      "trimester2": "trimester 2",
      "trimester3": "trimester 3",
      "summer": "summer"
    }
    var elemTitle = document.createElement('div');
    
    var elemText = document.createElement('h3');
    var html = 'Pacing calendar (' + termToText[settings.term];
    if (settings.ap) {
      html += ' - AP';
    }
    html += ')';
    elemText.innerHTML = html;
    
    elemTitle.appendChild(elemText);
    elemTitle.appendChild(document.createElement('hr'));
    
    return elemTitle;
  }
  
  function _renderPacingCalendarTable(mappedWeeks) {
    var elemTable = document.createElement('table');
    elemTable.appendChild(_renderPacingCalendarHeader());
    
    for (var key in mappedWeeks) {
      elemTable.appendChild(_renderPacingCalendarRow(key, mappedWeeks[key]));
    }
    
    return elemTable;
  }
	
  function _renderPacingCalendarHeader() {
    var elemHeaderRow = document.createElement('tr');
    var startDate = null;
    var endDate = null;
    
    var elemCell = document.createElement('th');
    elemCell.innerHTML = 'Date';
    elemHeaderRow.appendChild(elemCell);
     
    elemCell = document.createElement('th');
    
    if (!settings.ap) {
      startDate = _formatPacingWeekDate(pacingCalendar.start1.startdate);
      endDate = _formatPacingWeekDate(pacingCalendar.start1.enddate);
      elemCell.innerHTML = 'Start: ' + startDate + '<br>';
      elemCell.innerHTML += 'End: ' + endDate;
      elemHeaderRow.appendChild(elemCell);
    }
    
    if (settings.term != 'summer') {
      elemCell = document.createElement('th');
      startDate = _formatPacingWeekDate(pacingCalendar.start2.startdate);
      endDate = _formatPacingWeekDate(pacingCalendar.start2.enddate);
      elemCell.innerHTML = 'Start: ' + startDate + '<br>';
      elemCell.innerHTML += 'End: ' + endDate;
      elemHeaderRow.appendChild(elemCell);
    }

    if (!settings.ap && settings.term != 'summer') {    
      elemCell = document.createElement('th');
      startDate = _formatPacingWeekDate(pacingCalendar.start3.startdate);
      endDate = _formatPacingWeekDate(pacingCalendar.start3.enddate);
      elemCell.innerHTML = 'Start: ' + startDate + '<br>';
      elemCell.innerHTML += 'End: ' + endDate;
      elemHeaderRow.appendChild(elemCell);
    }

    return elemHeaderRow;
  }
  
  function _renderPacingCalendarRow(week, weekData) {
    var elemRow = document.createElement('tr');
 
    var elemCell = document.createElement('td');
    elemCell.innerHTML = _formatPacingWeekDate(week);
    elemRow.appendChild(elemCell);
    
    for (var i = 0; i < weekData.length; i++) {
      elemCell = document.createElement('td');
      var weeknum = weekData[i];
      if (weeknum == '') {
        elemCell.innerHTML = '-';
      } else {
        elemCell.innerHTML = 'Week ' + weeknum;
      }
      elemRow.appendChild(elemCell);
    }
            
    return elemRow;
  }
  
  //--------------------------------------------------------------------------
  // handlers
	//--------------------------------------------------------------------------

  
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
  
  function _formatPacingWeekDate(pacingdate) {
    var formattedDate = '';
    
    if (pacingdate != null & pacingdate != '') {
      objDate = new Date(pacingdate);
      var day = ("00" + objDate.getDate()).slice(-2);
      var month = ("00" + (objDate.getMonth() + 1)).slice(-2);
      var year = (objDate.getFullYear() + '').slice(-2);
      formattedDate = month + "/" + day + "/" + year;
    }
    
    return formattedDate;
  }
  
  	
	//-----------------------------------------------------------------------------------
	// iframe responsive height - post message to parent (if in an iframe) to resizeBy
	//-----------------------------------------------------------------------------------
	function _postHeightChangeMessage() {
		var msg = document.body.scrollHeight + '-' + 'PacingCalendar' + '-' + settings.instance;
		console.log('posting to parent: ' + msg);
		window.parent.postMessage(msg, "*");
	}
		
	return {
		init: init
 	};
}();