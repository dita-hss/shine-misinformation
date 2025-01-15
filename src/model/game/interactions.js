import {
  doArrayTypeCheck,
  doNullableArrayTypeCheck,
  doNullableTypeCheck,
  doTypeCheck,
} from "../../utils/types";

function toggleReactionPresenceInArray(
  currentReactions,
  reaction,
  allowMultipleReactions
) {
  // Skips are always mutually exclusive to other reactions.
  if (reaction === "skip") {
    if (detectReactionPresenceInArray(currentReactions, "skip")) return [];
    else return ["skip"];
  }

  // Attempt to find and remove the reaction.
  const newReactions = [];
  let foundReaction = false;
  for (let index = 0; index < currentReactions.length; ++index) {
    const currentReaction = currentReactions[index];
    if (currentReaction === reaction) {
      foundReaction = true;
    } else if (currentReaction !== "skip") {
      newReactions.push(currentReaction);
    }
  }
  if (foundReaction) return newReactions;
  if (!allowMultipleReactions) return [reaction];

  newReactions.push(reaction);
  return newReactions;
}

function detectReactionPresenceInArray(reactions, reaction) {
  for (let index = 0; index < reactions.length; ++index) {
    if (reactions[index] === reaction) return true;
  }
  return false;
}

/**
 * Keeps track of how long it took participants to interact with something.
 */
export class InteractionTimer {
  firstShowTime; // Number? (UNIX Milliseconds) // start of post --------x
  lastShowTime; // Number? (UNIX Milliseconds) // end of post    --------x
  lastHideTime; // Number? (UNIX Milliseconds)                   --------x
  visibleDuration; // Number (Milliseconds)                      --------x

  firstInteractTime; // Number? (UNIX Milliseconds)              --------x
  lastInteractTime; // Number? (UNIX Milliseconds)               --------x

  //interaction array: keeps track of every interaction time is in the format of 11:11:11.111
  interactionTimesFormatted; // String[]
  //interaction array: keeps track of every interaction time (not relative)
  interactionTimesUnrelative; // Number[]

  constructor(
    firstShowTime,
    lastShowTime,
    lastHideTime,
    visibleDuration,
    firstInteractTime,
    lastInteractTime,
    interactionTimesFormatted,
    interactionTimesUnrelative
  ) {
    doNullableTypeCheck(firstShowTime, "number", "Time when First Visible");
    doNullableTypeCheck(lastShowTime, "number", "Time when Last Visible");
    doNullableTypeCheck(lastHideTime, "number", "Time when Last Hidden");
    doTypeCheck(visibleDuration, "number", "Time Spent Visible");
    doNullableTypeCheck(
      firstInteractTime,
      "number",
      "Time of First Interaction"
    );
    doNullableTypeCheck(lastInteractTime, "number", "Time of Last Interaction");
    this.firstShowTime = firstShowTime !== undefined ? firstShowTime : null;
    this.lastShowTime = lastShowTime !== undefined ? lastShowTime : null;
    this.lastHideTime = lastHideTime !== undefined ? lastHideTime : null;
    this.visibleDuration =
      visibleDuration !== undefined ? visibleDuration : null;
    this.firstInteractTime =
      firstInteractTime !== undefined ? firstInteractTime : null;
    this.lastInteractTime =
      lastInteractTime !== undefined ? lastInteractTime : null;
    this.interactionTimesFormatted = interactionTimesFormatted || [];
    this.interactionTimesUnrelative = interactionTimesUnrelative || [];
  }

  static empty() {
    return new InteractionTimer(null, null, null, 0, null, null);
  }

  getTimeToFirstInteractMS() {
    if (this.firstInteractTime === null || this.firstShowTime === null)
      return NaN;

    return this.firstInteractTime - this.firstShowTime;
  }

  getTimeToLastInteractMS() {
    if (this.lastInteractTime === null || this.firstShowTime === null)
      return NaN;
    //console.log("last time to interact", this.lastInteractTime - this.firstShowTime);
    return this.lastInteractTime - this.firstShowTime;
  }

  /**
   * Only supported when the interaction timer has been marked as hidden.
   * This does not actively count while the timer is actively counting
   * while the post is visible.
   */
  getDwellTimeMS() {
    return this.visibleDuration;
  }

