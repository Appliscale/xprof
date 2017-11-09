import React from "react";

export default class CalleeExplorer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      callees: []
    };
  }

  componentDidMount() {
    this.getCallees();
  }

  getCallees() {
    const mfa = this.props.mfa;

    $.ajax({
      url: "/api/get_callees",
      data: {
        mod: mfa[0],
        fun: mfa[1],
        arity: mfa[2]
      }
    }).done((response) => {
      this.setState({
        callees: response
      });
    });
  }

  handleCalleeClick(e) {
    const calleeQuery = e.target.value;

    $.ajax({
      url: "/api/mon_start",
      data: { query: calleeQuery }
    });
  }

  render() {
    const callees = this.state.callees;
    var output;

    if (callees.length !== 0) {
      output = callees.map((mfa) => {
        return (
          <button key={mfa} type="button" className="btn btn-default btn-sm" onClick={this.handleCalleeClick} value={mfa}>
            {mfa}
          </button>
        );
      });
    }
    else {
      output = "This function has no callees to explore.";
    }

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          Explore callees
        </div>
        <div className="panel-body">
          {output}
        </div>
      </div>
    );
  }
}