import React, {Component} from 'react';
import db from "./firebase.js"

class Tasks extends Component {
  constructor (props) {
    super(props)
    this.state = {tasks: []}
    this.setTasks = this.setTasks.bind(this)
  }

  setTasks (tasks) {
    console.log('setting tasks', tasks)
    console.log("this.state.tasks", this.state.tasks)
    this.setState({tasks: tasks})
  }

  componentWillMount() {
    db.ref('tasks/').on('value', snapshot => {
      const tasksObj = snapshot.val()
      const tasks = Object.keys(tasksObj).map(k => tasksObj[k])
      return this.setTasks(tasks)
    })
  }

  render () { return (
    <ul>
      {this.state.tasks.map(task => (
        <li key={task.title}>
          <input type="checkbox" />
          {task.title}
        </li>
      ))}
    </ul>
  )}
}

export default Tasks
