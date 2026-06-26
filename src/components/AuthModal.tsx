import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Phone,
  Check
} from "lucide-react";
import { 
  auth, 
  googleProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  isMobileDevice,
  translateFirebaseAuthError
} from "../utils/firebase";
import { ConfirmationResult } from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { uid: string; name: string; email: string; phone: string; photoURL: string }) => void;
  initialError?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialError = "" }) => {
  const [authMethod, setAuthMethod] = useState<"choose" | "phone">("choose");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);
  
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clean up reCAPTCHA container on unmount or method change
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("Error clearing recaptcha verifier:", e);
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, [authMethod, isOpen]);

  const initRecaptcha = () => {
    if (recaptchaVerifierRef.current) return;
    
    try {
      // Create a hidden recaptcha element if it doesn't exist
      let container = document.getElementById("recaptcha-verifier-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "recaptcha-verifier-container";
        document.body.appendChild(container);
      }
      
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-verifier-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved, proceed to send OTP
        },
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please try again.");
          setLoading(false);
        }
      });
    } catch (err: any) {
      console.error("reCAPTCHA init error:", err);
      setError("Failed to initialize security verification. Please refresh.");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const isMobile = isMobileDevice();
      console.log(`Initiating Google Sign-In. Device classification: ${isMobile ? "MOBILE (Redirect)" : "DESKTOP (Popup)"}`);

      if (isMobile) {
        // Automatically use signInWithRedirect() on mobile devices
        await signInWithRedirect(auth, googleProvider);
        // Page will redirect, so keep loading active
        return;
      }

      // Keep signInWithPopup() for desktop only
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const profileData = {
        uid: user.uid,
        name: user.displayName || "Bluber Resident",
        email: user.email || "",
        phone: user.phoneNumber || "",
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`
      };

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(profileData);
        }
        onClose();
        resetStates();
      }, 1500);
    } catch (err: any) {
      console.error("Google Sign-in error:", err);
      const userMessage = translateFirebaseAuthError(err);
      setError(userMessage);
    } finally {
      // Don't disable loading if we're redirecting on mobile to avoid UI flashing
      if (!isMobileDevice()) {
        setLoading(false);
      }
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError("Please enter a valid phone number.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/[-\s+()]/g, "");
    if (cleanPhone.length < 10) {
      setError("Phone number must be at least 10 digits.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      initRecaptcha();
      
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA verifier not initialized");
      }

      const fullPhone = `${countryCode}${cleanPhone}`;
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifierRef.current);
      
      confirmationResultRef.current = confirmation;
      setOtpSent(true);
      setCountdown(60); // 1 minute cooldown
    } catch (err: any) {
      console.error("Phone sign-in error:", err);
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please check the digits.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes before trying again.");
      } else {
        setError("Unable to send OTP. Please verify your mobile connection and try again.");
      }
      
      // Clean up recaptcha so it re-initializes next time
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!confirmationResultRef.current) {
        throw new Error("No confirmation code found. Please request a new OTP.");
      }

      const result = await confirmationResultRef.current.confirm(otp);
      const user = result.user;

      const profileData = {
        uid: user.uid,
        name: user.displayName || `User-${user.uid.slice(0, 5)}`,
        email: user.email || "",
        phone: user.phoneNumber || `${countryCode}${phoneNumber}`,
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`
      };

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(profileData);
        }
        onClose();
        resetStates();
      }, 1500);
    } catch (err: any) {
      console.error("OTP verification error:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid verification code. Please check the code and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("The verification code has expired. Please request a new OTP.");
      } else {
        setError("Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetStates = () => {
    setAuthMethod("choose");
    setPhoneNumber("");
    setOtp("");
    setOtpSent(false);
    setCountdown(0);
    setLoading(false);
    setError("");
    setSuccess(false);
    confirmationResultRef.current = null;
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {}
      recaptchaVerifierRef.current = null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!loading && !success) {
                onClose();
                resetStates();
              }
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-border-custom/40 z-10 text-left"
          >
            {/* Header / Brand */}
            <div className="p-6 pb-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-[#EDF7EF] to-white">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-md">
                  BL
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">Bluber Account</h3>
                  <p className="text-[10px] text-primary font-bold">Chamba's Hyperlocal Network</p>
                </div>
              </div>
              
              {!loading && !success && (
                <button
                  onClick={() => {
                    onClose();
                    resetStates();
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-5">
              {success ? (
                // Success screen
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <Check size={36} strokeWidth={3} className="animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-text-primary">Authenticated Successfully!</h4>
                    <p className="text-xs text-text-secondary mt-1">Welcome to Chamba's elite concierge service.</p>
                  </div>
                </motion.div>
              ) : (
                <>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-[11px] font-bold flex items-start gap-2 leading-relaxed"
                    >
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {authMethod === "choose" ? (
                    // Choosing method screen
                    <div className="space-y-4 text-center">
                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-text-primary tracking-tight">Unlock Premium Services</h4>
                        <p className="text-xs text-text-secondary leading-normal max-w-[280px] mx-auto">
                          Sign in securely to place grocery orders, book scooties, and access premium concierge desks.
                        </p>
                      </div>

                      <div className="space-y-3 pt-3">
                        {/* Google Sign-in */}
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          className="w-full h-12 border border-border-custom hover:bg-gray-50 text-text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#EA4335"
                              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.281 1.09 15.549 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.79-.08-1.4-.19-1.925H12.24z"
                            />
                          </svg>
                          <span>Continue with Google</span>
                        </button>

                        <div className="flex items-center gap-3">
                          <hr className="grow border-gray-100" />
                          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">or</span>
                          <hr className="grow border-gray-100" />
                        </div>

                        {/* Mobile Number Login */}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMethod("phone");
                            setError("");
                          }}
                          disabled={loading}
                          className="w-full h-12 bg-primary hover:bg-[#154627] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md disabled:opacity-50"
                        >
                          <Smartphone size={16} />
                          <span>Continue with Mobile OTP</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Phone / OTP Verification form screen
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!otpSent) {
                              setAuthMethod("choose");
                            } else {
                              setOtpSent(false);
                              setOtp("");
                            }
                            setError("");
                          }}
                          className="text-[10px] font-extrabold text-primary hover:underline border-none bg-transparent cursor-pointer"
                        >
                          ← Go Back
                        </button>
                      </div>

                      {!otpSent ? (
                        // Phone Number Form
                        <form onSubmit={handleSendOTP} className="space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-extrabold text-text-primary">What's your phone number?</h4>
                            <p className="text-[11px] text-text-secondary leading-normal">
                              We will send a 6-digit verification code to log you in.
                            </p>
                          </div>

                          <div className="flex gap-2">
                            {/* Country Code Select */}
                            <div className="relative">
                              <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="h-12 px-3 bg-canvas text-xs font-bold border border-border-custom rounded-xl focus:outline-none focus:border-primary cursor-pointer appearance-none text-center pr-6"
                              >
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                              </select>
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary text-[8px] font-black">
                                ▼
                              </div>
                            </div>

                            {/* Phone Input */}
                            <div className="grow relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                                <Phone size={14} />
                              </div>
                              <input
                                type="tel"
                                placeholder="98765 43210"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                className="w-full h-12 pl-9 pr-4 bg-canvas text-xs font-bold border border-border-custom rounded-xl focus:outline-none focus:border-primary placeholder:text-text-secondary/40"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary hover:bg-[#154627] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Verifying Device...</span>
                              </>
                            ) : (
                              <>
                                <span>Send OTP Code</span>
                                <ArrowRight size={14} />
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        // OTP Code Form
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-extrabold text-text-primary">Enter the 6-digit code</h4>
                            <p className="text-[11px] text-text-secondary leading-normal">
                              Sent to <span className="font-mono font-bold text-text-primary">{countryCode} {phoneNumber}</span>
                            </p>
                          </div>

                          <input
                            type="text"
                            placeholder="0 0 0 0 0 0"
                            required
                            pattern="\D*\d\D*\d\D*\d\D*\d\D*\d\D*\d\D*"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="w-full h-12 bg-canvas text-center text-lg font-black tracking-[10px] pl-3 border border-border-custom rounded-xl focus:outline-none focus:border-primary placeholder:opacity-30"
                          />

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary hover:bg-[#154627] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Verifying OTP...</span>
                              </>
                            ) : (
                              <span>Verify & Log In</span>
                            )}
                          </button>

                          <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary mt-1">
                            <span>Didn't receive code?</span>
                            {countdown > 0 ? (
                              <span>Resend in <strong className="text-primary">{countdown}s</strong></span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendOTP}
                                className="text-primary hover:underline font-black border-none bg-transparent cursor-pointer"
                              >
                                Resend OTP
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-secondary/80 mt-2">
                    <ShieldCheck size={12} className="text-primary" />
                    <span>Secure end-to-end cloud verification by Google</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
