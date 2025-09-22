import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Ensures the currently logged-in user is an Admin.
 * Redirect or restrict access if not.
 */
export const ensureAdminUser = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) throw new Error("User not found in Firestore");

  const data = snap.data();
  if (data.role !== "admin") throw new Error("Access restricted to Admins only");

  return { id: snap.id, ...data };
};
