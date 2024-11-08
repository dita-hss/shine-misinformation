import React, {Component} from "react";
import {PromiseImage} from "../../components/PromiseImage";
import {getDataManager} from "../../model/manager";
import {CredibilityLabel} from "../../components/CredibilityLabel";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ReplyIcon from "@mui/icons-material/Reply";
import FlagIcon from "@mui/icons-material/Flag";
import {UserComment} from "../../model/study";
import {isOfType} from "../../utils/types";
import {CommentSubmissionRow} from "./CommentEntry";
import {Comment} from "./Comment";
import {ReactButton} from "./ReactButton";
import {capitalise} from "../../utils/text";
import SelfReport from "./SelfReport";


export const POST_SUBMITTED_TOOLTIP = "You may no longer interact with this post, as it has been saved";
export const REACTION_DISABLED_TOOLTIP = "Please wait before reacting to this post";


/**
 * The source that made a post.
 */
class SourceElement extends Component {
    render() {
        const small = !!this.props.small;
        const source = this.props.source;
        const text_xl = (small ? "text-lg" : "text-xl");

        const sourceStyle = (source.study.advancedSettings.genRandomDefaultAvatars ? source.source.style : {});
        return (
            <div className={"flex " + (this.props.className || "")}>
                <div className={"mr-2 " + (small ? "h-8" : "h-12")}>
                    {source.source.avatar &&
                        <PromiseImage className="h-full"
                                      imageClassName={
                                          "rounded-full object-cover shadow " +
                                          (small ? "h-8 w-8" : "h-12 w-12")
                                      }
                                      loadingSpinner={small ? "small" : ""}
                                      image={getDataManager().getStudyImage(
                                          source.study, source.source.id, source.source.avatar
                                      )} />}

                    {!source.source.avatar &&
                        <div className={
                            "flex rounded-full object-cover shadow justify-center items-center text-2xl text-bold " +
                            (small ? "h-8 w-8" : "h-12 w-12")
                        } style={sourceStyle}>
                            <span>
                                {source.source.name[0]}
                            </span>
                        </div>}
                </div>

                <div>
                    <div className={
                            "flex flex-row items-middle " + text_xl +
                            (small || source.study.uiSettings.displayFollowers ? "" : "pt-1")}>

                        <span className="inline-block mr-1" style={{lineHeight: "1.5em"}}>
                            {source.source.name}
                        </span>

                        {source.study.uiSettings.displayCredibility &&
                            <CredibilityLabel credibility={source.credibility} className={text_xl} />}
                    </div>

                    {!small && source.study.uiSettings.displayFollowers &&
                        <div className="flex">
                            <p className="text-sm">
                                {Math.round(source.followers)}&nbsp;followers
                            </p>
                        </div>}
                </div>
            </div>
        );
    }
}


/**
 * Contains the reactions that may be made to the post.
 */
class PostReactionsRow extends Component {
  ////////////////////////// ahs change: added the constructor to keep track of whether the share box is visible
  // and added the handleShareClick and handleShareOptionSelect functions
  constructor(props) {
    super(props);
    this.state = {
      //keep track of whether the share box is visible
      shareBoxVisible: false,
    };
  }
  // when the share button is clicked, toggle the visibility of the share box
  handleShareClick = () => {
    //if share is already selected, hide the share box, otherwise show it
    if (this.props.interactions.hasPostReaction("share")) {
      this.setState({ shareBoxVisible: false });
      this.props.onReact("share");
    } else {
      this.setState({ shareBoxVisible: true });
    }
  };
  // when a share option is selected, log the option and hide the share box
  handleShareOptionSelect = (option) => {

    // if the onShareTargetSelect exists, call it (sanity check)
    if (typeof this.props.onShareTargetSelect === "function") {
      this.props.onShareTargetSelect(option);
    } else {
      console.error("onShareTargetSelect is not a function");
    }

    // mark the post as shared
    this.props.onReact("share");

    //n hide the share box after a selection is made
    this.setState({ shareBoxVisible: false });
  };

