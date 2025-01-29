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

    this.props.onSubmit(responsesPrint);
  };

  render() {
    const { truthRating, confidenceRating, seenBefore, error } = this.state;

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="self-report max-w-2xl mx-auto p-12 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Self-Report Questions
          </h2>

          {/* Error Message */}
          {error && (
            <p className="text-red-600 bg-red-100 border border-red-400 p-2 rounded-md text-sm text-center mb-4">
              {error}
            </p>
          )}

          {/* Question 1: Do you believe this post is true? */}
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 mb-2">
              Do you believe this post is true?
            </p>
            <div className="flex gap-4">
              {["yes", "no"].map((option) => (
                <label
                  key={option}
                  className={`cursor-pointer px-4 py-2 rounded-lg text-lg transition ${
                    truthRating === option
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="truthRating"
                    value={option}
                    className="hidden"
                    onChange={() =>
                      this.handleRatingChange("truthRating", option)
                    }
                  />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Question 2: How confident are you that your judgment is correct? */}
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 mb-2">
              How confident are you in your judgment?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label
                  key={rating}
                  className={`cursor-pointer w-10 h-10 flex items-center justify-center text-lg rounded-lg transition ${
                    confidenceRating === rating
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
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

          {/* Question 3: Have you seen this post before? */}
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 mb-2">
              Have you seen this post before?
            </p>
            <div className="flex gap-4">
              {["yes", "no"].map((option) => (
                <label
                  key={option}
                  className={`cursor-pointer px-4 py-2 rounded-lg text-lg transition ${
                    seenBefore === option
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="seenBefore"
                    value={option}
                    className="hidden"
                    onChange={() =>
                      this.handleRatingChange("seenBefore", option)
                    }
                  />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-lg transition hover:bg-blue-700 active:scale-95"
            onClick={this.handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default SelfReport;
