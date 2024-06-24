import logo from './logo.svg';
import { useState, useEffect } from 'react';
import './App.css';

function App() {


  useEffect(() => {
    async function getSwimmers() {
      const response = await fetch("http://localhost:8080/api/swordle/", {
        method: "GET"
      })

      const res_data = response.json()
      console.log(res_data.body);
    }

    getSwimmers();

  })

  return (
    <>
      <div class="header">
        <h1>SWORDLE</h1>
      </div>

      <div class="game-container">
        <div class="guess-box">

          <form class="guess-form">
          <label>Guess a swimmer:
          <input list="browsers" name="myBrowser" /></label>
          <datalist id="browsers">
            <option value="Chrome"/>
            <option value="Firefox"/>
            <option value="Internet Explorer"/>
            <option value="Opera"/>
            <option value="Safari"/>
            <option value="Microsoft Edge"/>
          </datalist>
            <input type="submit" value="Guess"></input>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