  withClearedInteractions() {
    return new InteractionTimer(
      this.firstShowTime,
      this.lastShowTime,
      this.lastHideTime,
      this.visibleDuration,
      null,
      null,
      null,
      null
    );
  }

  async asVisible() {
    // Already visible.
    if (this.lastShowTime !== null) return this;

    const time = Date.now();

    const firstShowTime =
      this.firstShowTime !== null ? this.firstShowTime : time;

    /////a.h.s change: added timestamp for debugging
    const date1 = new Date(time);

    // Extract date and time components manually
    const datePart = date1.toLocaleDateString();
    const timePart = date1.toLocaleTimeString();
    const milliseconds = String(date1.getMilliseconds()).padStart(3, "0");

    // Combine into the desired format
    const formattedDate = `${datePart}, ${timePart.slice(
      0,
      -3
    )}.${milliseconds} ${timePart.slice(-2)}`;

    // add the formatted date to interactionTimesFormatted
    const lastInteractionTemp = this.interactionTimesFormatted.at(-1);
    const lastInteractionTimeTemp = lastInteractionTemp
      ? new Date(lastInteractionTemp).getTime()
      : null;

    // Add the formatted date if it's not already in the array and not within 1ms of the last one
    if (
      (!lastInteractionTimeTemp ||
        Math.abs(time - lastInteractionTimeTemp) > 1) &&
      !this.interactionTimesFormatted.includes(formattedDate)
    ) {
      this.interactionTimesFormatted.push(formattedDate);
      this.interactionTimesUnrelative.push(time);
      console.log(
        "When the post is first shown:",
        this.interactionTimesFormatted
      );
      // this would mark a rest period
    try {
      console.log("Sending trigger to fNIRS device...");
      const condition = 4;
      console.log("condition", condition);
      const command = `mh${String.fromCharCode(condition)}${String.fromCharCode(
        0
      )}`;
      
      await sendTriggerToDevice(command);
    } catch (error) {
      console.error("Failed to send trigger to fNIRS device:", error);
    }
    }
    //////////////////////ahs change end

    const lastShowTime = time;
    const lastHideTime = null;

    return new InteractionTimer(
      firstShowTime,
      lastShowTime,
      lastHideTime,
      this.visibleDuration,
      this.firstInteractTime,
      this.lastInteractTime,
      this.interactionTimesFormatted,
      this.interactionTimesUnrelative
    );
  }

  withSelfReport() {
    //push time of self report to interactionTimesFormatted and interactionTimesUnrelative

    const time = Date.now();
    const date1 = new Date(time);

    // Extract date and time components manually
    const datePart = date1.toLocaleDateString();
    const timePart = date1.toLocaleTimeString();
    const milliseconds = String(date1.getMilliseconds()).padStart(3, "0");

    // Combine into the desired format
    const formattedDate = `${datePart}, ${timePart.slice(
      0,
      -3
    )}.${milliseconds} ${timePart.slice(-2)}`;

    // add the formatted date to interactionTimesFormatted
    const lastInteractionTemp = this.interactionTimesFormatted.at(-1);
    const lastInteractionTimeTemp = lastInteractionTemp
      ? new Date(lastInteractionTemp).getTime()
      : null;

    // Add the formatted date if it's not already in the array and not within 1ms of the last one
    if (
      (!lastInteractionTimeTemp ||
        Math.abs(time - lastInteractionTimeTemp) > 1) &&
      !this.interactionTimesFormatted.includes(formattedDate)
    ) {
      this.interactionTimesFormatted.push(formattedDate);
      this.interactionTimesUnrelative.push(time);
      console.log(
        "Self Report Startted/Submitted",
        this.interactionTimesFormatted
      );
      console.log(
        "Self Report Startted/Submitted",
        this.interactionTimesUnrelative
      );
    }

    return new InteractionTimer(
      this.firstShowTime,
      this.lastShowTime,
      this.lastHideTime,
      this.visibleDuration,
      this.firstInteractTime,
      this.lastInteractTime,
      this.interactionTimesFormatted,
      this.interactionTimesUnrelative
    );
  }
  withUpdatedTimes(formattedTime, time) {
    //console.log("Time updated for first post", formattedTime);
    return new InteractionTimer(
      this.firstShowTime,
      this.lastShowTime,
      this.lastHideTime,
      this.visibleDuration,
      this.firstInteractTime,
      this.lastInteractTime,
      formattedTime, // Replace the array with a single formatted time
      time // Replace the array with a single timestamp
    );
  }

