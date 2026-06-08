import { useAuth as useAuthContext } from "../context/auth-context";

export function useAuth() {
  const { user, userProfile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, logout, updateUserProfile } = useAuthContext();
  return { user, userProfile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, logout, updateUserProfile };
}
export default useAuth;
