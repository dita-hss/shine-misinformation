import {ErrorLabel} from '../../components/StatusLabel';
import {getDataManager} from "../../model/manager";
import {ContinueButton} from "../../components/ContinueButton"
import {ActiveGameScreen} from "./ActiveGameScreen";
import React from "react";

import {
  connectToDevice,
  sendTrigger
} from "../../utils/fnirs";
import { logTimestamp } from '../../utils/timestamp';


export class GameIdentification extends ActiveGameScreen {
  constructor(props) {
    super(props, ["identification"]);
    this.state = {
      ...this.state,
      value: "",
      displayError: false,
      ignoreKeyDowns: false,
      submitOnEnterUp: false,
    };
  }

  afterGameLoaded(game) {
    super.afterGameLoaded(game);
    if (!game.participant.participantID) return;

    this.setStateIfMounted(() => {
      return { value: game.participant.participantID };
    });
  }

  componentDidMount() {
    super.componentDidMount();

    // Preload the study.
    getDataManager()
      .getActiveStudy()
      .catch((err) => {
        console.error(err);
      });
  }

  static isValidValue(value) {
    return value && value.trim() !== "";
  }

  static isEnterKey(e) {
    return e.charCode === 13 || e.keyCode === 13;
  }

  handleKeyDown(e) {
    if (this.state.ignoreKeyDowns || !GameIdentification.isEnterKey(e)) return;

    if (GameIdentification.isValidValue(this.state.value)) {
      // Set the state so the release of the enter key will submit.
      this.setState(() => {
        return {
          displayError: true,
          submitOnEnterUp: true,
          ignoreKeyDowns: true,
        };
      });

      // If the user waits a second without releasing enter, cancel.
      setTimeout(() => {
        this.setStateIfMounted(() => {
          return { submitOnEnterUp: false };
        });
      }, 1000);
    } else {
      // If the ID is invalid, display the error.
      this.setState(() => {
        return { displayError: true };
      });
    }
  }

  handleKeyUp(game, e, target) {
    if (!GameIdentification.isEnterKey(e)) return;

    if (
      this.state.submitOnEnterUp &&
      GameIdentification.isValidValue(this.state.value)
    ) {
      this.submitID(game, this.state.value);
      this.props.navigate(target);
    } else if (this.state.ignoreKeyDowns) {
      this.setState(() => {
        return { ignoreKeyDowns: false, submitOnEnterUp: false };
      });
    }
  }

  updateID(game, id) {
    this.setState(() => {
      return { value: id };
    });
  }

  async submitID(game, id) {

    // this would mark a rest period- no longer since an instruction screen is presented prior to the rest
    // trigger and timestamp for this is handled in the restscreen
    // sendTrigger(-1);
    // logTimestamp("rest");

    game.participant.participantID = id;
    game.saveLocally();
  }

  async handleConnect() {
    try {
      await connectToDevice();
      // const isDeviceReady = await queryDevice();
      // //await setPulseDuration(1000);
      // if (isDeviceReady) {
      //   console.log("Device is ready!");
      //   //await setPulseDuration(1000);
      // } else {
      //   console.log("Device not found.");
      // }
    } catch (error) {
      console.error("Failed to connect to device:", error);
    }
  }

  renderWithStudyAndGame(study, game) {
    const target = "/study/" + study.id + window.location.search;
    return (
      <div className="w-full bg-gray-100" style={{ minHeight: "100vh" }}>
        <div
          className="bg-white rounded-xl shadow-xl border border-gray-400
                                grid space-y-2 px-10 py-4 max-w-full
                                fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <p className="font-bold">Enter your access ID:</p>
          <input
            className="px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100"
            placeholder="ID Number"
            value={this.state.value}
            onChange={(e) => this.updateID(game, e.target.value)}
            onKeyDown={(e) => this.handleKeyDown(e)}
            onKeyUp={(e) => this.handleKeyUp(game, e, target)}
          ></input>
          <h1 className="font-bold text-center text-gray-800 mb-4">
            Connect to Device
          </h1>

          <button
            onClick={() => this.handleConnect()} // Call the handler directly
            className="
            px-6 py-2
            bg-blue-500 
            text-white 
            font-semibold 
            rounded-lg 
            shadow-md 
            hover:bg-blue-600 
            active:bg-blue-700 
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-400 
            focus:ring-opacity-75
            transition-all
          "
          >
            Connect
          </button>

          {this.state.displayError &&
            (!this.state.value || this.state.value.trim() === "") && (
              <ErrorLabel value="Please enter an ID" />
            )}

          <ContinueButton
            to={target}
            onSubmit={() => this.submitID(game, this.state.value)}
            condition={GameIdentification.isValidValue(this.state.value)}
            disabledTooltip="Enter your access ID to continue"
            onClick={() =>
              this.setState(() => {
                return { displayError: true };
              })
            }
            active={this.state.submitOnEnterUp}
          />
        </div>
      </div>
    );
  }
}
