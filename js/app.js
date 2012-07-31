$(document).ready(function(){
	//All words
	var WORDS = [],
	//language model
	NWORDS = {},
	alphabet = "abcdefghijklmnopqrstuvwxyz".split(''),
	menuNextButton = $('.menu > ul li.split a#next'),
	menuPrevButton = $('.menu > ul li.split a#prev'),
	data = {};
	//get length of object
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};
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
		updateTopWords();
		$('#add-dict').show();
		$('#main-view').toggleClass('slide');
		$('#dictionary-add-view').toggleClass('slide');
		$('#dictionary-add-view > form textarea').val('');
		$('#main-view > form .textarea').focus();
	});
	//Demo menu Listeners
	$('.demo-menu ul #load-demo-bank a').click(function(e){
		e.preventDefault();
		$.get($(this).attr('href'), function(response){
			read(response);
			updateTopWords();
			$('#dictionary-add-view').toggleClass('slide');
			$('#add-dict').show();
		});
	});
	//on click "Check My Stuff!!" do spell check.
	$('#check').click(function(){
		checkwords();
	});
	//show menu on click
	$('span').live('click', function(){
		data = {
			currentEl: $(this)
		}
		showMenu(data);
	});
	//listen for clicks outside of menu and hide.
	$(document).mouseup(function(e){
		var menu = $('.menu');
		if(menu.has(e.target).length === 0){
			menu.hide();
		}
	});
	//on click switch to the next wrong word
	menuNextButton.click(function(){
		var nextEl = $('.menu').data('siblings')[0];
		
		data = {
			currentEl: nextEl,
		}
		showMenu(data);
	});
	//on click switch to the next wrong word
	menuPrevButton.click(function(){
		var prevEl = $('.menu').data('siblings')[1];
			
		data = {
			currentEl: prevEl
		}
		showMenu(data);
	});
	$('.menu ul li.add-to-dictionary').click(function(){
		//console.log(data);
		//remove highlight on all instances of word.
		$('.incorrect:contains("' + data.currentEl.text() + '")').removeClass('incorrect').attr('contenteditable', true);
		read(data.currentEl.text());
		
		$('.menu').hide();
		setSelection(data.currentEl[0]);
	});
	//get top five most used words.
	function updateTopWords(){
		words = getTopFiveWords(NWORDS);
		$('#top-words ul').empty();
		for(word in words){
			$('#top-words ul').append('<li>' + words[word][0] + ' - ' + words[word][1] + ' times</li>');
		}
		$('#top-words').show();
	}
	function showMenu(data){
		var coords = data.currentEl.offset(),
		candidates = correction(data.currentEl.text()),
		adjacentEl = getAdjacent(data.currentEl),
		buffer = '',
		list = [],
		isCapital = false;
		$('.menu ul .words').remove();
		//check to see if word is capitalized to preserve it
		if(data.currentEl.text().slice(0)[0] == data.currentEl.text().slice(0)[0].toUpperCase()){
			isCapital = true;
		}

		if(typeof(candidates) != 'string'){
			//sort candidates in descending order so that highest rank word shows first.
			for(candidate in candidates){
				list.push(candidate);
			}
			list.sort(function(a,b){return a+b});
			for(i = 0; i < list.length && i < 5; i++){
				buffer += '<li class="words"><a href="#">' + candidates[list[i]] + '</a></li>';
			}
			$('.menu ul').prepend(buffer);
		}

		$('.words').click(function(){
			var word;
			if(isCapital){
				word = $(this).text().split('');
				word[0] = word[0].toUpperCase();
				word = word.join('');
			} else {
				word = $(this).text();
			}

			data.currentEl.text(word).removeClass('incorrect').attr('contenteditable', true);
			read($(this).text());
			
			$('.menu').hide();
			setSelection(data.currentEl[0]);
		});

		

		$('.menu').show().css({
			top: coords.top + 25,
			left: coords.left
		}).data('siblings', adjacentEl);
	}
	//get adjacent elements or loop to first or last
	function getAdjacent(el){
		//get next element if none exists assume at the end and go the beginning.
		var nextEl = (el.nextAll().closest('.incorrect')[0] == undefined) ? $('.incorrect').first(): el.nextAll().closest('.incorrect')[0],
		//get the previous element if none exists go to the end.

		prevEl = (el.prevAll().closest('.incorrect')[el.prevAll().closest('.incorrect').length-1] == undefined) ? $('.incorrect').last() : el.prevAll().closest('.incorrect')[el.prevAll().closest('.incorrect').length-1];
		return [$(nextEl), $(prevEl)];
	}
	//check the words in our textarea and see if they are wrong.
	//highlight them when the are. 
	function checkwords(){
		var text = $('#main-view > form .textarea').text(),
			buffer = [];

		text = spanify(text);
		$('#main-view > form .textarea').html(text);
		$('#main-view > form .textarea span').each(
			function(id, el){
				var word = $(el).text().toLowerCase(),
					correct = correction(word);
				if(correct != word){
					$(el).addClass('incorrect').attr('contenteditable', false);
				}
			}
		);
	}
	//wrap every word in a <span>
	function spanify(text){
		if(text !== ''){
			words = text.match(/[a-z]+/gi);
			for(word in words){
				words[word] = '<span>' + words[word] + '</span>';
			}
			return words.join(' ');
		}
	}
	//set selection caret to the end of element. 
	function setSelection(el){
		var range = document.createRange();
		var selection = window.getSelection();

		range.selectNodeContents(el);
		range.collapse(false);
		
		selection.removeAllRanges();
		selection.addRange(range);
	}
	//read words from string into split up array
	function read(words){
		WORDS = WORDS.concat(words.toLowerCase().match(/[a-z]+/g));
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
	}
	//get top 5 most commonly used words; returns array of the word and popularity
	function getTopFiveWords(words){
		arr = []
		for(var word in words){
			arr.push([word, words[word]]);
		}
		arr = arr.sort(function(a, b){return a[1] - b[1]});
		arr = arr.slice(arr.length -5,arr.length);
		return arr;
	}
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
		if (Object.size(candidates) > 0) return candidates;
		//otherwise run through changes again. 
		list.forEach(function (edit) {
			changes(edit).forEach(function (w) {
				if (NWORDS.hasOwnProperty(w)) candidates[NWORDS[w]] = w;
			});
		});
		//if candidates exist show candidate else give original word.
		return Object.size(candidates) > 0 ? candidates : word;
	}
});