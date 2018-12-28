//
//
const app = function () {
	const page = {
		body: null,
    notice: null,
    contents: null
	};
	
	const settings = {
		coursekey: null,
    numweeks: null
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
						
		
		_setNotice('initializing...');
		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		} else {
			_setNotice('');
      _getPacingInfo(settings.coursekey, settings.term, _setNotice, _processPacingInfo);
		}
	}
	
  function _processPacingInfo(jsonData) {
    console.log("process");
    fullPacingInfo = jsonData.pacinginfo;
    _renderPacingGuide();
  }
  
	//-------------------------------------------------------------------------------------
	// query params:
  //
  //  coursekey: short course name, e.g. fpa, javascript
  //  term: semester1, semester2, trimester1, trimester2, trimester3, summer
	//-------------------------------------------------------------------------------------
	function _initializeSettings() {
		var result = false;

		var params = {};
		var urlParams = new URLSearchParams(window.location.search);
		params.coursekey = urlParams.has('coursekey') ? urlParams.get('coursekey') : null;
    params.term = urlParams.has('term') ? urlParams.get('term') : null;

		settings.coursekey = params.coursekey;
    settings.term = params.term;
    settings.numweeks = termToWeeks[settings.term];
		
		if (params.coursekey != null && params.term != null) {
			result = true;
		}

		return result;
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
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
        if (apCourse && weekInfo[j].graded) {
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
      var day = objDate.getDate();
      var month = objDate.getMonth() + 1;
      formattedDate = days[dayofweek] + ' ' + month + "/" + day;
    }

    return formattedDate;
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