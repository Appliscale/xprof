import _ from "underscore";
import React from "react";

export default class CalleeExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      callees: []
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.getCallees();
  }

  handleClick(e) {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
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

  render() {
    const callees = this.state.callees;
    var output;

    if (callees.length !== 0) {
      var calleeList = [];
      for (let callee of callees) {
        calleeList.push(callee[0] + ":" + callee[1] + "/" + callee[2]);
      }
      output = calleeList.join(", ");
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