$(document).ready(function(){
	var WORDS = [];
	var NWORDS = {};
	var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

	//show dictionary adder on button click
	$('#add-dict').click(function(){
		$(this).hide();
		$('#dictionary-add-view').toggleClass('slide');
		$('#dictionary-add-view > form textarea').focus();
	});
	//hide dictionary adder on click
	$('#cancel').click(function(){
		$('#add-dict').show();
		$('#dictionary-add-view').toggleClass('slide');
		$('#main-view > form textarea').focus();
	});
	//add text to dictionary.
	$('#add').click(function(){
		var words = $('#dictionary-add-view > form textarea').val();
		read(words);
		$('#add-dict').show();
		$('#main-view').toggleClass('slide');
		$('#dictionary-add-view').toggleClass('slide');
		$('#dictionary-add-view > form textarea').val('');
		$('#main-view > form .textarea').focus();
	});

	//on click "Check My Stuff!!" do spell check.
	$('#check').click(function(){
		checkwords();
	});

	$('.incorrect').live('click', function(){
		//get data from incorrect span attribute "data-correction"
		var correction = $(this).data('correction');
		$(this).text(correction);
		checkwords();
	});

	function checkwords(){
		var text = $('#main-view > form .textarea').text();
		//read words into array 
		var words = text.toLowerCase().match(/[a-z]+/g);
		for(word in words){
			var correct = correction(words[word]);
			//if word is not correct highlight
			if(correct != words[word]){
				var regex = new RegExp(words[word], "gi");
				text = text.replace(regex,'<span class="incorrect" contenteditable="false" data-correction="'+ correct +'">' + words[word] + '</span>');
			}
		}
		$('#main-view > form .textarea').html(text);
	}

	//get length of object
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	//read words from string into split up array
	function read(words){
		var str = words.toLowerCase(),
			regex = /[a-z]+/g
		WORDS = str.match(regex).concat(WORDS);
		NWORDS = train(WORDS);
	}

	// A helper function that returns the word with the most occurences in the language
	// model, among the supplied candidates.
	function max(candidates) {
		var candidate, arr = [];
		for (candidate in candidates)
			if (candidates.hasOwnProperty(candidate))
				arr.push(candidate);
		return Math.max.apply(null, arr);
	};

	//train probability model
	function train(words){
		var model = {};
		//set all words to 1 to smooth over novel words
		for(w in words){model[words[w]] = 1;}
		for(w in words){
			model[words[w]] += 1;
		}
		return model
	}

	//return all possible changes that can be made to the given word.
	//can be deletions, insertions, alterations, and transpositions.
	function changes(word) {
		var i, results = [];
		//add deletions
		for (i=0; i < word.length; i++)
		    results.push(word.slice(0, i) + word.slice(i+1));
		//add transpositions
		for (i=0; i < word.length-1; i++)
		    results.push(word.slice(0, i) + word.slice(i+1, i+2) + word.slice(i, i+1) + word.slice(i+2));
		//add alterations
		for (i=0; i < word.length; i++)
		    alphabet.forEach(function (l) {
		        results.push(word.slice(0, i) + l + word.slice(i+1));
			});
		//add insertions
		for (i=0; i <= word.length; i++)
		    alphabet.forEach(function (l) {
		        results.push(word.slice(0, i) + l + word.slice(i));
			});
		return results;
	}

	//Find probable corrections.
	function correction(word){
		//if word exists in language model return original word
		if (NWORDS.hasOwnProperty(word)) return word;
		var candidates = {}, list = changes(word);
		list.forEach(function (edit) {
			//place each change in to candidates array.
			if (NWORDS.hasOwnProperty(edit)) candidates[NWORDS[edit]] = edit;
		});
		//if candidates exist return most commonly used candidate.
		if (Object.size(candidates) > 0) return candidates[max(candidates)];
		//otherwise run through changes again. 
		list.forEach(function (edit) {
			changes(edit).forEach(function (w) {
				if (NWORDS.hasOwnProperty(w)) candidates[NWORDS[w]] = w;
			});
		});
		//if candidates exist show candidate else give original word.
		return Object.size(candidates) > 0 ? candidates[max(candidates)] : word;
	}
});