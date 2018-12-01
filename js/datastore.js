const API_BASE = 'https://script.google.com/macros/s/AKfycbw3AZZUBjnjYmFqCJ6N_jSe6nJGJhM6kws6xqw7Hh-stPoeP58/exec';
const API_KEY = 'MVpacinginfoAPI';

//--------------------------------------------------------------
// build URL for use with Google sheet web API
//--------------------------------------------------------------
	function _buildApiUrl (datasetname, coursekey, term, ap) {
	let url = API_BASE;
	url += '?key=' + API_KEY;
	url += datasetname && datasetname !== null ? '&dataset=' + datasetname : '';
	url += coursekey && coursekey !== null ? '&coursekey=' + coursekey : '';
	url += term && term !== null ? '&term=' + term : '';
	url += ap && ap !== null ? '&ap' : '';
	//console.log('buildApiUrl: url=' + url);
	
	return url;
}

//--------------------------------------------------------------
// use Google Sheet web API to get pacing info for course
//--------------------------------------------------------------
function _getPacingInfo (coursekey, term, notice, callback) {
	notice('retrieving pacing info...');

	fetch(_buildApiUrl('pacinginfo', coursekey, term))
		.then((response) => response.json())
		.then((json) => {
			//console.log('json.status=' + json.status);
			//console.log('json.data: ' + JSON.stringify(json.data));
			if (json.status !== 'success') {
				notice('Unable to retrieve pacing info for ' + coursekey + ' (' + term + ') : ' + json.message);
			} else {
				notice('');
				callback(json.data);
			}
		})
		.catch((error) => {
			notice('Unexpected error retrieving pacing info');
			console.log(error);
		})
}

//--------------------------------------------------------------
// use Google Sheet web API to get pacing calendar for term
//--------------------------------------------------------------
function _getPacingCalendarInfo (term, ap, notice, callback) {
	notice('retrieving pacing calendar...');

	fetch(_buildApiUrl('pacingcalendar', null, term, ap))
		.then((response) => response.json())
		.then((json) => {
			//console.log('json.status=' + json.status);
			//console.log('json.data: ' + JSON.stringify(json.data));
			if (json.status !== 'success') {
				notice('Unable to retrieve pacing calendar for ' + term + ': ' + json.message);
			} else {
				notice('');
				callback(json.data);
			}
		})
		.catch((error) => {
			notice('Unexpected error retrieving pacing calendar');
			console.log(error);
		})
}
