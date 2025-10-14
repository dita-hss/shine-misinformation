//
// Edit this file if you are deploying your
// own instance of The Misinformation Game!
//

/**
 * Replace the following Firebase configuration object
 * with the config for your project.
 *
 * Your Firebase configuration object can be accessed
 * from your Firebase console:
 * -> Settings Cog (Next to project overview in top-left)
 * -> Project Settings
 * -> General Tab
 * -> SDK setup and configuration (You may have to scroll down)
 * -> Config ('npm' is selected by default)
 */
// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// // example configuration n development configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDbBqOrit6Kj3FUsmI3i3AOOu27PLtkwTM",
//   authDomain: "misinformation-game.firebaseapp.com",
//   projectId: "misinformation-game",
//   storageBucket: "misinformation-game.appspot.com",
//   messagingSenderId: "780788861427",
//   appId: "1:780788861427:web:7f9b2b20c50e9b38cf6a86",
// };

// shine configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING,
  appId: process.env.REACT_APP_FIREBASE_APPID,
};

// Initialize Firebase
//const app = initializeApp(firebaseConfig);

// Do not edit this line.
export default firebaseConfig;
