import { ContinueBanner } from "../../components/ContinueButton";
import { Component } from "react";


export class GamePrompt extends Component {

  renderPrompt() {
    const { prompt_number, study } = this.props;

    console.log("Prompt number: ", this.props);

    if (study.pagesSettings.preIntro === "1") {
      switch (prompt_number) {
        //condition1
        case 1:
          return (
            <div className="max-w-2xl mx-auto py-9 space-y-6">
              <p className="text-justify text-xl text-gray-900 leading-relaxed font-bold">
                For this task, you will see various social media posts. For each
                post that you encounter, please engage with the content as you
                normally would in real life (e.g., liking, disliking, sharing,
                or no engagement, etc.). Then, click “next post”. You will then
                be asked some questions about the content you just saw before
                the next post is shown. If you don't want to engage with a
                particular post, that is okay, just click “next post”, but you
                will still be asked some questions about it.
              </p>
              <p className="text-center text-xl text-gray-900 leading-relaxed font-bold">
                Please let the experimenter know once you have completed reading
                these instructions.
              </p>
            </div>
          );
        //MIST20
        case 2:
          return (
            <div className="max-w-2xl mx-auto py-6 space-y-6">
              <p className="text-justify text-xl text-gray-900 leading-relaxed font-bold">
                For this next task, you will do the same exact thing as before,
                in that you should engage with the content as you normally would
                in real life (e.g., liking, disliking, sharing, or no
                engagement, etc.), with the only difference being that the posts
                will not contain images.
              </p>
              <p className="text-center text-xl text-gray-900 leading-relaxed font-bold">
                Please let the experimenter know once you have completed reading
                these instructions.
              </p>
            </div>
          );

        //condition 2
        case 3:
          return (
            <div className="max-w-2xl mx-auto py-6 space-y-6">
              <p className="text-justify text-xl text-gray-900 leading-relaxed font-bold">
                For this next task, you will see various social media posts. For
                each post that you encounter, form an initial feeling of whether
                you think it is true or not. Once you have this judgment in
                mind, proceed to then think of 2 reasons why your initial
                judgment might be wrong. For example, if you initially think
                something is true, think of 2 reasons why it might actually be
                false. Or, if you initially think something is false, think of 2
                reasons why it might actually be true. Then proceed to engage
                with the content as you normally would in real life (e.g.,
                liking, disliking, sharing, or no engagement, etc.) before
                continuing to the next post.
              </p>

              <p className="text-center text-xl text-gray-900 leading-relaxed font-bold">
                Please let the experimenter know once you have completed reading
                these instructions.
              </p>
            </div>
          );

        default:
          return (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
              <h1 className="text-center text-4xl font-bold text-black mb-4">
                No Instructions!
              </h1>
            </div>
          );
      }
    } else if (study.pagesSettings.preIntro === "2") {
      switch (prompt_number) {
        //condition2
        case 1:
          return (
            <div className="max-w-2xl mx-auto py-6 space-y-6">
              <p className="text-justify text-xl text-gray-900 leading-relaxed font-bold">
                For this next task, you will see various social media posts. For
                each post that you encounter, form an initial feeling of whether
                you think it is true or not. Once you have this judgment in
                mind, proceed to then think of 2 reasons why your initial
                judgment might be wrong. For example, if you initially think
                something is true, think of 2 reasons why it might actually be
                false. Or, if you initially think something is false, think of 2
                reasons why it might actually be true. Then proceed to engage
                with the content as you normally would in real life (e.g.,
                liking, disliking, sharing, or no engagement, etc.) before
                continuing to the next post.
              </p>

              <p className="text-center text-xl text-gray-900 leading-relaxed font-bold">
                Please let the experimenter know once you have completed reading
                these instructions.
              </p>
            </div>
          );
        //condition 1
        case 2:
          return (
            <div className="max-w-2xl mx-auto py-9 space-y-6">
              <p className="text-justify text-xl text-gray-900 leading-relaxed font-bold">
                For this task, you will see various social media posts. For each
                post that you encounter, please engage with the content as you
                normally would in real life (e.g., liking, disliking, sharing,
                or no engagement, etc.). Then, click “next post”. You will then
                be asked some questions about the content you just saw before
                the next post is shown. If you don't want to engage with a
                particular post, that is okay, just click “next post”, but you
                will still be asked some questions about it.
              </p>
              <p className="text-center text-xl text-gray-900 leading-relaxed font-bold">
                Please let the experimenter know once you have completed reading
                these instructions.
              </p>
            </div>
          );

        //MIST20
        case 3:
          return (
            <div className="max-w-2xl mx-auto py-6 space-y-6">
              <p className="text-justify text-xl text-gray-900 leading-relaxed font-bold">
                For this next task, you will do the same exact thing as before,
                in that you should engage with the content as you normally would
                in real life (e.g., liking, disliking, sharing, or no
                engagement, etc.), with the only difference being that the posts
                will not contain images.
              </p>
              <p className="text-center text-xl text-gray-900 leading-relaxed font-bold">
                Please let the experimenter know once you have completed reading
                these instructions.
              </p>
            </div>
          );
        default:
          return (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
              <h1 className="text-center text-4xl font-bold text-black mb-4">
                No Instructions!
              </h1>
            </div>
          );
      }
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
