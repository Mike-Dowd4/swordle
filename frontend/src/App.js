import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import JSConfetti from "js-confetti";
import './App.css';

function App() {
  const [swimmerData, setSwimmerData] = useState([]);
  const [swimmerGuess, setSwimmerGuess] = useState("");
  const [correctSwimmer, setCorrectSwimmer] = useState(null);
  const [guessList, setGuessList] = useState([]);
  const [guessFeedbackList, setGuessFeedback] = useState([]);
  const [guessDisabled, setDisabled] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [gameLoss, setLoss] = useState(false);
  const [loading, setLoading] = useState(true);

  
  const yellowColor = 'rgb(179, 161, 50)'
  const grayColor = 'rgb(51, 51, 51)';

  // Ref for the input element
  const inputRef = useRef(null);

  const dropdownRef = useRef()

  // Gets the swimmer data on page render
  // initializes number of guesses
  // ensures user is not over number of allowed guesses
  useEffect(() => {
    async function getSwimmers() {
      const response = await fetch("http://localhost:8080/api/swordle", {
        method: "GET"
      })

      const res_data = await response.json()

      //Sort swimmer data by swimmer name
      let v = res_data.swimmers;
      v = v.sort((a,b) => a.Name.localeCompare(b.Name))
      
      setSwimmerData(v);

      //Check if user last played today, if not, then restart game
      const dateLastPlayed = localStorage.getItem("lastPlayed");
      const today = new Date().toDateString();
      const idx_of_answer = getAnswer(res_data.swimmers.length);
      
      //Check if user has played yet today, if not, set numGuesses
      if(localStorage.getItem("numGuesses") == null || 
        localStorage.getItem("guessList") == null || 
        localStorage.getItem("guessFeedback") == null || 
        dateLastPlayed !== today){

        localStorage.setItem("lastPlayed", today);
        localStorage.setItem("numGuesses", "1");
        //store the guessList and guessFeedback in localstorage
        localStorage.setItem("guessList", "[]");
        localStorage.setItem("guessFeedback", "[]");
        
        setCorrectSwimmer(res_data.swimmers[idx_of_answer]);
      }else { //user is in middle of game
       

        setGuessList(JSON.parse(localStorage.getItem("guessList")));
        setGuessFeedback(JSON.parse(localStorage.getItem("guessFeedback")));

        setCorrectSwimmer(res_data.swimmers[idx_of_answer]);
      }

      // If user is currently out of guesses for the day
      if(parseInt(localStorage.getItem("numGuesses")) >= 5) {
        doneForDay(); //Disables guesses
      }

      setLoading(false);
    }

    getSwimmers();

  }, []); 

  // This is triggered when a user refreshes/comes back to page
  useEffect(() => {
    let guesses = JSON.parse(localStorage.getItem("guessList"));
    if(!guesses) {
      return
    }
    if (!guesses[0] || !correctSwimmer) { //If not loaded yet or user has not started playing yet skip
      return;
    }

    let lastGuess = guesses[0];

    if (guesses.length > 0 && guessList.length < 5 && correctSwimmer.id !== lastGuess.id) { //User refreshes/comes back during game
      displayCurrentBoard();
      return;
    }

    //Decide if the user is done with game
    if(correctSwimmer.id === lastGuess.id) { //If user has already won
      displayCurrentBoard();
      handleWin();
    }
    else { //If user has already loss
      displayCurrentBoard();
      handleLoss();
    }

  }, [correctSwimmer])

  //set index of answer
  function getAnswer(numSwimmers) {
    const today = new Date().toDateString();
    const idx = getIntegerFromDate(today, 0, numSwimmers-1);

    return idx;
  }


  //From chatgpt, gets deterministic index from date string within range
  function getIntegerFromDate(dateInput, min, max) {
  const date = new Date(dateInput);
  const seedString = date.toDateString(); // e.g., "Mon May 13 2025"
  
  // Create a basic hash from the date string
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Normalize to a value between min and max
  const range = max - min + 1;
  const value = Math.abs(hash) % range;
  return min + value;
}

  //Clears guesses from board for UI cleanup
  function clearGuesses() {
    // Removes all guesses from board
    const guesses = document.getElementById('guess-list-container');
    while (guesses.firstChild) {
        guesses.removeChild(guesses.firstChild);
    }
  }

  //Function that's called when the user has used up all of their guesses
  function doneForDay() {
    setDisabled(true);
  }

  function handleWin() {
    doneForDay();
    setGameWin(true);
    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti();

    setTimeout(() => {
      const reopen = document.getElementById("endgame");
      reopen.style.display="block";

      showEndGame();
    }, 2000);

    //restart game once it is the next day
  }

  function handleLoss() {
    doneForDay();
    setLoss(true);

    setTimeout(() => {
      //styling for endgame then show
      const comp = document.getElementById("endgame-feedback");
      comp.style.width = '80%';

      //show reopen button
      const reopen = document.getElementById("endgame");
      reopen.style.display="block";
      
      showEndGame();
    }, 2000);
    
  }

  //For testing
  function restart_game() {
    localStorage.setItem("numGuesses", "1");
    localStorage.setItem("guessList", "[]");
    localStorage.setItem("guessFeedback", "[]");
    setGuessList([]);
    setGuessFeedback([]);
    setDisabled(false);
    setGameWin(false);
    setLoss(false);

    let numSwimmers = swimmerData.length;

    //Clean up UI
   
    clearGuesses();
    closeInstructions();

    const idx_of_answer = getAnswer(numSwimmers);
    
    setCorrectSwimmer(swimmerData[idx_of_answer]);
  }


  //restart game if user deletes any local storage
  function checkLocalStorage() {

    if(localStorage.getItem("numGuesses") == null || 
        localStorage.getItem("guessList") == null || 
        localStorage.getItem("guessFeedback") == null){

      
      //Clears the input box after a guess
      setSwimmerGuess("");
      inputRef.current.value="";

      restart_game();
      return true;
    }
  }


  function submitGuess(e) {
    e.preventDefault();

    if (checkLocalStorage() === true) {
      return;
    }
    
    //Mark the last time user played
    localStorage.setItem("lastPlayed", new Date().toDateString());

    //The info of the swimmer that was guessed
    const swimmer = swimmerData.find(swimmer => swimmer.Name.toLowerCase() === swimmerGuess.toLowerCase());

    //Check if user guessed this swimmer yet
    let guesses = JSON.parse(localStorage.getItem("guessList"));
    let found = false;
    //Is this real swimmer
    const notSwimmer = swimmer === undefined;

    if(!notSwimmer) { //Check if user guessed this swimmer yet only if it's valid swimmer
      found = guesses.some(guess => guess.id === swimmer.id);
    }

    //Lets user know if their guess is valid
    if(notSwimmer || found) {
      document.getElementById("invalid-guess-text").style.visibility = "visible";
      if(found && !notSwimmer) {
        document.getElementById("invalid-guess-text").textContent = "This swimmer was guessed already";
      } else {
        document.getElementById("invalid-guess-text").textContent = "Invalid Guess";
      }
      return;
    }
    else { //If swimmer is valid, hide the invalid guess text and hide dropdown items
      document.getElementById("invalid-guess-text").style.visibility = "hidden";
      document.getElementById("invalid-guess-text").textContent = "";
      document.getElementById("dropdown-items").style.visibility = "hidden";
    }



    const numGuesses = parseInt(localStorage.getItem("numGuesses"));

    const guessFeedback = getGuessFeedback(swimmer, correctSwimmer);
    
    // Handle Guess
    if(swimmer.id === correctSwimmer.id) { //correct guess
      localStorage.setItem("guessList", JSON.stringify([swimmer, ...guessList ]));
      localStorage.setItem("guessFeedback", JSON.stringify([guessFeedback, ...guessFeedbackList]));

      setGuessList([swimmer, ...guessList]);
      setGuessFeedback([guessFeedback, ...guessFeedbackList]);
      
      handleWin();
    }
    else {//incorrect guess
      localStorage.setItem("guessList", JSON.stringify([swimmer, ...guessList]));
      localStorage.setItem("guessFeedback", JSON.stringify([guessFeedback, ...guessFeedbackList, ]));

      setGuessList([swimmer, ...guessList]);
      setGuessFeedback([guessFeedback, ...guessFeedbackList]);
      
      //LOSS CONDITION
      if(numGuesses >= 5) { //Game over if not win yet and guesses over 5
        handleLoss();
      }
    }


    let dropdown = document.getElementById("dropdown-items");

    let swimmers = dropdown.getElementsByClassName("dropdown-item");

    // reset dropdown list(always do this)
    for(let i = 0; i < swimmers.length; i++) {
      swimmers[i].style.display = 'flex';
    }

    //update number of guesses
    localStorage.setItem("numGuesses", `${numGuesses+1}`);

    //Clears the input box after a guess
    setSwimmerGuess("");
    inputRef.current.value="";


    //Update UI
    guesses = JSON.parse(localStorage.getItem("guessList"));

    let newGuess = guesses[0];

    const newDiv = document.createElement("div");
    const root = createRoot(newDiv);
    
    root.render(<GuessFeedbackComponent guess={newGuess} ind={0}/>);
    let container = document.getElementById("guess-list-container");
    let currentHead = container.firstElementChild;
    if (container.childNodes.length === 0) {
      newDiv.classList.add("guess-list-new");
      container.appendChild(newDiv);

      setTimeout(() => {
        newDiv.classList.add("opacity");
      }, 0);
      
      setTimeout(() => {
        newDiv.classList.remove("guess-list-new", "opacity");
      }, 1000);

      return;
    }

    newDiv.classList.add("guess-list-new");

    container.insertBefore(newDiv, currentHead);

    setTimeout(() => {
      newDiv.classList.add("fade-in");
    }, 0);
    setTimeout(() => {
      newDiv.classList.add("opacity");
    }, 700);

    setTimeout(() => {
      newDiv.classList.remove("guess-list-new", "fade-in", "opacity");
    }, 2000);
  }

  //When user comes back to page, game should display the current board
  function displayCurrentBoard() {
    //Clear board in case there are stragglers
    clearGuesses();

    let listParent = document.getElementById("guess-list-container");
    for(let i=0; i <guessList.length; i++) {
      const newGuess = guessList[i];
      const newDiv = document.createElement("div");
      const root = createRoot(newDiv);
      root.render(<GuessFeedbackComponent guess={newGuess} ind={i}/>);
      
      listParent.appendChild(newDiv);
    }
  }

  

  //get age of swimmer
  //param: string of swimmer's bday
  function getAge(birthday_string) {
    let today = new Date();

    let birthday = new Date(birthday_string);

    const diffInMs = today-birthday;
    const years = diffInMs / (1000*60*60*24*365)
    const age = Math.floor(years);
    return age;
    
  }

  //get stroke color
  //params: string of guessed swimmer's stroke(s), string of correct swimmer's stroke(s)
  //If strokes are the same: green
  //If only one stroke correct(if multiple): yellow
  //If no strokes are the same: red
  function getStrokeCorrectness(guessStroke, correctStroke) {
    let strokeFeedback = null;
    if (guessStroke === correctStroke) {
      strokeFeedback = "green";
      return strokeFeedback;
    }

    let yellow = false;
    const guessStrokes = guessStroke.split(", ");
    const correctStrokes = correctStroke.split(", ");

    
    for(let i = 0; i < guessStrokes.length; i++) {
      for (let j = 0; j < correctStrokes.length; j++) {
        //If any stroke similarity, return yellow
        if (guessStrokes[i] === correctStrokes[j]) {
          yellow = true;
        }
      }
    }

    if(yellow) {
      strokeFeedback = "yellow";
    } else { //if there are no similarities, return red
      strokeFeedback = "red";
    }

    return strokeFeedback;
  }

  //get nationality correctness
  //If same nationality, return green
  //If same continent, return yellow
  //If different continents, return red
  function getNationalityCorrectness(guess, correct) {
    //If same nationality, return green
    if(guess.Nationality === correct.Nationality) {
      return "green";
    }

    if(guess["Continent 1"] === correct["Continent 1"] ||
      guess["Continent 2"] === correct["Continent 1"] ||
      (guess["Continent 2"] === correct["Continent 2"] &&
        guess["Continent 2"] !== 'N/A' &&
        correct["Continent 2"] !== 'N/A')
    ) {
      return "yellow";
    }

    return "red";

  }

  //get college correctness
  //If same college, return green
  //If same conference, return yellow
  //If nota, return red
  //NOTE: ONLY considering most recent college rn
  function getCollegeCorrectness(guess, correct) {
    if(guess["US College / University"] === correct["US College / University"]) { //correct college
      return "green";
    }

    if(guess["DI Conference"] === correct["DI Conference"]) {
      return "yellow";
    }

    return "red";


  }

  //Gets all the feedback on the guess
  //Whether the age, stroke, college, nationality, etc. is correct or close
  function getGuessFeedback(swimmerGuess, correctSwimmer) {
    const guess = swimmerGuess;
    const correct = correctSwimmer;

    let age, ageColor, stroke, specialty, nationality, gender, college = null;

    //set age correctness
    const guessAge = getAge(guess.Birthday);
    age=guessAge;
    const correctAge = getAge(correct.Birthday);
    const diff = Math.abs(correctAge-guessAge);
    if (guessAge === correctAge) {
      ageColor = "green";
    }
    else if(diff <= 2) {
      if (guessAge < correctAge) {
        ageColor = "yellow^"; 
      }
      else {
        ageColor = "yellow_";
      }
    }
    else {
      if (guessAge < correctAge) {
        ageColor = "gray^"; 
      }
      else {
        ageColor = "gray_";
      }
    }

    //set stroke correctness
    stroke = getStrokeCorrectness(guess.Stroke, correct.Stroke);

    //set specialty correctness(sprint, distance, stroke, etc) 
    //getStrokeCorrectness also works for specialty
    specialty = getStrokeCorrectness(guess.speciality, correct.speciality)

    gender = getStrokeCorrectness(guess.Gender, correct.Gender);

    //get nationality correctness
    //If same nationality, return green
    //If same continent, return yellow
    //If different continents, return red
    nationality = getNationalityCorrectness(guess, correct);

    //get college correctness
    //If same college, return green
    //If one of the colleges they've been to is the same, return yellow
    //If no similar colleges, return red
    college = getCollegeCorrectness(guess, correct);


    //set up return object
    const feedback = {
      age: age,
      ageColor: ageColor,
      stroke: stroke,
      specialty: specialty,
      gender: gender,
      nationality: nationality,
      college: college
    }

    return feedback;
  }


  //Component that shows when the game is over
  function EndGameComponent() {
    
    return (
      <div style={{paddingTop: '2%'}}>
        {/* Only show when loss */}
        {gameLoss && (
          <div className='game-loss'>
            <div className='game-loss-description'>
              <span style = {{display: 'block'}}>You ran out of guesses :(</span>
              <span>The correct swimmer was {correctSwimmer.Name}</span>
            </div>
            

            <GuessFeedbackComponent id="endgame-feedback" guess={correctSwimmer} ind={-1}/>
          </div>
        )}



        { /* Only show this if gameWin hook is true */ }
        {gameWin && (
          <div className='game-win'>
          <h1>Game Over. You win!</h1>
        </div>)}

    </div>
    )
  }


  //Guess box component
  function GuessFeedbackComponent(props) {
    const guess = props.guess
    let ind = props.ind

    const id = props.id || "";

    let guessFeedbackList_ = JSON.parse(localStorage.getItem("guessFeedback"));

    const x = guess.Name.replaceAll(" ", "_")
    const img_src = "/swimmer_images/" + x + ".webp"



    //Handles when user loses
    if (ind === -1) {
      const guessFeedback = getGuessFeedback(correctSwimmer, correctSwimmer)
      guessFeedbackList_.push(guessFeedback)
      ind = 5
    }
    return(
      <div className="guess-list" id={id}>
      
      <div className="guess-name">
        <img src={img_src}
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop if fallback also fails
            e.target.src = "/swimmer_images/placeholder.png";
          }}
         alt={guess.Name}></img>
        {/* print out guess number and guess name */}
        <span className="guess-name-text">{guess.Name}</span>
      </div>
    
      
      <div className="guess-result" key={ind}>
        
        
        <div style={{backgroundColor: 
          guessFeedbackList_[ind].gender === 'green' ? 'green': grayColor,
          width: '30px'
        }}>
          <span className='hintCategory'>Gender</span>
          <span className="hint-answer-text">{guess.Gender}</span>
        </div>


        <div style = {{backgroundColor: 
          guessFeedbackList_[ind].ageColor === 'yellow_' ? yellowColor :
          guessFeedbackList_[ind].ageColor === 'yellow^' ? yellowColor :
          guessFeedbackList_[ind].ageColor === 'green' ? 'green': 
          grayColor,
          width: '30px'}}>

          {/* Add up and down arrow symbol, using unicode values */}
          <span className='hintCategory'>Age</span>
          <span className="hint-answer-text" id="age-hint">
          {guessFeedbackList_[ind].age}
          {guessFeedbackList_[ind].ageColor === 'yellow^' || guessFeedbackList_[ind].ageColor === 'gray^' ? <span style={{paddingLeft: '5px'}}><i className="fa-solid fa-arrow-up"></i></span>:
          guessFeedbackList_[ind].ageColor === 'yellow_'  || guessFeedbackList_[ind].ageColor === 'gray_'? <span style={{paddingLeft: '5px'}}><i className="fa-solid fa-arrow-down"></i></span> : ''}
          </span>

        </div>


        <div style = {{backgroundColor: 
          guessFeedbackList_[ind].stroke === 'yellow' ? yellowColor :
          guessFeedbackList_[ind].stroke === 'green' ? 'green': 
          grayColor,
          width: '100px'}}>
          
          <span className='hintCategory'>Stroke</span>
          <span className="hint-answer-text">{guess.Stroke}</span>
        </div>


        <div style = {{backgroundColor: 
          guessFeedbackList_[ind].specialty === 'yellow' ? yellowColor :
          guessFeedbackList_[ind].specialty === 'green' ? 'green': 
          grayColor,
          width: '100px'}}>

          <span className='hintCategory'>Specialty</span>
          <span className="hint-answer-text">{guess.speciality}</span>
        </div>

        <div style = {{backgroundColor: 
          guessFeedbackList_[ind].nationality === 'yellow' ? yellowColor :
          guessFeedbackList_[ind].nationality === 'green' ? 'green': 
          grayColor,
          width: '40px'}}>
            
          <span className='hintCategory'>Nationality</span>
          <span className="hint-answer-text">{guess.Nationality}</span>
        </div>


        <div style = {{backgroundColor: 
          guessFeedbackList_[ind].college === 'yellow' ? yellowColor :
          guessFeedbackList_[ind].college === 'green' ? 'green': 
          grayColor,
          width: '150px'}}>
            
          <span className='hintCategory'>College</span>
          
          <span className="hint-answer-text">
          {guess["US College / University"] === 'N/A' ? 'N/A' : 
          guess["US College / University"]}
          </span>
          
        
        </div>
      </div> 
      </div>
    )
  }

  //FUNCTIONS FOR SEARCH FUNCTIONALITY
  function searchNames(e) {
    let search = e.target.value.toLowerCase();
    let dropdown = document.getElementById("dropdown-items");

    if (search.length >=1 ) dropdown.style.visibility = "visible";

    let swimmers = dropdown.getElementsByClassName("dropdown-item");

    for(let i = 0; i < swimmers.length; i++) {
        let swimmerName = swimmers[i].getElementsByClassName("swimmer-name")[0];
        
        let name = swimmerName.textContent.toLowerCase();

        if (name.indexOf(search) > -1) {
            swimmers[i].style.display = "flex";
        } else {
            swimmers[i].style.display = "none";
        }

        
    }
}
//FUNCTION FOR SEARCH FUNCTIONALITY
function fillInput(name) {
    let input = document.getElementById("text-input");
    
    input.value = name;
    setSwimmerGuess(name);
}