  asHidden() {
    // Already hidden.
    if (this.lastShowTime === null) return this;

    const time = Date.now();

    /////a.h.s change: added timestamp for debugging
    const date1 = new Date(time);

    // Extract date and time components manually
    const datePart = date1.toLocaleDateString();
    const timePart = date1.toLocaleTimeString();
    const milliseconds = String(date1.getMilliseconds()).padStart(3, "0");

    // Combine into the desired format
    const formattedDate = `${datePart}, ${timePart.slice(
      0,
      -3
    )}.${milliseconds} ${timePart.slice(-2)}`;

    console.log("Time when post and report are submitted:", formattedDate);
    //////////////////////ahs change end

    const lastShowTime = null;
    const lastHideTime = time;
    //console.log("lastHideTime", lastHideTime);
    const visibleDuration = this.visibleDuration + (time - this.lastShowTime);

    return new InteractionTimer(
      this.firstShowTime,
      lastShowTime,
      lastHideTime,
      visibleDuration,
      this.firstInteractTime,
      this.lastInteractTime,
      this.interactionTimesFormatted,
      this.interactionTimesUnrelative
    );
  }

  withNewInteraction() {
    const time = Date.now();

    const firstInteractTime =
      this.firstInteractTime !== null ? this.firstInteractTime : time;
    const lastInteractTime = time;

    /////a.h.s change: added timestamp for debugging
    const date1 = new Date(time);

    // Extract date and time components manually
    const datePart = date1.toLocaleDateString();
    const timePart = date1.toLocaleTimeString();
    const milliseconds = String(date1.getMilliseconds()).padStart(3, "0");

    // Combine into the desired format
    const formattedDate = `${datePart}, ${timePart.slice(
      0,
      -3
    )}.${milliseconds} ${timePart.slice(-2)}`;

    // add the formatted date to interactionTimesFormatted
    const lastInteractionTemp = this.interactionTimesFormatted.at(-1);
    const lastInteractionTimeTemp = lastInteractionTemp
      ? new Date(lastInteractionTemp).getTime()
      : null;

    // Add the formatted date if it's not already in the array and not within 1ms of the last one
    if (
      (!lastInteractionTimeTemp ||
        Math.abs(time - lastInteractionTimeTemp) > 1) &&
      !this.interactionTimesFormatted.includes(formattedDate)
    ) {
      this.interactionTimesFormatted.push(formattedDate);
      this.interactionTimesUnrelative.push(time);
      console.log("Last Interaction", this.interactionTimesFormatted);
      console.log(
        "Last Interaction Unrelative",
        this.interactionTimesUnrelative
      );
    }

    //////////////////////ahs change end

    return new InteractionTimer(
      this.firstShowTime,
      this.lastShowTime,
      this.lastHideTime,
      this.visibleDuration,
      firstInteractTime,
      lastInteractTime,
      this.interactionTimesFormatted,
      this.interactionTimesUnrelative
    );
  }

  isCompleted() {
    return (
      this.firstShowTime !== null &&
      this.lastShowTime === null &&
      this.lastHideTime === null
    );
  }

  complete() {
    const subject = this.lastShowTime === null ? this : this.asHidden();

    const firstShowTime =
      subject.firstShowTime !== null ? subject.firstShowTime : Date.now();
    const lastShowTime = null;
    const lastHideTime = null;

    return new InteractionTimer(
      firstShowTime,
      lastShowTime,
      lastHideTime,
      subject.visibleDuration,
      subject.firstInteractTime,
      subject.lastInteractTime,
      this.interactionTimesFormatted,
      this.interactionTimesUnrelative
    );
  }

  toJSON() {
    return {
      firstShowTime: this.firstShowTime,
      lastShowTime: this.lastShowTime,
      lastHideTime: this.lastHideTime,
      visibleDuration: this.visibleDuration,
      firstInteractTime: this.firstInteractTime,
      lastInteractTime: this.lastInteractTime,
      interactionTimesFormatted: this.interactionTimesFormatted,
      interactionTimesUnrelative: this.interactionTimesUnrelative,
    };
  }

