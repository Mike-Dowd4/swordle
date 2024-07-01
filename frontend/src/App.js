import logo from './logo.svg';
import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [swimmerData, setSwimmerData] = useState([]);
  const [swimmerGuess, setSwimmerGuess] = useState("");
  const [correctSwimmer, setCorrectSwimmer] = useState(null);
  const [guessList, setGuessList] = useState([]);
  const [guessFeedbackList, setGuessFeedback] = useState([]);

  // Ref for the input element
  const inputRef = useRef(null);

  //index of the correct swimmer
  const idx_of_answer = 1;

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

      console.log(res_data.swimmers[idx_of_answer]);
      

      //Check if user has played yet today, if not, set numGuesses
      if(localStorage.getItem("numGuesses") == null) {
        localStorage.setItem("numGuesses", "0");
      }

      if(parseInt(localStorage.getItem("numGuesses")) >= 5) {
        doneForDay();
      }
    }

    getSwimmers();

  }, []);


  //Function that's called when the user has used up all of their guesses
  function doneForDay() {
    alert("TODO: done for day(out of guesses)");
  }

  //For testing
  function restart_game() {
    localStorage.setItem("numGuesses", "0");
    setGuessList([]);
    setGuessFeedback([]);
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

    const guessFeedback = getGuessFeedback(swimmer, correctSwimmer);

    //TODO: handle guess
    if(swimmer.Name === correctSwimmer.Name) { //correct guess
      alert("You Win!");
      restart_game();
    }
    else {//incorrect guess
      setGuessList([...guessList, swimmer]);
      setGuessFeedback([...guessFeedbackList, guessFeedback]);
    }


    const numGuesses = parseInt(localStorage.getItem("numGuesses"));

    if(numGuesses >= 5) { //Game over
      doneForDay();
    }

    //update number of guesses
    localStorage.setItem("numGuesses", `${numGuesses+1}`);

    //Clears the input box after a guess
    setSwimmerGuess("");
    inputRef.current.value="";

  }

  function getAge(birthday_string) {
    let today = new Date();

    let birthday = new Date(birthday_string);

    const diffInMs = today-birthday;
    const years = diffInMs / (1000*60*60*24*365)
    const age = Math.floor(years);
    console.log(birthday_string);
    console.log(today,birthday);

    return age;
    
  }

  //Gets all the feedback on the guess
  //Whether the age, stroke, college, nationality, etc. is correct or close
  function getGuessFeedback(swimmerGuess, correctSwimmer) {
    const guess = swimmerGuess;
    const correct = correctSwimmer;

    let age, ageColor, stroke, college, isl_team, country = null;

    //set age correctness
    const guessAge = getAge(guess.Birthday);
    age=guessAge;
    console.log("calculated age = ", age);
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



    const feedback = {
      age: age,
      ageColor: ageColor
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
          <label>Guess a swimmer:
          <input ref={inputRef} // Assign ref to input
                list="swimmers" 
                name="swimmers" 
                onChange={(e) => setSwimmerGuess(e.target.value)} />

          </label>
          <datalist id="swimmers">
            {swimmerData.map((swimmer) => (
              <option value={swimmer.Name} key={swimmer._id}/>
            ))}
          </datalist>
            <input type="submit" value="Guess"></input>
          </form>
        </div>

        <ol className="guess-list" id="guess-list">
            {guessList.map((guess, ind) => (
              <li key={ind}>
                {guess.Name}, age = {guessFeedbackList[ind].age}{(guessFeedbackList[ind].ageColor)}
              </li>
            ))}
        </ol>

        <button style={{marginLeft: '50%'}}onClick={restart_game} >restart</button>
      </div>
    </>
  );
}

export default App;
