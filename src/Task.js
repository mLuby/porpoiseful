import React from 'react'
import moment from "moment"
import {db} from "./firebase.js"
import {compose, withState, withHandlers} from "recompose"

function Task (props) {
  const {task, editing, toggleEditing, onTitleEdit, onTitleEditSubmit, editedTitle} = props

  return (
    <li className={`Task${task.completedAt?" completed":""}`} title={task.id}>
      {editing ? (
        <form className="editing" onSubmit={onTitleEditSubmit} action="#">
          <label><span className="icon" role="img" aria-label="editing" onClick={toggleEditing}>📝</span>
            <input type="text" value={editedTitle} onChange={onTitleEdit} autoFocus onBlur={toggleEditing}/>
          </label>
        </form>
      ) : (
        <div>
          <input type="checkbox" checked={task.completedAt} onClick={toggleComplete(task)} />
          <span className="details" onClick={toggleEditing}>
            {task.title && <span className="title">{task.title}</span>}
            {task.completedAt && <span className="completedAt">{moment(task.completedAt).fromNow()}</span>}
            {task.createdAt && <span className="createdAt">{moment(task.createdAt).fromNow()}</span>}
          </span>
        </div>
      )}
    </li>
  )
}

function toggleComplete (task) {
  return () => {
    task.completedAt = task.completedAt ? null : (new Date()).toISOString()
    console.log(`${task.completedAt ? "" : "un"}completing '${task.title}'`)
    db.ref('/tasks/'+task.id).set(task)
  }
}

export default compose(
  withState('editedTitle', 'setEditTitle', props => props.task.title),
  withState('editing', 'setEditing', false),
  withHandlers({
    onTitleEdit: props => event => props.setEditTitle(event.target.value),
    onTitleEditSubmit: props => event => {
      console.log(props.task.title, "->", props.editedTitle)
      event.preventDefault()
      props.setEditing(false)
      props.task.title = props.editedTitle
      db.ref("tasks/"+props.task.id).set(props.task)
    },
    toggleEditing: props => () => {
      props.setEditing(!props.editing)
      props.setEditTitle(props.task.title)
    },
  })
)(Task)
