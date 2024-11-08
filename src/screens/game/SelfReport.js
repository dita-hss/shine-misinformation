import React, { Component } from "react";

class SelfReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      truthRating: null,
      confidenceRating: null,
      seenBefore: null,
    };
  }

  handleRatingChange = (key, value) => {
    this.setState({ [key]: value });
  };

  handleSubmit = () => {
    const { truthRating, confidenceRating, seenBefore } = this.state;

    if (truthRating === null || confidenceRating === null || seenBefore === null) {
      alert("Please complete all questions before proceeding.");
      return;
    }

    const responses = {
      truthRating,
      confidenceRating,
      seenBefore,
    };

    this.props.onSubmit(responses); // Triggers navigation back to PostComponent
  };

  render() {
    return (
      <div className="self-report">
        <h2 className="text-xl mb-4">Self-Report Questions</h2>

        {/* Question 1: How true is this post? */}
        <div className="mb-4">
          <p>How true is this post?</p>
          {[1, 2, 3, 4, 5].map((rating) => (
            <label key={rating}>
              <input
                type="radio"
                name="truthRating"
                value={rating}
                onChange={() => this.handleRatingChange("truthRating", rating)}
              />
              {rating}
            </label>
          ))}
        </div>

        {/* Question 2: How confident are you that your judgment is correct? */}
        <div className="mb-4">
          <p>How confident are you that your judgment is correct?</p>
          {[1, 2, 3, 4, 5].map((rating) => (
            <label key={rating}>
              <input
                type="radio"
                name="confidenceRating"
                value={rating}
                onChange={() =>
                  this.handleRatingChange("confidenceRating", rating)
                }
              />
              {rating}
            </label>
          ))}
        </div>

        {/* Question 3: Have you seen the post before? */}
        <div className="mb-4">
          <p>Have you seen the post before?</p>
          <label>
            <input
              type="radio"
              name="seenBefore"
              value="yes"
              onChange={() => this.handleRatingChange("seenBefore", "yes")}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="seenBefore"
              value="no"
              onChange={() => this.handleRatingChange("seenBefore", "no")}
            />
            No
          </label>
        </div>

        {/* Submit Button */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={this.handleSubmit}
        >
          Submit
        </button>
      </div>
    );
  }
}

export default SelfReport;