  ////////////////////////// ahs change end

  render() {
    const onReact = this.props.onReact;
    const enabled = this.props.enabled;
    const interactions = this.props.interactions;
    const study = this.props.study;
    const post = this.props.post;

    const buttons = [];
    const reactions = ["like", "dislike", "share", "flag"];
    const icons = {
      like: <ThumbUpIcon />,
      dislike: <ThumbDownIcon />,
      share: <ReplyIcon />,
      flag: <FlagIcon />,
    };
    for (let index = 0; index < reactions.length; ++index) {
      const reaction = reactions[index];
      if (!study.uiSettings.postEnabledReactions[reaction]) continue;

      let transforms, fontSize;
      if (reaction === "share") {
        transforms = "transform -translate-y-2.5 -translate-x-3 -scale-x-1";
        fontSize = "3.25rem";
      } else {
        transforms = "transform -translate-y-0.5 -translate-x-1";
      }

      let reactionCount;
      if (study.uiSettings.displayNumberOfReactions) {
        reactionCount = post.numberOfReactions[reaction];
      } else {
        reactionCount = undefined;
      }

      buttons.push(
        <ReactButton
          reaction={reaction}
          key={reaction}
          selected={interactions.hasPostReaction(reaction)}
          grayOut={
            (!study.uiSettings.allowMultipleReactions ||
              interactions.hasPostReaction("skip")) &&
            interactions.postReactions.length > 0
          }
          ///// a.h.s single change: change the onReact function to handleShareClick when the reaction is share
          onReact={reaction === "share" ? this.handleShareClick : onReact}
          enabled={enabled}
          reactionCount={reactionCount}
          childClassName={transforms}
          title={
            enabled
              ? capitalise(reaction)
              : study.uiSettings.displayPostsInFeed
              ? POST_SUBMITTED_TOOLTIP
              : REACTION_DISABLED_TOOLTIP
          }
          className="mr-1"
          fontSize={fontSize}
        >
          {icons[reaction]}
        </ReactButton>
      );
    }

    return (
      <div
        className={
          "text-lg flex flex-wrap flex-row pt-1 px-2 " +
          (study.uiSettings.displayNumberOfReactions ? " mb-0.5 " : " mb-1 ")
        }
      >
        <div
          className={
            "flex flex-grow" +
            (study.uiSettings.displayNumberOfReactions ? " pb-6 " : "")
          }
        >
          {buttons}
        </div>
        {/* ////////////////////////// a.h.s change: added the share options box render */}
        <div className="relative">
          {/* Conditional rendering of the share box */}
          {this.state.shareBoxVisible && (
            <div className="share-options-box bg-gray-50 border border-gray-300 p-4 rounded-lg shadow-lg absolute top-full left-1/2 transform -translate-x-[95%] mt-2 z-50">
              {/* Close button */}
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => this.setState({ shareBoxVisible: false })}
              >
                &times;
              </button>

              <p className="text-lg font-semibold mb-3 text-gray-800">
                Share with:
              </p>
              <div className="flex space-x-4">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-200 ease-in-out shadow-sm"
                  onClick={() => this.handleShareOptionSelect("Friends")}
                >
                  Friends
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-200 ease-in-out shadow-sm"
                  onClick={() => this.handleShareOptionSelect("Family")}
                >
                  Family
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-200 ease-in-out shadow-sm"
                  onClick={() => this.handleShareOptionSelect("Public")}
                >
                  Public
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ////////////////////////// ahs change end */}

        {study.isPostReactionEnabled("skip") && (
          <ReactButton
            reaction="skip"
            selected={interactions.hasPostReaction("skip")}
            grayOut={interactions.postReactions.length > 0}
            onReact={onReact}
            enabled={enabled}
            wide={true}
            fontSize="1.25rem"
            childClassName="transform translate-y-1"
          >
            <p>Skip Post</p>
          </ReactButton>
        )}
      </div>
    );
  }
}


/**
 * A post to display, including comments.
 */
export class PostComponent extends Component {
  


