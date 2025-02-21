import { ContinueBanner } from "../../components/ContinueButton";
import { Component } from "react";

export class GamePrompt extends Component {
  renderPrompt() {
    const { prompt_number } = this.props;
    //console.log(prompt_number);

    switch (prompt_number) {
      case 1:
        return (
          <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
            <p className="text-justify text-lg text-gray-900 leading-relaxed">
              For this task, you will see various social media posts. For each
              post that you encounter, make a quick intuitive judgment in your
              mind about whether you think the content is true or false, and
              then proceed to engage with the content as you normally would in
              real life (e.g., liking, disliking, sharing, or no engagement,
              etc.) before continuing to the next post.
            </p>
            <p className="text-center text-lg text-gray-900 leading-relaxed">
              Does that make sense?
            </p>
          </div>
        );

      case 2:
        return (
          <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
            <p className="text-justify text-lg text-gray-900 leading-relaxed">
              For this next task, you will do the same exact thing as before,
              with the only difference being that the posts will not contain
              images. So, you will see various social media posts and, for each
              post that you encounter, you need to make a quick intuitive
              judgment in your mind about whether you think the content is true
              or false. Then proceed to engage with the content as you normally
              would in real life (e.g., liking, disliking, sharing, or no
              engagement, etc.) before continuing to the next post.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
            <p className="text-justify text-lg text-gray-900 leading-relaxed">
              For this next task, imagine that you are someone who is not only
              more suspicious about content online but also skeptical of one's
              own judgments. Specifically, you will see various social media
              posts and, for each post that you encounter, you need to think of
              at least 2 reasons why your initial judgment might be incorrect.
              For example, if you initially think something is true, think of 2
              reasons why it might actually be false. And, if you initially
              think something is false, think of 2 reasons why it might actually
              be true. Then proceed to engage with the content as you normally
              would in real life (e.g., liking, disliking, sharing, or no
              engagement, etc.) before continuing to the next post.
            </p>
          </div>
        );

      default:
        return (
          <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
            <h1 className="text-center text-4xl font-bold text-black mb-4">
              No Instructions!
            </h1>
          </div>
        );
    }
  }

  render() {
    const { study, onClick } = this.props;
    return (
      <div
        className="fixed left-0 top-0 w-full flex flex-col z-50 justify-center items-center bg-white bg-opacity-100"
        style={{ minHeight: "100vh" }}
      >
        <div className="m-4 max-w-2xl">
          {this.renderPrompt()}
          {/* Reserve space below the continue button */}
          <div className="h-16" />
        </div>

        <ContinueBanner
          to={null}
          condition={true}
          onClick={onClick}
          delay={study.advancedSettings.promptDelaySeconds}
        />
      </div>
    );
  }
}