// Show instructions and disable/dim rest of screen
function showInstructions() {
  document.getElementById("instructions-popup-container").style.display="block";
  document.body.classList.add('no-scroll'); // disable scrolling
  document.getElementById("overlay").classList.add("active");
}

// Close instructions (and endgame component if it's endgame)
function closeInstructions() {
  document.getElementById("instructions-popup-container").style.display="none";
  document.getElementById("endgame-popup-container").style.display="none";
  document.getElementById("endgame-popup-container").style.opacity=0;
  document.body.classList.remove('no-scroll');
  document.getElementById("overlay").classList.remove("active");
}

//Shows after user wins/loses
function showEndGame() {
  document.getElementById("endgame-popup-container").style.display="block";
  
  //Timeout here so that the animation fires
  setTimeout(() => {
    document.getElementById("endgame-popup-container").style.opacity="100%";

  }, 10);

  document.body.classList.add('no-scroll'); // disable scrolling
  document.getElementById("overlay").classList.add("active");
}



if(loading) {
  return (
    <div>
      <h1>LOADING...</h1>
    </div>
  )
}

  return (
    <>
      <div className="overlay" id="overlay" onClick={closeInstructions}></div>
      <div className="header">
        {(gameWin || gameLoss) && (
          <div className="open-endgame" id="endgame" onClick={showEndGame}>
          <i className="fa-solid fa-arrow-rotate-right"></i>
          </div>
        )
        }
        
        <h1>SWORDLE</h1>
        <div className="instructions-icon" onClick={showInstructions}>
          <i className="fa fa-question-circle"></i>
        </div>
      </div>

      <div className="game-container" id="game-container">
        <div className="guess-box">

          <div className="guess-form">
            <span className="label">Guess a swimmer: </span>

            {/* numGuess is at 6(after game ends) keep display at 5 */}
              { 
              parseInt(localStorage.getItem("numGuesses")) >= 5 ? 
              <span className="guess-counter">Guess #5 of 5</span> :
              <span className="guess-counter"> Guess #{parseInt(localStorage.getItem("numGuesses"))} of 5</span>
              }   
            
            <div id="input-and-guess-btn">
              
              <input 
                    className="guess-input"
                    autoComplete='off'
                    id="text-input"
                    ref={inputRef} // Assign ref to input
                    list="swimmers" 
                    name="swimmer" 
                    placeholder="Enter Swimmer"
                    onChange={(e) => setSwimmerGuess(e.target.value)} 
                    onKeyUp={searchNames}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        document.getElementById("guess-button").click();
                      }}
                    disabled={guessDisabled}
                    onFocus={() => {dropdownRef.current.style.visibility='visible'}}
                    onBlur={() => {dropdownRef.current.style.visibility='hidden'}}
                    style = {{backgroundColor:
                      guessDisabled ? 'gray' : 'rgb(81, 169, 172)',
                      paddingLeft:'5%'
                    }}
              />
              <input className="guess-button" id="guess-button"
                     type="submit" 
                     value="Guess" 
                     disabled={guessDisabled}
                     onClick={submitGuess}></input> 
            </div>

            <span className="invalid-guess-text" id="invalid-guess-text"></span>

            {/* Search Dropdown */}
            <div className="dropdown-items" id="dropdown-items" ref={dropdownRef}>
              {swimmerData.map((swimmer) => (
                <div className="dropdown-item" onMouseDown={() => {fillInput(swimmer.Name)}}>
                  <img className="swimmer-img"
                   src={"/swimmer_images/" + swimmer.Name.replaceAll(" ", "_") + ".webp"} 
                   onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop if fallback also fails
                      e.target.src = "/swimmer_images/placeholder.png";
                    }}
                   alt={swimmer.Name}/>
                  <span className="swimmer-name" key={swimmer.id}>{swimmer.Name}</span>
                </div>
              ))}
            </div>

              
          </div>
        </div>

        {/* <EndGameComponent/> */}

        <div className="guess-list-container" id="guess-list-container">
        </div>

      </div>

      <div className="instructions-popup-container" id="instructions-popup-container">
        <div className="instructions-close-button" onClick={closeInstructions}>
          <span className='closeout'>&times;</span>
        </div>

        <h3 style={{color: 'black', textAlign: 'center', paddingBottom: '1.5%'}}>SWORDLE TIPS</h3>
        
        <ul className="instructions-list">
          <li>If Stroke is <span style={{color: 'rgb(179, 161, 50)'}}>yellow</span>, one but not all of the strokes are correct</li>
          <li>If Nationality is <span style={{color: 'rgb(179, 161, 50)'}}>yellow</span>, the Country is on the correct Continent</li>
          <li>If College is <span style={{color: 'rgb(179, 161, 50)'}}>yellow</span>, the College is in the correct Conference</li>
          <li>If Age is <span style={{color: 'rgb(179, 161, 50)'}}>yellow</span>, the Age is within 2 years of the correct Age</li>
          <li>College is the last college the swimmer swam at</li>
        </ul>

        <p className="note-text">Note: The current swimmer data is ~2 years old, so some colleges may be
          incorrect if the swimmer transferred recently. Also, some swimmers may just be 
          irrelevant now, so keep that in mind. 
        </p>
        <p className = "shoutout-text">Special shoutout to Tim Cheng for making the data used for Swordle</p>
      </div>


      <div className="endgame-popup-container" id="endgame-popup-container">
        <div className="instructions-close-button" onClick={closeInstructions}>
          <span className='closeout'>&times;</span>
        </div>


        <EndGameComponent/>

        <div className='game-loss-description'>
          <span className="come-back">Come back tomorrow for a new game!</span>
        </div>
        {/* This will be only gameLoss when done
        {(gameLoss||gameWin) && (
          <button className="try-again" onClick={restart_game}>TRY AGAIN</button>
        )} */}
      </div>
    </>
  );
}

export default App;