//
// TODO: make pacing info toggle-able (?)
// TODO: make configuration tool to generate BB embeddable code for this "package"
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
	
  function _processPacingInfo(jsonData) {
    pacingCalendar = jsonData;
    _renderPacingCalendar();
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
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
  function _renderPacingCalendar() {  
    for (var i = 1; i <= 3; i++) {
      var elemKey = 'start' + i;
      page[elemKey].appendChild(_renderPacingCalendarTable(i));
    }
  }
  
  function _renderPacingCalendarTable(startnum) {
    var startKey = 'start' + startnum;
    var calendarData = pacingCalendar[startKey];

    var elemTable = document.createElement('table');
    elemTable.appendChild(_renderPacingCalendarHeader(calendarData));
    
    for (var i = 0; i < settings.numweeks; i++) {
      elemTable.appendChild(_renderPacingCalendarRow(calendarData, i + 1));
    }
    
    return elemTable;
  }
	
  function _renderPacingCalendarHeader(calendarData) {
    var elemHeaderRow = document.createElement('tr');
    
    var elemCell = document.createElement('th');
    elemCell.innerHTML = 'Date';
    elemHeaderRow.appendChild(elemCell);
     
    elemCell = document.createElement('th');
    var startDate = _formatPacingWeekDate(calendarData.startdate);
    var endDate = _formatPacingWeekDate(calendarData.enddate);
    elemCell.innerHTML = 'Start: ' + startDate + '<br>';
    elemCell.innerHTML += 'End: ' + endDate;
    elemHeaderRow.appendChild(elemCell);

    return elemHeaderRow;
  }
  
  function _renderPacingCalendarRow(calendarData, weekNum) {
    var elemRow = document.createElement('tr');
    
    var elemCell = document.createElement('td');
    var weekKey = 'week' + weekNum;
    var weekLabel = 'Week ' + weekNum;
    elemCell.innerHTML = _formatPacingWeekDate(calendarData[weekKey]);
    elemRow.appendChild(elemCell);
    
    elemCell = document.createElement('td');
    elemCell.innerHTML = weekLabel;
    elemRow.appendChild(elemCell);
    
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
      var day = objDate.getDate();
      var month = objDate.getMonth() + 1;
      var year = objDate.getFullYear() + '';
      formattedDate = month + "/" + day + "/" + year.slice(-2);
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