  static fromJSON(json) {
    const legacyShowTime = json["showTime"];
    if (legacyShowTime !== undefined) {
      const legacyHideTime = json["hideTime"];

      const firstShowTime = legacyShowTime;
      const lastShowTime = null;
      const lastHideTime = null;
      const visibleDuration = legacyHideTime - legacyShowTime;
      const firstInteractTime = json["firstInteractTime"];
      const lastInteractTime = json["lastInteractTime"];
      const interactionTimesFormatted = json["interactionTimesFormatted"];
      const interactionTimesUnrelative = json["interactionTimesUnrelative"];

      return new InteractionTimer(
        firstShowTime,
        lastShowTime,
        lastHideTime,
        visibleDuration,
        firstInteractTime,
        lastInteractTime,
        interactionTimesFormatted,
        interactionTimesUnrelative
      );
    }

    return new InteractionTimer(
      json["firstShowTime"],
      json["lastShowTime"],
      json["lastHideTime"],
      json["visibleDuration"],
      json["firstInteractTime"],
      json["lastInteractTime"],
      json["interactionTimesFormatted"],
      json["interactionTimesUnrelative"]
    );
  }
}

/**
 * Stores the interactions of participants with a comment.
 */
export class GameCommentInteraction {
  commentIndex; // Number
  reactions; // String[]
  timer; // InteractionTimer

  constructor(commentIndex, reactions, timer) {
    doTypeCheck(commentIndex, "number", "Comment ID for Comment Reaction");
    doArrayTypeCheck(reactions, "string", "Comment Reaction");
    doTypeCheck(timer, InteractionTimer, "Comment Reaction Timer");
    this.commentIndex = commentIndex;
    this.reactions = reactions;
    this.timer = timer;
  }

  static create(commentIndex, commentReaction, postTimer) {
    return new GameCommentInteraction(
      commentIndex,
      [commentReaction],
      postTimer.withClearedInteractions().withNewInteraction()
    );
  }

  complete() {
    return new GameCommentInteraction(
      this.commentIndex,
      this.reactions,
      this.timer.complete()
    );
  }

  asVisible() {
    return new GameCommentInteraction(
      this.commentIndex,
      this.reactions,
      this.timer.asVisible()
    );
  }

  asHidden() {
    return new GameCommentInteraction(
      this.commentIndex,
      this.reactions,
      this.timer.asHidden()
    );
  }

  withUpdatedTimes(formattedTime, time) {
    //console.log("Time updated for first post", formattedTime);
    return new InteractionTimer(
        this.firstShowTime,
        this.lastShowTime,
        this.lastHideTime,
        this.visibleDuration,
        this.firstInteractTime,
        this.lastInteractTime,
        formattedTime, // Replace the array with a single formatted time
        time // Replace the array with a single timestamp
    );
}


  withToggledReaction(reaction, allowMultipleReactions) {
    return this.withReactions(
      toggleReactionPresenceInArray(
        this.reactions,
        reaction,
        allowMultipleReactions
      )
    );
  }

  hasReaction(reaction) {
    return detectReactionPresenceInArray(this.reactions, reaction);
  }

  withReactions(reactions) {
    return new GameCommentInteraction(
      this.commentIndex,
      reactions,
      this.timer.withNewInteraction()
    );
  }

  toJSON() {
    return {
      commentID: this.commentIndex,
      reactions: this.reactions,
      timer: this.timer.toJSON(),
    };
  }

  static fromJSON(json, showTime) {
    const reactions = json["reactions"];
    const reaction = json["reaction"];
    const timerJSON = json["timer"];
    const legacyReactTimeMS = json["reactTimeMS"];

    let timer;
    if (timerJSON !== undefined) {
      timer = InteractionTimer.fromJSON(timerJSON);
    } else {
      timer = new InteractionTimer(
        showTime,
        null,
        null,
        null,
        legacyReactTimeMS || null,
        legacyReactTimeMS || null,
        null,
        null
      );
    }

    return new GameCommentInteraction(
      json["commentID"],
      reactions !== undefined ? reactions : reaction ? [reaction] : [],
      timer
    );
  }
}

/**
 * Stores all the interactions of a participant with a post.
 */
export class GamePostInteraction {
  postReactions; // String[]
  commentReactions; // GameCommentInteraction[]
  lastComment; // String?
  comment; // String?
  timer; // InteractionTimer

  ///a.h.s change: keep track of who the post was shared with
  shareTargets; // String? - New property to store who the post was shared with
  selfReportResponses; // String[] - New property to store self-report responses
  //////////////////////ahs change end

