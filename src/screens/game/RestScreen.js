import React, { Component } from "react";
import { sendTrigger } from "../../utils/fnirs";
import { logTimestamp } from "../../utils/timestamp.js";

export default class RestScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMessage: true,
      showFixationCross: false,
    };
  }

  componentDidMount() {
    // amount of time for the message to be shown
    this.messageTimeout = setTimeout(() => {
      // once it times out, log a timestamp and send a trigger
      this.setState({ showMessage: false, showFixationCross: true }, () => {
        logTimestamp("rest");
        sendTrigger(1); 
      });

      // amount of time for the fixation cross to be shown
      this.fixationTimeout = setTimeout(() => {
        this.props.onTimeout();
      }, 4000);
    }, 4000);
  }

  componentWillUnmount() {
    clearTimeout(this.messageTimeout);
    clearTimeout(this.fixationTimeout);
  }

  render() {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-200">
        {this.state.showMessage ? (
          <h1 className="text-2xl font-bold text-gray-800">
            Please stare at the fixation cross until it disappears
          </h1>
        ) : this.state.showFixationCross ? (
          <h1 className="text-5xl font-bold text-gray-800">+</h1>
        ) : null}
      </div>
    );
  }
}
