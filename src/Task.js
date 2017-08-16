import React from 'react'
import moment from "moment"
import {db} from "./firebase.js"
import {compose, withState, withHandlers} from "recompose"
import {Holdable} from "react-touch"

function Task (props) {
  if (props.editing) {
    return (
      <li className={`Task${props.task.completedAt?" completed":""}`} title={props.task.id}>
        <form className="editing" onSubmit={props.onTitleEditSubmit} action="#">
          <label><span className="icon" role="img" aria-label="editing" onClick={props.toggleEditing}>📝</span>
            <input type="text" value={props.editedTitle} onChange={props.onTitleEdit} autoFocus onBlur={props.toggleEditing}/>
          </label>
        </form>
      </li>
    )
  } else if (props.snoozing) {
    return (
      <li className="Task" title={props.task.id}>
        <span className="icon" role="img" aria-label="close" onClick={props.toggleSnoozing}>✖️</span>
        <select autoFocus onBlur={props.toggleSnoozing} onChange={props.snooze}>
          <option value={"N/A"}>How long to snooze?</option>
          <option value={"15s"}>15s</option>
          <option value={"later"}>Later (+3h)</option>
          <option value={"this afternoon"}>This afternoon (1pm)</option>
          <option value={"this evening"}>This evening (7pm)</option>
          <option value={"tomorrow morning"}>Tomorrow morning (9am)</option>
          <option value={"tomorrow afternoon"}>Tomorrow afternoon (1pm)</option>
          <option value={"tomorrow evening"}>Tomorrow evening (7pm)</option>
          <option value={"weekend"}>Weekend (Fri 7pm)</option>
          <option value={"next week"}>next Monday (9am)</option>
          <option value={"first of the month"}>first of the month (9am)</option>
          <option value={"clear"}>clear snooze</option>
        </select>
      </li>
    )
  } else {
    const classes = [...new Set([
      "Task",
      props.task.completedAt && "completed",
      props.task.snoozeTill && "snoozed",
    ])].filter(Boolean).join(" ")
    return (
      <Holdable onHoldComplete={props.toggleSnoozing}>
      <li className={classes} title={props.task.id}>
        <div>
          <input type="checkbox" checked={props.task.completedAt} onClick={props.toggleComplete} />
          <span className="details" onClick={props.toggleEditing}>
            {props.task.title && <span className="title">{props.task.title}</span>}
            {props.task.completedAt && <span className="completedAt">{moment(props.task.completedAt).fromNow()}</span>}
            {props.task.createdAt && <span className="createdAt">{moment(props.task.createdAt).fromNow()}</span>}
          </span>
        </div>
      </li>
      </Holdable>
    )
  }
}

const snoozeOptionToDate = {
  "N/A": () => { /* noop */},
  "15s": () => (new Date(Date.now() + 15*1000)).toISOString(),
  "later": () => (new Date(Date.now() + 3*60*1000)).toISOString(),
  // "this afternoon": () => (new Date(Date.now() + durationMs)).toISOString(),
  // "this evening": () => (new Date(Date.now() + durationMs)).toISOString(),
  // "tomorrow morning": () => (new Date(Date.now() + durationMs)).toISOString(),
  // "tomorrow afternoon": () => (new Date(Date.now() + durationMs)).toISOString(),
  // "tomorrow evening": () => (new Date(Date.now() + durationMs)).toISOString(),
  // "weekend": () => (new Date(Date.now() + durationMs)).toISOString(),
  // "next week": () => (new Date(Date.now() + durationMs)).toISOString(),
  // "first of the month": () => (new Date(Date.now() + durationMs)).toISOString(),
  "clear": () => (new Date()).toISOString(),
}

export default compose(
  withState('editedTitle', 'setEditTitle', props => props.task.title),
  withState('editing', 'setEditing', false),
  withState('snoozing', 'setSnoozing', false),
  withHandlers({
    onTitleEdit: props => event => props.setEditTitle(event.target.value),
    onTitleEditSubmit: props => event => {
      event.preventDefault()
      props.setEditing(false)
      if (props.editedTitle === "") {
        db.ref("tasks/"+props.task.id).remove().then(() => console.log(`deleted ${props.task.id}:${props.task.title}`)).catch(error => console.error(`failed to delete ${props.task.id}:${props.task.title}`, error))
      } else {
        props.task.title = props.editedTitle
        db.ref("tasks/"+props.task.id).set(props.task).then(() => console.log(`${props.task.title} -> ${props.editedTitle}`)).catch(error => console.error(`failed to edit ${props.task.id}:${props.task.title} -> ${props.editedTitle}`, error))
      }
    },
    toggleEditing: props => () => {
      props.setEditing(!props.editing)
      props.setEditTitle(props.task.title)
    },
    toggleSnoozing: props => () => {
      props.setSnoozing(!props.snoozing)
    },
    snooze: props => event => {
      const option = event.target.value
      props.setSnoozing(false)
      const snoozeTill = snoozeOptionToDate[option]()
      if (!snoozeTill) return
      db.ref(`tasks/${props.task.id}/snoozeTill`).set(snoozeTill).then(() => console.log(`snoozed till ${option} ${props.task.id}:${props.task.title}`)).catch(error => console.error(`failed to snooze ${props.task.id}:${props.task.title}`, error))
    },
    toggleComplete: props => () => {
      props.task.completedAt = props.task.completedAt ? null : (new Date()).toISOString()
      props.task.snoozeTill = null
      console.log(`${props.task.completedAt ? "" : "un"}completing '${props.task.title}'`)
      db.ref('/tasks/'+props.task.id).set(props.task)
    },
  })
)(Task)