  /////////////////////a.h.s single change: added shareTargets to constructor
  constructor(
    postReactions,
    commentReactions,
    lastComment,
    comment,
    timer,
    shareTargets,
    selfReportResponses
  ) {
    doArrayTypeCheck(postReactions, "string", "Reactions to Post");
    doArrayTypeCheck(
      commentReactions,
      GameCommentInteraction,
      "Reactions to Comments"
    );
    doNullableTypeCheck(lastComment, "string", "Participant's Last Comment");
    doNullableTypeCheck(comment, "string", "Participant's Comment");
    doNullableTypeCheck(timer, InteractionTimer, "Post Reaction Timer");

    //////////////////////a.h.s change: keep track of who the post was shared with

    ////error prone: if error there is a typeError where shareTargets is an empty array instead of a string
    ///// commenting out the doNUllableTypeCheck will fix it
    //// not sure where it is getting assigned an empty array in the first place
    doNullableTypeCheck(shareTargets, "string", "Share Target"); // Type check for share targets
    this.shareTargets = shareTargets;
    this.selfReportResponses = selfReportResponses || []; // Initialize self-report responses
    //////////////////////ahs change end

    this.postReactions = postReactions;
    this.commentReactions = commentReactions;
    this.lastComment = lastComment;
    this.comment = comment;
    this.timer = timer;
  }

  static empty() {
    return new GamePostInteraction(
      [],
      [],
      null,
      null,
      InteractionTimer.empty(),
      //////////////////////a.h.s single change: added shareTargets and self report return
      null, // Initialize share targets,
      []
    );
  }

  isEmpty() {
    return (
      this.postReactions.length === 0 &&
      this.commentReactions.length === 0 &&
      this.comment === null
    );
  }

  isEditingComment() {
    return this.lastComment !== null;
  }

  isCompleted() {
    return this.timer.isCompleted();
  }

  complete() {
    const completedCommentReactions = [];
    for (let index = 0; index < this.commentReactions.length; ++index) {
      completedCommentReactions.push(this.commentReactions[index].complete());
    }
    return new GamePostInteraction(
      this.postReactions,
      completedCommentReactions,
      this.lastComment,
      this.comment,
      this.timer.complete(),
      //////////////////////a.h.s single change: added shareTargets selfReportResponses to complete
      this.shareTargets,
      this.selfReportResponses
    );
  }
  withUpdatedTimes(formattedTime, time) {
    console.log("Time updated for first post", formattedTime);
    return new GamePostInteraction(
      this.postReactions,
      this.commentReactions,
      this.lastComment,
      this.comment,
      this.timer.withUpdatedTimes(formattedTime, time),
      this.shareTargets,
      this.selfReportResponses
    );
  }

  asVisible() {
    const updatedCommentReactions = [];
    for (let index = 0; index < this.commentReactions.length; ++index) {
      updatedCommentReactions.push(this.commentReactions[index].asVisible());
    }
    return new GamePostInteraction(
      this.postReactions,
      updatedCommentReactions,
      this.lastComment,
      this.comment,
      this.timer.asVisible(),
      //////////////////////a.h.s single change: added shareTargets and self responseto asVisible
      this.shareTargets,
      this.selfReportResponses
    );
  }

  asHidden() {
    const updatedCommentReactions = [];
    for (let index = 0; index < this.commentReactions.length; ++index) {
      updatedCommentReactions.push(this.commentReactions[index].asHidden());
    }
    return new GamePostInteraction(
      this.postReactions,
      updatedCommentReactions,
      this.lastComment,
      this.comment,
      this.timer.asHidden(),
      //////////////////////a.h.s single change: added shareTargets and self report to asHidden
      this.shareTargets,
      this.selfReportResponses
    );
  }

  /////a.h.s change: keep track of who the post was shared with and self report responses

  withSelfReportResponses(selfReportResponses) {
    //console.log("on the with", selfReportResponses);
    //array check / null check omitted
    return new GamePostInteraction(
      this.postReactions,
      this.commentReactions,
      this.lastComment,
      this.comment,
      this.timer.withSelfReport(),
      this.shareTargets,
      selfReportResponses // self-report responses
    );
  }
  withStartSelfReportResponses() {
    //console.log("on the with", selfReportResponses);
    //array check / null check omitted
    return new GamePostInteraction(
      this.postReactions,
      this.commentReactions,
      this.lastComment,
      this.comment,
      this.timer.withSelfReport(),
      this.shareTargets,
      this.selfReportResponses // self-report responses
    );
  }

