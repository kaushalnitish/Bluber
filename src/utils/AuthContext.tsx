import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  getRedirectResult, 
  translateFirebaseAuthError 
} from "./firebase";
import { safeStorage } from "./safeStorage";

export interface UserInfo {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
}

export interface ProfileInfo {
  name: string;
  phone: string;
  email: string;
}

interface AuthContextType {
  user: UserInfo | null;
  userProfile: ProfileInfo;
  isAuthInitializing: boolean;
  isAuthModalOpen: boolean;
  authError: string;
  pendingAction: { type: string; data?: any } | null;
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthError: (err: string) => void;
  setPendingAction: (action: { type: string; data?: any } | null) => void;
  setUserProfile: React.Dispatch<React.SetStateAction<ProfileInfo>>;
  updateProfile: (profile: ProfileInfo) => void;
  logout: () => Promise<void>;
  handleAuthSuccess: (authUser: UserInfo) => void;
  setPendingActionAndOpenAuth: (action: { type: string; data?: any }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(() => {
    const saved = safeStorage.getItem("bluber_auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [userProfile, setUserProfile] = useState<ProfileInfo>(() => {
    const saved = safeStorage.getItem("bluber_profile");
    if (saved) return JSON.parse(saved);
    const savedAuth = safeStorage.getItem("bluber_auth_user");
    if (savedAuth) {
      const u = JSON.parse(savedAuth);
      return { name: u.name, phone: u.phone, email: u.email };
    }
    return { name: "", phone: "", email: "" };
  });

  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: any } | null>(null);

  useEffect(() => {
    safeStorage.setItem("bluber_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    let redirectResolved = false;
    let authStateResolved = false;

    const checkFinished = () => {
      if (redirectResolved && authStateResolved) {
        setIsAuthInitializing(false);
      }
    };

    console.log("[DEBUG] AuthProvider: Checking redirect result...");
    getRedirectResult(auth)
      .then((result) => {
        console.log("[DEBUG] AuthProvider: getRedirectResult complete. Result exists:", !!result);
        if (result && result.user) {
          const firebaseUser = result.user;
          const u: UserInfo = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.phoneNumber || "Verified User",
            email: firebaseUser.email || "",
            phone: firebaseUser.phoneNumber || "",
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`
          };
          console.log("[DEBUG] AuthProvider: Resolved user after redirect:", u);
          setUser(u);
          safeStorage.setItem("bluber_auth_user", JSON.stringify(u));
          setUserProfile({
            name: u.name,
            phone: u.phone,
            email: u.email
          });
          setAuthError("");
          setIsAuthModalOpen(false);
        }
      })
      .catch((err) => {
        console.error("[DEBUG] AuthProvider: Redirect Sign-in error caught on load:", err);
        const friendlyMessage = translateFirebaseAuthError(err);
        setAuthError(friendlyMessage);
        setIsAuthModalOpen(true);
      })
      .finally(() => {
        redirectResolved = true;
        checkFinished();
      });

    console.log("[DEBUG] AuthProvider: Setting up onAuthStateChanged listener...");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[DEBUG] AuthProvider: onAuthStateChanged fired. User object:", firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName } : "null");
      if (firebaseUser) {
        const u: UserInfo = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.phoneNumber || "Verified User",
          email: firebaseUser.email || "",
          phone: firebaseUser.phoneNumber || "",
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`
        };
        setUser(u);
        safeStorage.setItem("bluber_auth_user", JSON.stringify(u));
        
        // Only override if the saved profile is empty or doesn't match
        const savedProfile = safeStorage.getItem("bluber_profile");
        const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
        if (!parsedProfile || !parsedProfile.name) {
          setUserProfile({
            name: u.name,
            phone: u.phone,
            email: u.email
          });
        }
      } else {
        setUser(null);
        safeStorage.removeItem("bluber_auth_user");
        safeStorage.removeItem("bluber_profile");
        setUserProfile({ name: "", phone: "", email: "" });
      }
      authStateResolved = true;
      checkFinished();
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = (profile: ProfileInfo) => {
    setUserProfile(profile);
    safeStorage.setItem("bluber_profile", JSON.stringify(profile));
    if (user) {
      const updatedUser = {
        ...user,
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      };
      setUser(updatedUser);
      safeStorage.setItem("bluber_auth_user", JSON.stringify(updatedUser));
    }
  };

  const logout = async () => {
    try {
      console.log("[DEBUG] AuthProvider: Executing logout(). Current user:", auth.currentUser?.email);
      await signOut(auth);
      setUser(null);
      safeStorage.removeItem("bluber_auth_user");
      safeStorage.removeItem("bluber_profile");
      setUserProfile({ name: "", phone: "", email: "" });
      console.log("[DEBUG] AuthProvider: Logout successful. Local state wiped.");
    } catch (err) {
      console.error("[DEBUG] AuthProvider: Logout error:", err);
    }
  };

  const handleAuthSuccess = (authUser: UserInfo) => {
    setIsAuthModalOpen(false);
    setUser(authUser);
    safeStorage.setItem("bluber_auth_user", JSON.stringify(authUser));
    setUserProfile({
      name: authUser.name,
      phone: authUser.phone,
      email: authUser.email
    });
  };

  const setPendingActionAndOpenAuth = (action: { type: string; data?: any }) => {
    setPendingAction(action);
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      isAuthInitializing,
      isAuthModalOpen,
      authError,
      pendingAction,
      setIsAuthModalOpen,
      setAuthError,
      setPendingAction,
      setUserProfile,
      updateProfile,
      logout,
      handleAuthSuccess,
      setPendingActionAndOpenAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
