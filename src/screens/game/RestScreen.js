import React, { Component } from "react";

export default class RestScreen extends Component {
  componentDidMount() {
    this.timeoutID = setTimeout(() => {
      this.props.onTimeout();
      //change to 40 seconds
    }, 40000); 
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutID);
  }

  render() {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">REST</h1>
      </div>
    );
  }
}
