import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBo0saCwjsdm93Jsyi9XEdavMbtNDTmdys",
  authDomain: "trial-microbit-web.firebaseapp.com",
  projectId: "trial-microbit-web",
  storageBucket: "trial-microbit-web.firebasestorage.app",
  messagingSenderId: "1097122447075",
  appId: "1:1097122447075:web:83a3554c3c7f0389054fd6",
  measurementId: "G-0SGSC5BH2C",
  databaseURL: "https://trial-microbit-web-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export const updateMicrobitState = (state: string) => {
  return set(ref(database, "microbit/state"), {
    value: state,
    timestamp: Date.now(),
  });
};

export const onMicrobitState = (callback: (state: string) => void) => {
  const stateRef = ref(database, "microbit/state");
  return onValue(stateRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data.value);
    }
  });
};
