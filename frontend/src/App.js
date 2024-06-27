import logo from './logo.svg';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [swimmerData, setSwimmerData] = useState([]);
  const [swimmerGuess, setSwimmerGuess] = useState("");
  const [correctSwimmer, setCorrectSwimmer] = useState("");


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
      setCorrectSwimmer(swimmerData[idx_of_answer]);
      

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
    alert("TODO: done for day");
  }


  function submitGuess(e) {
    e.preventDefault();
    const swimmer = swimmerData.find(swimmer => swimmer.Name === swimmerGuess);

    const numGuesses = parseInt(localStorage.getItem("numGuesses"));
    console.log(numGuesses);
    localStorage.setItem("numGuesses", `${numGuesses+1}`);
  }

  return (
    <>
      <div class="header">
        <h1>SWORDLE</h1>
      </div>

      <div class="game-container">
        <div class="guess-box">

          <form onSubmit={submitGuess} class="guess-form">
          <label>Guess a swimmer:
          <input list="swimmers" name="swimmers" onChange={(e) => setSwimmerGuess(e.target.value)} /></label>
          <datalist id="swimmers">
            {swimmerData.map((swimmer) => (
              <option value={swimmer.Name} key={swimmer._id}/>
            ))}
          </datalist>
            <input type="submit" value="Guess"></input>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
