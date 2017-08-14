import React, { Component } from 'react';
import logo from './porpoise.png';
import './styles.css';
import NewTask from './NewTask.js'
import Tasks from './Tasks.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Porpoiseful</h2>
        </div>
        <NewTask/>
        <Tasks/>
      </div>
    );
  }
}

export default App;
