import React, { Component } from "react";

class SelfReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      truthRating: null,
      confidenceRating: null,
      seenBefore: null,
      error: null,
    };
  }

  handleRatingChange = (key, value) => {
    this.setState({ [key]: value, error: null });
  };

  handleSubmit = () => {
    const { truthRating, confidenceRating, seenBefore } = this.state;

    if (
      truthRating === null ||
      confidenceRating === null ||
      seenBefore === null
    ) {
      this.setState({
        error: "Please complete all questions before proceeding.",
      });
      return;
    }

    const responsesPrint = {
      truthRating,
      confidenceRating,
      seenBefore,
    };

    console.log(responsesPrint);

    //const responses = [truthRating, confidenceRating, seenBefore];

    this.props.onSubmit(responsesPrint);
  };

  render() {
    const { truthRating, confidenceRating, seenBefore, error } = this.state;

    return (
      <div className="self-report p-6 bg-white rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Self-Report Questions</h2>

        {/* Error Message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Question 1: Do you believe this post is true? */}
        <div className="mb-4">
          <p className="font-medium">Do you believe this post is true?</p>
          <div className="flex space-x-2">
            <label
              className={`cursor-pointer p-2 rounded ${
                truthRating === "yes" ? "bg-blue-200" : "bg-gray-100"
              }`}
              aria-label="Truth rating - yes"
            >
              <input
                type="radio"
                name="truthRating"
                value="yes"
                className="hidden"
                onChange={() => this.handleRatingChange("truthRating", "yes")}
              />
              Yes
            </label>
            <label
              className={`cursor-pointer p-2 rounded ${
                truthRating === "no" ? "bg-blue-200" : "bg-gray-100"
              }`}
              aria-label="Truth rating - no"
            >
              <input
                type="radio"
                name="truthRating"
                value="no"
                className="hidden"
                onChange={() => this.handleRatingChange("truthRating", "no")}
              />
              No
            </label>
          </div>
        </div>

        {/* Question 2: How confident are you that your judgment is correct? */}
        <div className="mb-4">
          <p className="font-medium">
            How confident are you that your judgment is correct?
          </p>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label
                key={rating}
                className={`cursor-pointer p-2 rounded ${
                  confidenceRating === rating ? "bg-blue-200" : "bg-gray-100"
                }`}
                aria-label={`Confidence rating ${rating}`}
              >
                <input
                  type="radio"
                  name="confidenceRating"
                  value={rating}
                  className="hidden"
                  onChange={() =>
                    this.handleRatingChange("confidenceRating", rating)
                  }
                />
                {rating}
              </label>
            ))}
          </div>
        </div>

        {/* Question 3: Have you seen the post before? */}
        <div className="mb-4">
          <p className="font-medium">Have you seen the post before?</p>
          <div className="flex space-x-2">
            <label
              className={`cursor-pointer p-2 rounded ${
                seenBefore === "yes" ? "bg-blue-200" : "bg-gray-100"
              }`}
              aria-label="Seen before - yes"
            >
              <input
                type="radio"
                name="seenBefore"
                value="yes"
                className="hidden"
                onChange={() => this.handleRatingChange("seenBefore", "yes")}
              />
              Yes
            </label>
            <label
              className={`cursor-pointer p-2 rounded ${
                seenBefore === "no" ? "bg-blue-200" : "bg-gray-100"
              }`}
              aria-label="Seen before - no"
            >
              <input
                type="radio"
                name="seenBefore"
                value="no"
                className="hidden"
                onChange={() => this.handleRatingChange("seenBefore", "no")}
              />
              No
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          onClick={this.handleSubmit}
        >
          Submit
        </button>
      </div>
    );
  }
}

export default SelfReport;
