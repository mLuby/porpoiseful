import React, { Component } from 'react';
import './styles.css';
import NewTask from './NewTask.js'
import Tasks from './Tasks.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <NewTask/>
        <Tasks/>
      </div>
    );
  }
}

export default App;
