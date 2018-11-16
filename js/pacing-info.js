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
    ap: null,
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
    if (settings.ap) {
      _renderPacingGuideAP();
    } else {
      _renderPacingGuide();
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
    params.ap = urlParams.has('ap');

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
	function _renderPacingGuide() {
    var pacing = fullPacingInfo.pacing;
    var headerLabels = ['Week', 'Unit / Module', 'Lessons and Assignments', 'Complete?<br>Yes or No'];
    var borderClass = 'pi-border';
    
    _renderPacingGuideTitle();
    
    var elemTable = document.createElement('table');
    elemTable.classList.add(borderClass);

    var elemHeadRow = document.createElement('tr');
    elemHeadRow.classList.add(borderClass);

    for (var i = 0; i < headerLabels.length; i++) {
      var cell = document.createElement('th');
      cell.innerHTML = headerLabels[i];
      cell.classList.add(borderClass);
      cell.classList.add('pi-header');
      if (i == 3) cell.classList.add('pi-center-text');
      elemHeadRow.appendChild(cell);
    }
    elemTable.appendChild(elemHeadRow);
    
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
        if (!weekInfo[j].graded) cell3.classList.add('pi-notgraded');
        cell4.classList.add(borderClass);
        
        cell1.innerHTML = weekKey;
        cell2.innerHTML = weekInfo[j].unit;
        cell3.innerHTML = weekInfo[j].item;
        cell4.innerHTML = '';
        
        elemRow.appendChild(cell1);
        elemRow.appendChild(cell2);
        elemRow.appendChild(cell3);
        elemRow.appendChild(cell4);
     
        elemTable.appendChild(elemRow);
      }
    }
    
    page.contents.appendChild(elemTable);
	}	
  
  function _renderPacingGuideTitle() {
    var elemTitle = document.createElement('div');
    elemTitle.classList.add('pi-title');
    elemTitle.innerHTML = fullPacingInfo.coursename + ' ' + settings.numweeks + ' Week Pacing Guide';
    page.contents.appendChild(elemTitle);
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