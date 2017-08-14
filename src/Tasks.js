import React, {Component} from 'react';
import {db} from "./firebase.js"

class Tasks extends Component {
  constructor (props) {
    super(props)
    this.state = {tasks: []}
    this.setTasks = this.setTasks.bind(this)
  }

  setTasks (tasks) {
    this.setState({tasks})
  }

  componentWillMount() {
    db.ref('tasks/').on('value', snapshot => {
      const tasksObj = snapshot.val() || {} // when no tasks it's null
      const tasks = Object.keys(tasksObj).map(k => Object.assign(tasksObj[k], {id: k}))
      return this.setTasks(tasks)
    })
  }

  render () { return (
    <ul>
      {this.state.tasks.map(task => (
        <li key={task.id}>
          <input type="checkbox" />
          {task.title}
        </li>
      ))}
    </ul>
  )}
}

export default Tasks
