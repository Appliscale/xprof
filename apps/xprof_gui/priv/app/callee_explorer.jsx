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
      for (var i = 0; i < callees.length; ++i) {
        const callee = callees[i];
        calleeList.push(
          <button key={i} type="button" className="btn btn-default btn-sm">
            {callee[0]}:{callee[1]}/{callee[2]}
          </button>
        );
      }
      output = calleeList;
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