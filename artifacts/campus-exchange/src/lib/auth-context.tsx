import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // If brand new Google account, mark that onboarding is needed
    if (result.additionalUserInfo?.isNewUser) {
      localStorage.setItem(`needs_onboarding_${result.user.uid}`, "true");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      queryClient.clear();
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
