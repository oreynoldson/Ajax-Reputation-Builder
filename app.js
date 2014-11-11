$(document).ready( function() {
	$('.unanswered-getter').submit( function(event){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});

/******ADDED******/
		$('.inspiration-getter').submit(function(event){
			//clears previous results if search has been run
			$('.results').html('');
			//get the value of the tags the user submitted
			var tags2 = $(this).find("input[name='answerers']").val();
			//Function that sends request to Stack API
			//Pass tags2 into the function to be used in the data key
			getInspiration(tags2);
		});
	});

/*********************
REQUEST TO API
*********************/

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our GET request to StackOverflow's API
	var request = {tagged: tags,
								site: 'stackoverflow',
								order: 'desc',
								sort: 'creation'};
	
	//bad code
	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})  
	.done(function(result){
		console.log(result);
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

/*************************
		NEW CODE
**************************/

//gets tags from search box and searches for them on stack overflow
var getInspiration = function(tags2) {

	//the parameters we need to pass in our GET request to StackOverflow's API
	//these parameters come after the question mark in the endpoint url
	//tag in the api endpoint url is where our tags we entered go
	//pagesize is an additional option to customize the data returned
	//these additional options come after the ? in the endpoint url
	var request2 = {tag: tags2,
								site: 'stackoverflow',
								pagesize: 10 };

	//variable contains the endpoint url 
	//request2.tag is the tags entered by the user in the search

	var my_url = "http://api.stackexchange.com/2.2/tags/"+request2.tag+"/top-answerers/month";
	console.log(my_url);	

	var inspiration_result = $.ajax({
		url: my_url,
		data: request2, 
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(inspiration_object){
		//allow to see the object returned in the console
		console.log(inspiration_object);

		//additional info like the tags the user input and items returned 
		var searchResults = showSearchResults(request2.tag, inspiration_object.items.length);

		//append additional search info to div in the DOM
		$('.search-results').html(searchResults);

		//use each to itterate throught the objects within items array, 
		//within the object returned from the ajax call
		$.each(inspiration_object.items, function(index, item){
			//calls showinspiration function where info from
			// objects are appended to the DOM
			var inspiration_returned = showInspiration(item);
			//appends the results to the results div
			$(".results").append(inspiration_returned);
		});
	})//end of success
		.fail(function(jqXHR, error, errorThrown){
			var errorElem = showError(error);
			$('.search-results').append(errorElem);
		})
};//end of getInspiration function

/**********************************
ADDING DATA FROM REQUEST TO THE DOM
**********************************/


// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM
var showQuestion = function(question) {

	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the #views for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
													question.owner.display_name +
												'</a>' +
							'</p>' +
 							'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};

/*************************
		NEW CODE
**************************/

	//function takes the tag score objects returned by Stack
	///create new result to append to DOM.
	var showInspiration = function(inspiration_returned){

		//clone the result template code
		var inspiration_answers = $(".templates .answers").clone();

		//set user name in inspiration_answers
		var userName = inspiration_answers.find(".user-name a");
		userName.attr("href", inspiration_returned.user.link);
		userName.text(inspiration_returned.user.display_name);

		//set reputation in inspiration_answers
		var reputationVar = inspiration_answers.find(".reputation");
		reputationVar.text(inspiration_returned.user.reputation);

		//set score in inspiration_answers
		var scoreVar = inspiration_answers.find(".score");
		scoreVar.text(inspiration_returned.score);

		//set post-count in inspiration_answers
		var postCountVar = inspiration_answers.find(".post-count");
		postCountVar.text(inspiration_returned.post_count);

		return inspiration_answers;
	};

/***************************************
ADDITIONAL INFO FROM API APPENDED TO DOM
****************************************/

// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query;
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

