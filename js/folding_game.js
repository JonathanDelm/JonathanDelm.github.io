var amountOfFoldsCorrect = 0;

var answers = {
	'Q1': 6,
	'Q2': 6,
	'Q3': 6,
	'Q4': 6,
	'Q5': 6,
	'Q6': 6,
	'Q7': 6,
	'Q8': 6,
	'Q9': 6,
	'Q10': 6,
}

var element = document.getElementById("container_div");

var generatedHTML = '';
for (let i = 1; i <= 10; i++) {
	generatedHTML += '<div id="checkboxes">' +
		'<div width="480"><img src="../images/foldingTestImages/Q'+i+'.png" height="80" width="480" style="margin-bottom: 22px;"></img></div><div width="480">';
	for (let j = 1; j <= 5; j++) {
		generatedHTML += '<div class="checkboxgroup">' +
			'<label for="Q'+ i +'_'+ j +'"><img src="../images/foldingTestImages/Q'+ i +'_'+ j +'.png" height="80"></label>' +
			'<input type="radio" name="Q'+ i +'" value="'+ j +'" id="Q'+ i +'_'+ j +'">' +
			'</div>';
	}
	generatedHTML += '<div class="checkboxgroup">' +
			'<label for="Q'+ i +'_6"><p class="skipText">Ik weet<br>het niet</p></label>' +
			'<input type="radio" name="Q'+ i +'" value="6" id="Q'+ i +'_6">' +
			'</div>';
	generatedHTML += '</div></div>';
}
element.innerHTML = generatedHTML;

element.style.display = "none";
var textDiv = document.getElementById("textDiv");
textDiv.style.display = "none";


document.getElementById("buttonContinueFolding").onclick = function () {
	var container_div_uitleg = document.getElementById("container_div_uitleg");
	container_div_uitleg.style.display = "none";

	window.scrollTo(0, 0);

	element.style.display = "block";
	textDiv.style.display = "block";

  var display = document.querySelector('#timer');
	var timeForPuzzle = 180;
  startTimer(timeForPuzzle, display);
	
	setTimeout(function(){
		var ele = document.getElementsByTagName('input');
		for(i = 0; i < ele.length; i++) {
			if(ele[i].type="radio") {			
				if(ele[i].checked) {
					answers[ele[i].name] = parseInt(ele[i].value);
				}
			}
		}
		saveData();

		// window.location.href = "http://127.0.0.1:5500/UserStudy3/html/recall.html";
		window.location.href = "https://jonathandelm.github.io/html/recall.html";
		
	},(timeForPuzzle+1.5)*1000);
}

function saveData() {
	let index = 0;
	let voorDeCheaters = [1,4,2,4,2,5,1,3,5,5];
	for (const answer in answers) {
		if (answers[answer] == voorDeCheaters[index]) {
			amountOfFoldsCorrect++;
		}
		index++;
	}

	var obj = JSON.parse(sessionStorage.getItem('obj'));
	obj.data.metaData.distractorScore = amountOfFoldsCorrect;
	sessionStorage.setItem('obj', JSON.stringify(obj));
}


function startTimer(duration, display) {
	var timer = duration, minutes, seconds;
	setInterval(function () {
			minutes = parseInt(timer / 60, 10);
			seconds = parseInt(timer % 60, 10);

			minutes = minutes < 10 ? "0" + minutes : minutes;
			seconds = seconds < 10 ? "0" + seconds : seconds;

			display.textContent = minutes + ":" + seconds;

			if (--timer < 0) {
					timer = duration;
			}
	}, 1000);
}
