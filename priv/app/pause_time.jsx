import "underscore";
import React from "react";

export default class PauseTime extends React.Component {
  constructor(props) {
    super(props);
    this.state = { paused: false };
  }

  handleClick() {
    this.props.pauseTime();
    this.state.paused = !this.state.paused;
    this.setState(this.state);
  }

  render() {
    var symbol = "glyphicon glyphicon-";
    var btnColor = "btn btn-";
    var text = "";
    let paused = this.state.paused;

    if (!paused) {
      text = "Pause Time";
      symbol += "pause";
      btnColor += "danger";
    } else {
      text = "Resume Time";
      symbol += "play";
      btnColor += "success";
    }

    return (
      <form className="navbar-form navbar-left" style={{ paddingRight: 0 }} role="search">
        <button type="button" onClick={this.handleClick.bind(this)} className={btnColor}>
          <span className={symbol} aria-hidden="true"></span> {text}
        </button>
      </form>);
  }

}