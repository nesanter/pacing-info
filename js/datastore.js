const API_BASE = 'https://script.google.com/macros/s/AKfycbw3AZZUBjnjYmFqCJ6N_jSe6nJGJhM6kws6xqw7Hh-stPoeP58/exec';
const API_KEY = 'MVpacinginfoAPI';

//--------------------------------------------------------------
// build URL for use with Google sheet web API
//--------------------------------------------------------------
	function _buildApiUrl (datasetname, coursekey, numweeks) {
	let url = API_BASE;
	url += '?key=' + API_KEY;
	url += datasetname && datasetname !== null ? '&dataset=' + datasetname : '';
	url += coursekey && coursekey !== null ? '&coursekey=' + coursekey : '';
	url += numweeks && numweeks !== null ? '&numweeks=' + numweeks : '';
	console.log('buildApiUrl: url=' + url);
	
	return url;
}

//--------------------------------------------------------------
// use Google Sheet web API to get pacing info for course
//--------------------------------------------------------------
function _getPacingInfo (coursekey, numweeks, notice, callback) {
	notice('retrieving pacing info...');

	fetch(_buildApiUrl('pacinginfo', coursekey, numweeks))
		.then((response) => response.json())
		.then((json) => {
			console.log('json.status=' + json.status);
			console.log('json.data: ' + JSON.stringify(json.data));
			if (json.status !== 'success') {
				notice('Unable to retrieve pacing info for ' + coursekey + ' (' + numweeks + ' weeks) : ' + json.message);
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
