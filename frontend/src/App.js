import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <>
      <div class="header">
        <h1>SWORDLE</h1>
      </div>

      <div class="game-container">
        <div class="guess-box">

          <form class="guess-form">
            <input type="text" id="guess" name="guess" placeholder="Guess a swimmer"></input>
            <input type="submit" value="Guess"></input>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
