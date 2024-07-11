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
  const [idx_of_answer, set_idx] = useState(Math.floor(Math.random() * 399))

  const yellowColor = 'rgb(179, 161, 50)'
  const grayColor = 'rgb(51, 51, 51)';

  // Ref for the input element
  const inputRef = useRef(null);

  // Gets the swimmer data on page render
  // initializes number of guesses
  // ensures user is not over number of allowed guesses
  useEffect(() => {
    async function getSwimmers() {
      const response = await fetch("http://localhost:8080/api/swordle/", {
        method: "GET"
      })

      const res_data = await response.json()
      setSwimmerData(res_data.swimmers);
      setCorrectSwimmer(res_data.swimmers[idx_of_answer]);
      

      //Check if user has played yet today, if not, set numGuesses
      if(localStorage.getItem("numGuesses") == null) {
        localStorage.setItem("numGuesses", "1");
      }

      if(parseInt(localStorage.getItem("numGuesses")) >= 5) {
        doneForDay();
      }
    }

    getSwimmers();

  }, [idx_of_answer]); //runs again when idx_of_answer changes, so that the correct answer actually changes when idx does


  //Function that's called when the user has used up all of their guesses
  function doneForDay() {
    setDisabled(true);
    setLoss(true);
  }

  //For testing
  function restart_game() {
    localStorage.setItem("numGuesses", "1");
    setGuessList([]);
    setGuessFeedback([]);
    setDisabled(false);
    setGameWin(false);
    setLoss(false);
    set_idx(Math.floor(Math.random() * 399));
  }


  function submitGuess(e) {
    e.preventDefault();

    //The info of the swimmer that was guessed
    const swimmer = swimmerData.find(swimmer => swimmer.Name === swimmerGuess);

    //Lets user know if their guess is valid
    if(swimmer == undefined) {

      //TODO: add function to deal with this on frontend
      alert("This swimmer is not a possible answer");
      return;
    }

    const numGuesses = parseInt(localStorage.getItem("numGuesses"));

    const guessFeedback = getGuessFeedback(swimmer, correctSwimmer);

    //TODO: handle guess
    if(swimmer.Name === correctSwimmer.Name) { //correct guess
      setGuessList([...guessList, swimmer]);
      setGuessFeedback([...guessFeedbackList, guessFeedback]);
      setGameWin(true);
      setDisabled(true);
    }
    else {//incorrect guess
      setGuessList([...guessList, swimmer]);
      setGuessFeedback([...guessFeedbackList, guessFeedback]);

      if(numGuesses >= 5) { //Game over if not win yet and guesses over 5
        doneForDay();
      }
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
    console.log(correctSwimmer);

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

  return (
    <>
      <div className="header">
        <h1>SWORDLE</h1>
      </div>

      <div className="game-container">
        <div className="guess-box">

          <form onSubmit={submitGuess} className="guess-form">


            <span className="label">Guess a swimmer: </span>
            
            <br></br>

            <input 
                  className="guess-input"
                  ref={inputRef} // Assign ref to input
                  list="swimmers" 
                  name="swimmer" 
                  onChange={(e) => setSwimmerGuess(e.target.value)} 
                  disabled={guessDisabled}
                  style = {{backgroundColor:
                    guessDisabled ? 'gray' : 'rgb(81, 169, 172)'
                  }}
            />

            <datalist className="swimmers-dropdown" id="swimmers">
              {swimmerData.map((swimmer) => (
                <option value={swimmer.Name} key={swimmer._id}/>
              ))}
            </datalist>
              <input className="guess-button" type="submit" value="Guess"></input>
          </form>
        </div>

        <div className="guess-list" id="guess-list">
            {guessList.map((guess, ind) => (
              <>
              <div className="guess-name">Guess #{ind+1}: {guess.Name}</div>
              <div className="guess-result" key={ind}>
                
                
                <div style={{backgroundColor: 
                  guessFeedbackList[ind].gender === 'green' ? 'green': grayColor
                }}>
                  <span className='hintCategory'>Gender</span>
                  {guess.Gender}
                </div>

                <div style = {{backgroundColor: 
                  guessFeedbackList[ind].ageColor === 'yellow_' ? yellowColor :
                  guessFeedbackList[ind].ageColor === 'yellow^' ? yellowColor :
                  guessFeedbackList[ind].ageColor === 'green' ? 'green': 
                  grayColor}}>

                  {/* Add up and down arrow symbol, using unicode values */}
                  <span className='hintCategory'>Age</span>
                  {guessFeedbackList[ind].age}
                  {guessFeedbackList[ind].ageColor === 'yellow^' ? ' \u2191':
                  guessFeedbackList[ind].ageColor === 'yellow_' ? ' \u2193' : ''}

                </div>


                <div style = {{backgroundColor: 
                  guessFeedbackList[ind].stroke === 'yellow' ? yellowColor :
                  guessFeedbackList[ind].stroke === 'green' ? 'green': 
                  grayColor}}>
                  
                  <span className='hintCategory'>Stroke</span>
                  {guess.Stroke}
                </div>


                <div style = {{backgroundColor: 
                  guessFeedbackList[ind].specialty === 'yellow' ? yellowColor :
                  guessFeedbackList[ind].specialty === 'green' ? 'green': 
                  grayColor}}>

                  <span className='hintCategory'>Specialty</span>
                  {guess.Speciality}
                </div>

                <div style = {{backgroundColor: 
                  guessFeedbackList[ind].nationality === 'yellow' ? yellowColor :
                  guessFeedbackList[ind].nationality === 'green' ? 'green': 
                  grayColor}}>
                    
                  <span className='hintCategory'>Nationality</span>
                  {guess.Nationality}
                </div>


                <div style = {{backgroundColor: 
                  guessFeedbackList[ind].college === 'yellow' ? yellowColor :
                  guessFeedbackList[ind].college === 'green' ? 'green': 
                  grayColor}}>
                    
                  <span className='hintCategory'>College</span>
                  {guess["US College / University"] === null ? 'N/A' : 
                  guess["US College / University"]}</div>
              </div>
              </>
            ))}
        </div>

        
        {/* Only show when loss */}
        {gameLoss && (
          <div className='game-loss'>
            <span style = {{display: 'block'}}>You ran out of guesses :(</span>
            <span>The correct swimmer was {correctSwimmer.Name}</span>
          </div>
        )}



        { /* Only show this if gameWin hook is true */ }
        {gameWin && (
          <div className='game-win'>
          <span>Game Over. You win!</span>
        </div>)}

        <div className="restart-container">
          <button onClick={restart_game} >restart</button>
        </div>
      </div>
    </>
  );
}

export default App;
