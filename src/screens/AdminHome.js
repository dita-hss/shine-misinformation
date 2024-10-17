import {Component} from 'react';
import {getDataManager} from "../model/manager";
import {Link, Navigate} from "react-router-dom";
import StudyUpload from "../components/StudyUpload";
import {ErrorLabel, ProgressLabel} from "../components/StatusLabel";
import UploadIcon from '@mui/icons-material/Upload';
import {isOfType} from "../utils/types";
import {BrokenStudy} from "../model/study";
import {MountAwareComponent} from "../components/MountAwareComponent";
import {auth} from "../database/firebase";
import {setDefaultPageTitle} from "../index";
import {gameVersion} from "../version";


class StudySummary extends Component {
    render() {
        const study = this.props.study;
        // Handle broken studies specially.
        if (isOfType(study, BrokenStudy)) {
            return (
                <div className="rounded-xl border border-red-800 p-3 bg-white shadow">
                    <Link to={`/admin/${study.id}`}
                          className="text-red-500 text-lg font-bold hover:text-red-700 hover:underline">
                        {study.basicSettings.name}
                    </Link>

                    <p dangerouslySetInnerHTML={{__html: study.basicSettings.description}} />
                    <ErrorLabel className="mt-3" value={[<b>This study is broken:</b>, study.error]} />
                </div>
            );
        }

        return (
            <div className={"rounded-xl border p-3 bg-white shadow " +
                            (study.enabled ? "border-green-600" : "border-gray-400")}
                 style={{minHeight: "8rem"}}>

                {study.enabled &&
                    <span className="inline-block w-3.5 h-3.5 mr-2 bg-green-500 rounded-full"
                          title="Study is Enabled" />}

                <Link to={`/admin/${study.id}`}
                      className={"text-lg font-bold hover:underline " +
                                 (study.enabled ? "text-green-600 hover:text-green-700" :
                                                  "text-blue-600 hover:text-blue-700")}>

                    {study.basicSettings.name}
                </Link>

                <p dangerouslySetInnerHTML={{__html: study.basicSettings.description}} />
            </div>
        );
    }
}

class UploadStudyButton extends Component {
    render() {
        return (
            <div className="flex justify-around items-center rounded-xl
                            bg-gray-100 cursor-pointer hover:bg-blue-100 hover:shadow
                            border-2 border-dashed border-gray-800 overflow-hidden"
                 style={{minHeight: "8rem"}}
                 onClick={this.props.onClick}>

                <p className="text-xl font-semibold">
                    <UploadIcon className="mr-1" />
                    Upload New Study
                </p>
            </div>
        );
    }
}

class AdminPage extends MountAwareComponent {
    constructor(props) {
        super(props);
        setDefaultPageTitle();

        this.state = {
            isAdmin: null,
            studies: null,
            error: null,
            showUpload: false
        };
    }

    componentDidMount() {
        super.componentDidMount();

        if (auth.currentUser) {
            this.initialise(auth.currentUser);
        } else {
            const authListener = (user) => {
                if (user) {
                    this.initialise(user);
                    getDataManager().removeAuthChangeListener(authListener);
                }
            };
            getDataManager().addAuthChangeListener(authListener);
        }
    }

    initialise(user) {
        if (!user)
            throw new Error("No user provided");

        const handleError = (activity, error) => {
            this.setStateIfMounted(() => {
                let message = "There was an error " + activity;
                if (error.message && error.message.length > 0) {
                    message += ": " + error.message;
                }
                return {error: message};
            });
        };

        const manager = getDataManager();
        manager.getIsAdmin(user).then(isAdmin => {
            this.setStateIfMounted(() => {
                return {isAdmin: isAdmin};
            });
            if (!isAdmin)
                return;

            manager.getAllStudies(user).then((studies) => {
                this.setStateIfMounted(() => {
                    return {studies: studies};
                });
            }).catch(error => handleError("loading studies", error));
        }).catch(error => handleError("checking whether you are an admin", error));
    }

    showStudyUpload() {
        this.setState(() => {
            return {showUpload: true};
        });
    }

    hideStudyUpload() {
        this.setState(() => {
            return {showUpload: false};
        });
    }

    afterStudyUpload(study) {
        // Refresh the list of all studies.
        const manager = getDataManager();
        manager.clearCachedStudies();
        manager.cacheStudy(study);

        // Move to the study page for the uploaded study.
        this.props.navigate("/admin/" + study.id);
    }

    render() {
        if (!auth.currentUser)
            return (<Navigate to="/sign-in" />);

        let userDisplayName = "Loading...",
            userUID = "Loading...";
        if (auth.currentUser) {
            userDisplayName = auth.currentUser.displayName;
            userUID = auth.currentUser.uid;
        }

        const error = this.state.error;
        const isAdmin = this.state.isAdmin;
        const readIsAdmin = this.state.isAdmin !== null;
        const studies = this.state.studies || [];
        const readStudies = this.state.studies !== null;

        const studyComponents = [];
        for (let index = 0; index < studies.length; ++index) {
            const study = studies[index];
            studyComponents.push((
                <StudySummary study={study} key={study.id} />
            ));
        }

        return (
            <div className="min-h-screen w-full bg-gray-100 font-roboto" >
                {/* The navigation bar. */}
                <div className="flex items-center justify-between w-full bg-white shadow">
                    <Link to="/" className="font-bold text-xl p-3">
                        The Misinformation Game v{gameVersion}
                    </Link>

                    <div className="text-right px-2 py-1">
                        <span className="inline-block text-right text-lg">
                            {userDisplayName}
                        </span>
                        <Link to="/sign-out" className="inline-block ml-2 text-base font-medium hover:text-blue-800
                                                        text-blue-600 cursor-pointer select-none">

                            (Sign Out)
                        </Link>
                        <span className="block text-right text-sm text-gray-600">
                            {userUID}
                        </span>
                    </div>
                </div>

                <div className="w-full p-10">
                    {error &&
                        <ErrorLabel value={error} />}

                    {!error && !isAdmin && readIsAdmin &&
                        <div>
                            <ErrorLabel value={[
                                <b>You are not registered as an admin.</b>,
                                <span>
                                    You will not able to access the admin dashboard until you are
                                    granted admin privileges.
                                </span>,
                                <span>
                                    Please contact your IT support to get them to configure your
                                    admin privileges. When you contact them, make sure you include
                                    your user ID, {auth.currentUser.uid}.
                                </span>
                            ]} />

                            <p className="pt-8">
                                Documentation on how to grant admin privileges can be found in the&nbsp;
                                <a href="https://misinfogame.com/Administrators"
                                   className="underline text-purple-600 hover:text-purple-900">

                                    Registering Administrators documentation
                                </a>.
                            </p>
                        </div>}

                    {/* The studies. */}
                    {!error && isAdmin && readStudies &&
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
                            {studyComponents}
                            <UploadStudyButton onClick={() => this.showStudyUpload()}/>
                        </div>}

                    {/* Label saying that the studies are loading. */}
                    {!error && (!readIsAdmin || isAdmin) && !readStudies &&
                        <ProgressLabel value="Loading studies..." />}
                </div>

                {/* Allows new studies to be uploaded. */}
                <StudyUpload title="Upload Study"
                             visible={this.state.showUpload}
                             onHide={() => this.hideStudyUpload()}
                             onUpload={(study) => this.afterStudyUpload(study)} />
            </div>
        );
    }
}

export default AdminPage;
