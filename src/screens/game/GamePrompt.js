import {ContinueBanner} from "../../components/ContinueButton";
import {Component} from "react";


export class GamePrompt extends Component {
    render() {
        const study = this.props.study;
        return (
            <div className="fixed left-0 top-0 w-full flex flex-col z-50
                            justify-center items-center bg-white bg-opacity-100"
                 style={{minHeight: "100vh"}}>

                <div className="m-4 max-w-2xl">
                    <p className="text-center text-4xl"
                       dangerouslySetInnerHTML={{__html: study.basicSettings.prompt}} />

                    {/* Used for reserving space below the continue button. */}
                    <div className="h-16" />
                </div>

                <ContinueBanner
                    to={null}
                    condition={true}
                    onClick={this.props.onClick}
                    delay={study.advancedSettings.promptDelaySeconds} />
            </div>
        );
     }
}