  withShareTargets(shareTargets) {
    doNullableTypeCheck(shareTargets, "string", "Share Target");
    return new GamePostInteraction(
      this.postReactions,
      this.commentReactions,
      this.lastComment,
      this.comment,
      this.timer.withNewInteraction(),
      shareTargets,
      this.selfReportResponses
    );
  }
  //////////////////////ahs change end

  withComment(comment) {
    let lastComment;
    if (comment) {
      lastComment = comment;
    } else if (this.comment) {
      lastComment = this.comment;
    } else {
      lastComment = this.lastComment;
    }
    return new GamePostInteraction(
      this.postReactions,
      this.commentReactions,
      lastComment,
      comment,
      this.timer.withNewInteraction(),
      //////////////////////a.h.s single change: added shareTargets and selfreport to withComment
      this.shareTargets,
      this.selfReportResponses
    );
  }

  withDeletedComment() {
    return new GamePostInteraction(
      this.postReactions,
      this.commentReactions,
      null,
      null,
      this.timer.withNewInteraction(),
      //////////////////////a.h.s single change: added shareTargets and self report to withDeletedComment
      this.shareTargets,
      this.selfReportResponses
    );
  }

  withToggledPostReaction(postReaction, allowMultipleReactions) {
    return this.withPostReactions(
      toggleReactionPresenceInArray(
        this.postReactions,
        postReaction,
        allowMultipleReactions
      )
    );
  }

  hasPostReaction(postReaction) {
    return detectReactionPresenceInArray(this.postReactions, postReaction);
  }

  withPostReactions(postReactions) {
    return new GamePostInteraction(
      postReactions,
      this.commentReactions,
      this.lastComment,
      this.comment,
      this.timer.withNewInteraction(),
      //////////////////////a.h.s single change: added shareTargets and self report to withPostReactions
      this.shareTargets,
      this.selfReportResponses
    );
  }

  withToggledCommentReaction(
    commentIndex,
    commentReaction,
    allowMultipleReactions
  ) {
    doTypeCheck(commentReaction, "string", "Comment Reaction");

    const existing = this.findCommentReaction(commentIndex);
    if (existing === null) {
      // First time interacting with the comment.
      return this.withCommentReaction(
        commentIndex,
        GameCommentInteraction.create(commentIndex, commentReaction, this.timer)
      );
    } else {
      // New interaction with a comment that had previous interactions.
      return this.withCommentReaction(
        commentIndex,
        existing.withToggledReaction(commentReaction, allowMultipleReactions)
      );
    }
  }

  withCommentReaction(commentIndex, commentReaction) {
    doNullableTypeCheck(
      commentReaction,
      GameCommentInteraction,
      "Comment Reaction"
    );

    const commentReactions = [];
    for (let index = 0; index < this.commentReactions.length; ++index) {
      const existingCommentReaction = this.commentReactions[index];
      if (existingCommentReaction.commentIndex !== commentIndex) {
        commentReactions.push(existingCommentReaction);
      }
    }
    if (commentReaction !== null) {
      commentReactions.push(commentReaction);
    }

    return new GamePostInteraction(
      this.postReactions,
      commentReactions,
      this.lastComment,
      this.comment,
      this.timer.withNewInteraction(),
      //////////////////////a.h.s single change: added shareTargets and self report to withCommentReaction
      this.shareTargets,
      this.selfReportResponses
    );
  }

  findCommentReaction(commentIndex) {
    doTypeCheck(commentIndex, "number", "Comment ID");
    for (let index = 0; index < this.commentReactions.length; ++index) {
      const commentReaction = this.commentReactions[index];
      if (commentReaction.commentIndex === commentIndex) return commentReaction;
    }
    return null;
  }

  static commentReactionsToJSON(commentReactions) {
    const json = [];
    for (let index = 0; index < commentReactions.length; ++index) {
      json.push(commentReactions[index].toJSON());
    }
    return json;
  }

  static commentReactionsFromJSON(json) {
    const commentReactions = [];
    for (let index = 0; index < json.length; ++index) {
      commentReactions.push(GameCommentInteraction.fromJSON(json[index]));
    }
    return commentReactions;
  }

