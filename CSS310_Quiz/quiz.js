alert("Site should be back to normal. - Jac")

let questions = [];
let questionIndex = 0;

function loadQuizQuestions() {
    fetch('CSS310_Quiz\\questionsWithoutLetters.json')
        .then(response => response.json())
        .then(data => {
            questions = Array.isArray(data) ? data : [data];
            shuffle(questions);
            displayQuestion();
        })
        .catch(error => {
            console.error('Error fetching JSON file:', error);
        });
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function displayQuestion() {
    option1.style.color = foreground;
    option2.style.color = foreground;
    option3.style.color = foreground;
    option4.style.color = foreground;
    
    document.getElementById("option1").style.backgroundColor = backgroundStart;
    document.getElementById("option2").style.backgroundColor = backgroundStart;
    document.getElementById("option3").style.backgroundColor = backgroundStart;
    document.getElementById("option4").style.backgroundColor = backgroundStart;

    option1.addEventListener('mouseover', mouseoverHandler1);
    option1.addEventListener('mouseleave', mouseleaveHandler1);
    option2.addEventListener('mouseover', mouseoverHandler2);
    option2.addEventListener('mouseleave', mouseleaveHandler2);
    option3.addEventListener('mouseover', mouseoverHandler3);
    option3.addEventListener('mouseleave', mouseleaveHandler3);
    option4.addEventListener('mouseover', mouseoverHandler4);
    option4.addEventListener('mouseleave', mouseleaveHandler4);

    op1Clicked = false;
    op2Clicked = false;
    op3Clicked = false;
    op4Clicked = false;
    
    document.getElementById('question').textContent = questions[questionIndex].QuestionPrompt;

    questionAnswers = new Array(questions[questionIndex].Answer1, 
        questions[questionIndex].Answer2, questions[questionIndex].Answer3, questions[questionIndex].Answer4);
    shuffle(questionAnswers);
    document.getElementById('option1').textContent = questionAnswers[0];
    document.getElementById('option2').textContent = questionAnswers[1];
    document.getElementById('option3').textContent = questionAnswers[2];
    document.getElementById('option4').textContent = questionAnswers[3];
    document.getElementById('correctAnswerParagraph').textContent = "";
    document.getElementById('description').textContent = "";
}

document.getElementById("previousButton").addEventListener('click', function() {
    if (questionIndex > 0)
    {
        questionIndex--;
        displayQuestion();
        document.getElementById("correctAnswerParagraph").textContent = "The correct answer is '" + questions[questionIndex].CorrectAnswer + "'";
        document.getElementById("description").textContent = questions[questionIndex].AnswerExplanation;

        if (option1.textContent === questions[questionIndex].CorrectAnswer)
        {
            option1.style.color = 'rgb(14, 196, 14)';
        }
        else if (option2.textContent === questions[questionIndex].CorrectAnswer)
        {
            option2.style.color = 'rgb(14, 196, 14)';
        }
        else if (option3.textContent === questions[questionIndex].CorrectAnswer)
        {
            option3.style.color = 'rgb(14, 196, 14)';
        }
        else if (option4.textContent === questions[questionIndex].CorrectAnswer)
        {
            option4.style.color = 'rgb(14, 196, 14)';
        }
    }
});

document.getElementById("submitButton").addEventListener('click', function() {
    option1.style.color = foreground;
    option2.style.color = foreground;
    option3.style.color = foreground;
    option4.style.color = foreground;

    if (op1Clicked) selectedOption = document.getElementById("option1");
    else if (op2Clicked) selectedOption = document.getElementById("option2");
    else if (op3Clicked) selectedOption = document.getElementById("option3");
    else if (op4Clicked) selectedOption = document.getElementById("option4");

    if (selectedOption) {
        const selectedValue = selectedOption.textContent;
        console.log('Selected answer:', selectedValue);
        if (selectedValue == questions[questionIndex].CorrectAnswer)
        {
            document.getElementById("correctAnswerParagraph").textContent = "Good job! The correct answer is '" + questions[questionIndex].CorrectAnswer + "'";
            document.getElementById("description").textContent = questions[questionIndex].AnswerExplanation;
            if (option1.textContent === questions[questionIndex].CorrectAnswer)
            {
                option1.style.color = 'rgb(14, 196, 14)';
            }
            else if (option2.textContent === questions[questionIndex].CorrectAnswer)
            {
                option2.style.color = 'rgb(14, 196, 14)';
            }
            else if (option3.textContent === questions[questionIndex].CorrectAnswer)
            {
                option3.style.color = 'rgb(14, 196, 14)';
            }
            else if (option4.textContent === questions[questionIndex].CorrectAnswer)
            {
                option4.style.color = 'rgb(14, 196, 14)';
            }
        }
        else
        {
            document.getElementById("correctAnswerParagraph").textContent = "The correct answer is '" + questions[questionIndex].CorrectAnswer + "'";
            document.getElementById("description").textContent = questions[questionIndex].AnswerExplanation;

            if (option1.textContent === questions[questionIndex].CorrectAnswer)
            {
                option1.style.color = 'rgb(14, 196, 14)';
            }
            else if (option2.textContent === questions[questionIndex].CorrectAnswer)
            {
                option2.style.color = 'rgb(14, 196, 14)';
            }
            else if (option3.textContent === questions[questionIndex].CorrectAnswer)
            {
                option3.style.color = 'rgb(14, 196, 14)';
            }
            else if (option4.textContent === questions[questionIndex].CorrectAnswer)
            {
                option4.style.color = 'rgb(14, 196, 14)';
            }

            if (option1.textContent === selectedValue)
            {
                option1.style.color = 'rgb(222, 22, 22)';
            }
            else if (option2.textContent === selectedValue)
            {
                option2.style.color = 'rgb(222, 22, 22)';
            }
            else if (option3.textContent === selectedValue)
            {
                option3.style.color = 'rgb(222, 22, 22)';
            }
            else if (option4.textContent === selectedValue)
            {
                option4.style.color = 'rgb(222, 22, 22)';
            }
        }
    } else {
        console.log('Please select an answer.');
    }
});

document.getElementById("nextButton").addEventListener('click', function(event) {
    questionIndex++;
    displayQuestion();
    document.getElementById("nextButton").blur();
});

document.addEventListener('keydown', function(event) {
    if (event.key === "1") {
        option1.click();
    }
    else if (event.key === "2")
    {
        option2.click();
    }
    else if (event.key === "3")
    {
        option3.click();
    }
    else if (event.key === "4")
    {
        option4.click();
    }
    else if (event.key === "Enter") {
        if ((op1Clicked || op2Clicked || op3Clicked || op4Clicked) && !document.getElementById("description").textContent != "")
        {
            document.getElementById("submitButton").click();
        }
        else
        {
            document.getElementById("nextButton").click();
        }
    }
});

// Load quiz questions when the page loads
loadQuizQuestions();

// the logic for dark vs light mode
const modeToggle = document.getElementById('lightModeToggle');
let isDarkModem = true;
modeToggle.addEventListener('click', () => {
    updateCSSVariables(isDarkModem);
    isDarkModem = !isDarkModem;
});

const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const option3 = document.getElementById("option3");
const option4 = document.getElementById("option4");

let op1Clicked = false;
let op2Clicked = false;
let op3Clicked = false;
let op4Clicked = false;

function updateCSSVariables(isDarkMode) {
    if (isDarkMode) {
        // Change to light mode values
        document.documentElement.style.cssText = `
            --BG: white;
            --FG: black;
            --light-FG: rgb(100,100,100);
            --button-FG: rgb(50,50,50);
            --button-BG: rgb(200,200,200);
            --list-item-BG-unselected: rgb(220,220,220);
            --list-item-BG-hover: rgb(240,240,240);
            --list-item-BG-selected: rgb(200,200,200);
            --spacer-FG: rgb(150,150,150);
        `;
        foreground = "rgb(0,0,0)";
        backgroundStart = "rgb(220,220,220)";
        backgroundHover = "rgb(240,240,240)";
        backgroundSelect = "rgb(255,255,255)";
    } else {
        // Change to dark mode values
        document.documentElement.style.cssText = `
            --BG: rgb(20, 20, 20);
            --FG: rgb(255, 255, 255);
            --light-FG: rgb(150,150,150);
            --button-FG: rgb(200,200,200);
            --button-BG: rgb(30,30,30);
            --list-item-BG-unselected: rgb(40,40,40);
            --list-item-BG-hover: rgb(60,60,60);
            --list-item-BG-selected: rgb(80,80,80);
            --spacer-FG: rgb(100,100,100);
        `;
        foreground = "rgb(255,255,255)";
        backgroundStart = "rgb(40,40,40)";
        backgroundHover = "rgb(60,60,60)";
        backgroundSelect = "rgb(80,80,80)";
    }

    option1.style.backgroundColor = backgroundStart;
    option2.style.backgroundColor = backgroundStart;
    option3.style.backgroundColor = backgroundStart;
    option4.style.backgroundColor = backgroundStart;

    option1.style.color = foreground;
    option2.style.color = foreground;
    option3.style.color = foreground;
    option4.style.color = foreground;

    op1Clicked = false;
    op2Clicked = false;
    op3Clicked = false;
    op4Clicked = false;
    

}

updateCSSVariables();

/*
 _   _                   _                _                   _               _ _             
| | | |                 | |              (_)                 | |             | (_)            
| | | | ___ _ __ _   _  | |__   ___  _ __ _ _ __   __ _   ___| |__   __ _  __| |_ _ __   __ _ 
| | | |/ _ \ '__| | | | | '_ \ / _ \| '__| | '_ \ / _` | / __| '_ \ / _` |/ _` | | '_ \ / _` |
\ \_/ /  __/ |  | |_| | | |_) | (_) | |  | | | | | (_| | \__ \ | | | (_| | (_| | | | | | (_| |
 \___/ \___|_|   \__, | |_.__/ \___/|_|  |_|_| |_|\__, | |___/_| |_|\__,_|\__,_|_|_| |_|\__, |
                  __/ |                            __/ |                                 __/ |
                 |___/                            |___/                                 |___/ 
*/

/*

Possible answers in the list
 - Foreground is always full white
 - Background starts at 40,40,40
 - Hovering ups that to 60,60,60
 - Selecting makes it 80,80,80


*/

// OPTION 1
const mouseoverHandler1 = function() {
    option1.style.backgroundColor = backgroundHover;
    option1.style.transition = 'background-color 0.1s';
};
const mouseleaveHandler1 = function() {
    option1.style.backgroundColor = backgroundStart;
    option1.style.transition = 'background-color 0.1s';
};
option1.addEventListener('mouseover', mouseoverHandler1);
option1.addEventListener('mouseleave', mouseleaveHandler1);

// OPTION 2
const mouseoverHandler2 = function() {
    option2.style.backgroundColor = backgroundHover;
    option2.style.transition = 'background-color 0.1s';
};
const mouseleaveHandler2 = function() {
    option2.style.backgroundColor = backgroundStart;
    option2.style.transition = 'background-color 0.1s';
};
option2.addEventListener('mouseover', mouseoverHandler2);
option2.addEventListener('mouseleave', mouseleaveHandler2);

// OPTION 3
const mouseoverHandler3 = function() {
    option3.style.backgroundColor = backgroundHover;
    option3.style.transition = 'background-color 0.1s';
};
const mouseleaveHandler3 = function() {
    option3.style.backgroundColor = backgroundStart;
    option3.style.transition = 'background-color 0.1s';
};
option3.addEventListener('mouseover', mouseoverHandler3);
option3.addEventListener('mouseleave', mouseleaveHandler3);

// OPTION 4
const mouseoverHandler4 = function() {
    option4.style.backgroundColor = backgroundHover;
    option4.style.transition = 'background-color 0.1s';
};
const mouseleaveHandler4 = function() {
    option4.style.backgroundColor = backgroundStart;
    option4.style.transition = 'background-color 0.1s';
};
option4.addEventListener('mouseover', mouseoverHandler4);
option4.addEventListener('mouseleave', mouseleaveHandler4);

// OPTION 1 CLICKED
option1.addEventListener('click', function() {
    op1Clicked = !op1Clicked;
    option1.style.backgroundColor = backgroundSelect;
    document.getElementById("option2").style.backgroundColor = backgroundStart;
    document.getElementById("option3").style.backgroundColor = backgroundStart;
    document.getElementById("option4").style.backgroundColor = backgroundStart;

    if (op1Clicked) {
        option1.removeEventListener('mouseover', mouseoverHandler1);
        option1.removeEventListener('mouseleave', mouseleaveHandler1);

        op2Clicked = false;
        option2.addEventListener('mouseover', mouseoverHandler2);
        option2.addEventListener('mouseleave', mouseleaveHandler2);
        
        op3Clicked = false;
        option3.addEventListener('mouseover', mouseoverHandler3);
        option3.addEventListener('mouseleave', mouseleaveHandler3);
        
        op4Clicked = false;
        option4.addEventListener('mouseover', mouseoverHandler4);
        option4.addEventListener('mouseleave', mouseleaveHandler4);
    } else {
        option1.addEventListener('mouseover', mouseoverHandler1);
        option1.addEventListener('mouseleave', mouseleaveHandler1);
    }
});

// OPTION 2 CLICKED
option2.addEventListener('click', function() {
    op2Clicked = !op2Clicked;
    option2.style.backgroundColor = backgroundSelect;
    document.getElementById("option1").style.backgroundColor = backgroundStart;
    document.getElementById("option3").style.backgroundColor = backgroundStart;
    document.getElementById("option4").style.backgroundColor = backgroundStart;

    if (op2Clicked) {
        option2.removeEventListener('mouseover', mouseoverHandler2);
        option2.removeEventListener('mouseleave', mouseleaveHandler2);

        op1Clicked = false;
        option1.addEventListener('mouseover', mouseoverHandler1);
        option1.addEventListener('mouseleave', mouseleaveHandler1);

        op3Clicked = false;
        option3.addEventListener('mouseover', mouseoverHandler3);
        option3.addEventListener('mouseleave', mouseleaveHandler3);

        op4Clicked = false;
        option4.addEventListener('mouseover', mouseoverHandler4);
        option4.addEventListener('mouseleave', mouseleaveHandler4);
    } else {
        option2.addEventListener('mouseover', mouseoverHandler2);
        option2.addEventListener('mouseleave', mouseleaveHandler2);
    }
});

// OPTION 3 CLICKED
option3.addEventListener('click', function() {
    op3Clicked = !op3Clicked;
    option3.style.backgroundColor = backgroundSelect;
    document.getElementById("option1").style.backgroundColor = backgroundStart;
    document.getElementById("option2").style.backgroundColor = backgroundStart;
    document.getElementById("option4").style.backgroundColor = backgroundStart;

    if (op3Clicked) {
        option3.removeEventListener('mouseover', mouseoverHandler3);
        option3.removeEventListener('mouseleave', mouseleaveHandler3);

        op1Clicked = false;
        option1.addEventListener('mouseover', mouseoverHandler1);
        option1.addEventListener('mouseleave', mouseleaveHandler1);

        op2Clicked = false;
        option2.addEventListener('mouseover', mouseoverHandler2);
        option2.addEventListener('mouseleave', mouseleaveHandler2);

        op4Clicked = false;
        option4.addEventListener('mouseover', mouseoverHandler4);
        option4.addEventListener('mouseleave', mouseleaveHandler4);
    } else {
        option3.addEventListener('mouseover', mouseoverHandler3);
        option3.addEventListener('mouseleave', mouseleaveHandler3);
    }
});

// OPTION 4 CLICKED
option4.addEventListener('click', function() {
    op4Clicked = !op4Clicked;
    option4.style.backgroundColor = backgroundSelect;
    document.getElementById("option2").style.backgroundColor = backgroundStart;
    document.getElementById("option3").style.backgroundColor = backgroundStart;
    document.getElementById("option1").style.backgroundColor = backgroundStart;

    if (op4Clicked) {
        option4.removeEventListener('mouseover', mouseoverHandler4);
        option4.removeEventListener('mouseleave', mouseleaveHandler4);

        op1Clicked = false;
        option1.addEventListener('mouseover', mouseoverHandler1);
        option1.addEventListener('mouseleave', mouseleaveHandler1);

        op2Clicked = false;
        option2.addEventListener('mouseover', mouseoverHandler2);
        option2.addEventListener('mouseleave', mouseleaveHandler2);

        op3Clicked = false;
        option3.addEventListener('mouseover', mouseoverHandler3);
        option3.addEventListener('mouseleave', mouseleaveHandler3);
        
    } else {
        option4.addEventListener('mouseover', mouseoverHandler4);
        option4.addEventListener('mouseleave', mouseleaveHandler4);
    }
});

