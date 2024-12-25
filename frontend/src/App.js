import logo from './logo.svg';
import { useState, useEffect, useRef } from 'react';
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
      

      //Check if user has played yet today, if not, set numGuesses
      if(localStorage.getItem("numGuesses") == null || 
        localStorage.getItem("guessList") == null || 
        localStorage.getItem("guessFeedback") == null || 
        localStorage.getItem("idx_of_answer") == null){


        localStorage.setItem("numGuesses", "1");
        //store the guessList and guessFeedback in localstorage
        localStorage.setItem("guessList", "[]");
        localStorage.setItem("guessFeedback", "[]");
        localStorage.setItem("idx_of_answer", (Math.floor(Math.random()*(res_data.swimmers.length-1))).toString());

        let idx_of_answer = parseInt(localStorage.getItem("idx_of_answer"));
        setCorrectSwimmer(res_data.swimmers[idx_of_answer]);
      }else { //user is in middle of game
       

        setGuessList(JSON.parse(localStorage.getItem("guessList")));
        setGuessFeedback(JSON.parse(localStorage.getItem("guessFeedback")));

        let idx_of_answer = parseInt(localStorage.getItem("idx_of_answer"));
        setCorrectSwimmer(res_data.swimmers[idx_of_answer]);
      }

      if(parseInt(localStorage.getItem("numGuesses")) >= 5) {
        doneForDay();
      }

      setLoading(false);
    }

    getSwimmers();

  }, []); 


  //Function that's called when the user has used up all of their guesses
  function doneForDay() {
    setDisabled(true);
    setLoss(true);
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


    localStorage.setItem("idx_of_answer", (Math.floor(Math.random()*(swimmerData.length-1))).toString());
    let idx_of_answer = parseInt(localStorage.getItem("idx_of_answer"));
    setCorrectSwimmer(swimmerData[idx_of_answer]);
  }


  //restart game if user deletes any local storage
  function checkLocalStorage() {

    if(localStorage.getItem("numGuesses") == null || 
        localStorage.getItem("guessList") == null || 
        localStorage.getItem("guessFeedback") == null || 
        localStorage.getItem("idx_of_answer") == null){

      
      //Clears the input box after a guess
      setSwimmerGuess("");
      inputRef.current.value="";

      restart_game();
      return true;
    }
  }


  function submitGuess(e) {
    e.preventDefault();

    if (checkLocalStorage() == true) {
      return;
    } 

    //The info of the swimmer that was guessed
    const swimmer = swimmerData.find(swimmer => swimmer.Name.toLowerCase() === swimmerGuess.toLowerCase());

    //Lets user know if their guess is valid
    if(swimmer == undefined) {

      //TODO: add function to deal with this on frontend
      // alert("This swimmer is not a possible answer");

      document.getElementById("invalid-guess-text").style.visibility = "visible";
      return;
    }
    else {
      document.getElementById("invalid-guess-text").style.visibility = "hidden";
    }


    const numGuesses = parseInt(localStorage.getItem("numGuesses"));

    const guessFeedback = getGuessFeedback(swimmer, correctSwimmer);

    //TODO: handle guess
    if(swimmer.Name === correctSwimmer.Name) { //correct guess
      localStorage.setItem("guessList", JSON.stringify([swimmer, ...guessList ]));
      localStorage.setItem("guessFeedback", JSON.stringify([guessFeedback, ...guessFeedbackList]));

      setGuessList([swimmer, ...guessList]);
      setGuessFeedback([guessFeedback, ...guessFeedbackList]);
      
      setGameWin(true);
      setDisabled(true);
    }
    else {//incorrect guess
      localStorage.setItem("guessList", JSON.stringify([swimmer, ...guessList]));
      localStorage.setItem("guessFeedback", JSON.stringify([guessFeedback, ...guessFeedbackList, ]));

      setGuessList([swimmer, ...guessList]);
      setGuessFeedback([guessFeedback, ...guessFeedbackList]);
      

      if(numGuesses >= 5) { //Game over if not win yet and guesses over 5
        doneForDay();
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
        guess["Continent 2"] != null &&
        correct["Continent 2"] != null)
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
    if (guessAge === correctAge) {
      ageColor = "green";
    }
    else if (guessAge < correctAge) {
      ageColor = "yellow^";
    }
    else {
      ageColor="yellow_";
    }

    //set stroke correctness
    stroke = getStrokeCorrectness(guess.Stroke, correct.Stroke);

    //set specialty correctness(sprint, distance, stroke, etc) 
    //getStrokeCorrectness also works for specialty
    specialty = getStrokeCorrectness(guess.Speciality, correct.Speciality)

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
            

            <GuessFeedbackComponent guess={correctSwimmer} ind={-1}/>
          </div>
        )}



        { /* Only show this if gameWin hook is true */ }
        {gameWin && (
          <div className='game-win'>
          <span>Game Over. You win!</span>
        </div>)}

    </div>
    )
  }


  //Guess box component
  function GuessFeedbackComponent(props) {
    const guess = props.guess
    let ind = props.ind

    let guessFeedbackList_ = guessFeedbackList

    if (ind == -1) {
      const guessFeedback = getGuessFeedback(correctSwimmer, correctSwimmer)
      guessFeedbackList_.push(guessFeedback)
      ind = 5
    }
    return(
      <div className="guess-list" id="guess-list">
      {/* PRINT THIS INSTEAD IF IT IS AT END OF GAME THAT THE USER LOST*/}
      {ind == 5 &&(
        <div className="guess-name">
          <img src="/swimmer_images/aaron_shackell.png" alt="swimmer image"></img>
          {/* print out guess number and guess name */}
          <span className="guess-name-text">{guess.Name}</span>
        </div>
      )}

      {/* For normal guess, print this */}
      {ind != 5 && (
        <div className="guess-name">
          <img src="/swimmer_images/aaron_shackell.png" alt="swimmer image"></img>
          {/* print out guess number and guess name */}
          <span className="guess-name-text">{guess.Name}</span>
        </div>
      )}

      
      <div className="guess-result" key={ind}>
        
        
        <div style={{backgroundColor: 
          guessFeedbackList[ind].gender === 'green' ? 'green': grayColor,
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
          <span className="hint-answer-text">
          {guessFeedbackList_[ind].age}
          {guessFeedbackList_[ind].ageColor === 'yellow^' ? ' \u2191':
          guessFeedbackList_[ind].ageColor === 'yellow_' ? ' \u2193' : ''}
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
          <span className="hint-answer-text">{guess.Speciality}</span>
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
          {guess["US College / University"] === null ? 'N/A' : 
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
    console.log("Yo");
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

// Close instructions
function closeInstructions() {
  document.getElementById("instructions-popup-container").style.display="none"
  document.body.classList.remove('no-scroll');
  document.getElementById("overlay").classList.remove("active");
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
        <h1>SWORDLE</h1>
        <div className="instructions-icon" onClick={showInstructions}>
          <i class="fa fa-question-circle"></i>
        </div>
      </div>

      <div className="game-container" id="game-container">
        <div className="guess-box">

          <div className="guess-form">
            <span className="label">Guess a swimmer: </span>
            
            <br></br>

            <div id="input-and-guess-btn">
              {/* numGuess is at 6(after game ends) keep display at 5 */}
              { 
              parseInt(localStorage.getItem("numGuesses")) >= 5 ? 
              <span className="guess-counter">Guess #5 of 5</span> :
              <span className="guess-counter"> Guess #{parseInt(localStorage.getItem("numGuesses"))} of 5</span>
              }   
              <br></br>
              <input 
                    className="guess-input"
                    autoComplete='off'
                    id="text-input"
                    ref={inputRef} // Assign ref to input
                    list="swimmers" 
                    name="swimmer" 
                    onChange={(e) => setSwimmerGuess(e.target.value)} 
                    onKeyUp={searchNames}
                    disabled={guessDisabled}
                    onFocus={() => {dropdownRef.current.style.visibility='visible'}}
                    onBlur={() => {dropdownRef.current.style.visibility='hidden'}}
                    style = {{backgroundColor:
                      guessDisabled ? 'gray' : 'rgb(81, 169, 172)',
                      paddingLeft:'5%'
                    }}
              />
              <input className="guess-button" 
                     type="submit" 
                     value="Guess" 
                     disabled={guessDisabled}
                     onClick={submitGuess}></input> 

              <span className="invalid-guess-text" id="invalid-guess-text">The swimmer you entered is invalid</span>
            </div>


            <div className="dropdown-items" id="dropdown-items" ref={dropdownRef}>
              {swimmerData.map((swimmer) => (
                <div className="dropdown-item" onMouseDown={() => {fillInput(swimmer.Name)}}>
                  <img className="swimmer-img" src="/swimmer_images/aaron_shackell.png"/>
                  <span className="swimmer-name" key={swimmer._id}>{swimmer.Name}</span>
                </div>
              ))}
            </div>

            
            {/* <datalist className="swimmers-dropdown" id="swimmers">
              {swimmerData.map((swimmer) => (
                <option value={swimmer.Name} key={swimmer._id}/>
              ))}
            </datalist>*/}
              
          </div>
        </div>

        <EndGameComponent/>

        <div className="guess-list-container" id="guess-list-container">
            {guessList.map((guess, ind) => (
              <>
              <GuessFeedbackComponent guess={guess} ind={ind} />
              </>
              
            ))}
        </div>

        <div className="restart-container">
          <button onClick={restart_game} >restart</button>
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
          <li>College is the last college the swimmer swam at</li>
        </ul>

        <p className="note-text">Note: The current swimmer data is ~2 years old, so some colleges may be
          incorrect if the swimmer transferred recently. Also, some swimmers may just be 
          irrelevant now, so keep that in mind. 
        </p>
        <p className = "shoutout-text">Special shoutout to Tim Cheng for making the data used for Swordle</p>
      </div>
    </>
  );
}

export default App;