  toJSON() {
    return {
      postReactions: this.postReactions,
      commentReactions: GamePostInteraction.commentReactionsToJSON(
        this.commentReactions
      ),
      comment: this.comment,
      timer: this.timer.toJSON(),

      //////////////////////a.h.s single change: added shareTargets and self report to JSON
      shareTargets: this.shareTargets,
      selfReportResponses: this.selfReportResponses,
    };
  }

  static fromJSON(json) {
    const timerJSON = json["timer"];

    let timer;
    if (timerJSON !== undefined) {
      timer = InteractionTimer.fromJSON(timerJSON);
    } else {
      const legacyPostShowTime = json["postShowTime"];
      const legacyFirstInteractTimeMS = json["firstInteractTimeMS"];
      const legacyLastInteractTimeMS = json["lastInteractTimeMS"];

      if (legacyPostShowTime !== undefined) {
        timer = new InteractionTimer(
          legacyPostShowTime,
          null,
          null,
          0,
          legacyFirstInteractTimeMS
            ? legacyPostShowTime + legacyFirstInteractTimeMS
            : null,
          legacyLastInteractTimeMS
            ? legacyPostShowTime + legacyLastInteractTimeMS
            : null
        );
      } else {
        timer = InteractionTimer.empty();
      }
    }

    const postReactions = json["postReactions"];
    const postReaction = json["postReaction"];
    const comment = json["comment"];
    //////////////////////a.h.s single change: added shareTargets and self report to JSON
    const shareTargets = json["shareTargets"];
    const selfReportResponses = json["selfReportResponses"] || []; // Initialize self-report responses
    //if share targets is an empty array , change it to string

    return new GamePostInteraction(
      postReactions !== undefined
        ? postReactions
        : postReaction
        ? [postReaction]
        : [],
      GamePostInteraction.commentReactionsFromJSON(json["commentReactions"]),
      comment,
      comment,
      timer,
      //////////////////////a.h.s single change: added shareTargets to JSON
      //check if shareTargets is an empty array if yes change it to string
      shareTargets,
      selfReportResponses
    );
  }
}

/**
 * Stores the interactions of a user with a set of posts.
 * This is used to store the state of all posts in the feed.
 */
export class GamePostInteractionStore {
  postInteractions; // GamePostInteraction[]

  constructor(postInteractions, template) {
    doNullableArrayTypeCheck(
      postInteractions,
      GamePostInteraction,
      "Participant's Interactions with Posts"
    );
    this.postInteractions = postInteractions || [];

    // Copy the post interactions from the template.
    if (template !== undefined) {
      const templateInteractions = template.postInteractions;
      for (let index = 0; index < templateInteractions.length; ++index) {
        const templateInteraction = templateInteractions[index];
        this.postInteractions.push(templateInteraction);
      }
    }
  }

  copy() {
    return new GamePostInteractionStore(null, this);
  }

  static empty() {
    return new GamePostInteractionStore();
  }

  getSubmittedPostsCount() {
    let submitted = 0;
    for (let index = 0; index < this.postInteractions.length; ++index) {
      if (this.postInteractions[index].isCompleted()) {
        submitted += 1;
      }
    }
    return submitted;
  }

  ensureExists(postIndex) {
    while (postIndex >= this.postInteractions.length) {
      this.postInteractions.push(GamePostInteraction.empty());
    }
  }

  get(postIndex) {
    this.ensureExists(postIndex);
    return this.postInteractions[postIndex];
  }

  getCurrentPostIndex() {
    let highestCompletedIndex = -1;
    for (let index = 0; index < this.postInteractions.length; ++index) {
      if (this.postInteractions[index].isCompleted()) {
        highestCompletedIndex = index;
      }
    }
    return highestCompletedIndex + 1;
  }

  update(postIndex, postInteraction) {
    const copy = this.copy();
    copy.ensureExists(postIndex);
    copy.postInteractions[postIndex] = postInteraction;
    return copy;
  }

  toJSON() {
    const json = [];
    const interactions = this.postInteractions;
    for (let index = 0; index < interactions.length; ++index) {
      const interaction = interactions[index];
      json.push(interaction.toJSON());
    }
    return json;
  }

  static fromJSON(json) {
    const interactions = [];
    for (let index = 0; index < json.length; ++index) {
      interactions.push(GamePostInteraction.fromJSON(json[index]));
    }
    return new GamePostInteractionStore(interactions);
  }
}
