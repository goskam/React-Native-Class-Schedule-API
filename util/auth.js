import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Reload to ensure fresh data from Firebase backend
    await user.reload();

    if (!user.emailVerified) {
      throw new Error("Email not verified. Please check your inbox.");
    }

    const token = await user.getIdToken();

    console.log("Logged in user email: ----------------------", user.email);

    return { token, user: { uid: user.uid, email: user.email } };
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}