    render() {
        const state = this.props.state;
        const interactions = this.props.interactions;
        const enabled = this.props.enabled && !interactions.isCompleted();

        const post = state.currentPost.post;
        const commentComponents = [];

        const userCommentsEnabled = state.study.areUserCommentsEnabled();
        const showCommentBox = !interactions.comment && userCommentsEnabled;

        // a.h.s change: remove comments from the posts and only show the user comment
        // if we want to show the comments, we can add them back
        // if we want to remove user commenting functionality, we can remove that in this section
        if (interactions.comment) {
            const userComment = new UserComment(interactions.comment);
            commentComponents.push(
                <Comment
                    className="mt-0"
                    comment={userComment}
                    study={state.study}
                    key="user.comment"
                    enabled={enabled}
                    editable={true}
                    onCommentEdit={() =>  this.props.onCommentEdit()}
                    onCommentDelete={() => this.props.onCommentDelete()} />);
        }
        // for (let index = 0; index < post.comments.length; ++index) {
        //     const comment = post.comments[index];
        //     commentComponents.push(
        //         <Comment
        //             comment={comment}
        //             study={state.study}
        //             className={showCommentBox || interactions.comment || index > 0 ? "mt-1" : "mt-0"}
        //             key={index + "." + comment.sourceName}
        //             onReact={r => this.props.onCommentReact(index, r)}
        //             enabled={enabled}
        //             editable={false}
        //             interaction={interactions.findCommentReaction(index)} />
        //     );
        // }

        ////////////////////////// ahs change end

        let postContent;
        if (isOfType(post.content, "string")) {
            postContent = (
                <p className="text-lg font-normal p-2 pt-0" dangerouslySetInnerHTML={{__html: post.content}} />
            );
        } else {
            postContent = (<div className="flex justify-center bg-gray-200 max-h-40vh md:max-h-60vh shadow-inner overflow-hidden">
                <PromiseImage image={
                    getDataManager().getStudyImage(state.study, post.id, post.content)
                } imageClassName="object-contain shadow" style={{maxHeight: "50vh"}} />
            </div>);
        }

        return (
          <div
            id={this.props.id}
            className={
              "flex flex-col bg-gray-100 shadow-md " +
              (enabled ? " text-black " : " text-gray-700 ") +
              (this.props.className || "")
            }
          >
            <div className={enabled ? "bg-white" : "bg-gray-25"}>
              {/* The source of the post. */}
              <div className="flex p-2">
                <SourceElement source={state.currentSource} />
              </div>

              {/* The content of the post. */}
              <div className="flex flex-col flex-grow text-left text-2xl font-bold">
                <p className="p-2 mb-1">{post.headline}</p>
                {postContent}
              </div>

              {/* The reactions to the post and their counts. */}
              <hr />
              <PostReactionsRow
                onReact={this.props.onPostReact}
                // Add a console log to see what onShareTargetSelect looks like here
                onShareTargetSelect={this.props.onShareTargetSelect}
                enabled={enabled}
                interactions={interactions}
                study={state.study}
                post={state.currentPost}
              />
            </div>

            {/* The comments on the post. */}
            <div className="flex flex-row justify-between items-end">
              {(showCommentBox || commentComponents.length > 0) && (
                <p className="font-bold text-gray-500 p-1 px-2">Comments:</p>
              )}
            </div>

            {showCommentBox && (
              <CommentSubmissionRow
                className="mt-0"
                study={state.study}
                initialValue={interactions.lastComment}
                submit={(value) => this.props.onCommentSubmit(value)}
                enabled={enabled}
              />
            )}

            {commentComponents}
          </div>
        );
    }
}
