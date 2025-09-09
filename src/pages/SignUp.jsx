import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import './SignUp.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Live validation: Full Name can only have letters and spaces
  const handleFullNameChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
    setFullName(value);

    if (!value) {
      setErrors((prev) => ({
        ...prev,
        fullName: "Full name is required",
      }));
    } else {
      setErrors((prev) => {
        const { fullName, ...rest } = prev;
        return rest;
      });
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: "", color: "" };
    if (password.length < 6) return { label: "Weak", color: "red", value: 33 };
    if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8)
      return { label: "Strong", color: "green", value: 100 };
    return { label: "Medium", color: "orange", value: 66 };
  };

  const validateForm = () => {
    const newErrors = {};
    if (!fullName) newErrors.fullName = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!agreeTerms) newErrors.agreeTerms = "You must agree to the terms";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      alert(`✅ Signup successful for ${fullName} (client-side only)`);
      setFullName(""); setEmail(""); setPassword(""); setConfirmPassword(""); setAgreeTerms(false);
    } else {
      setErrors(formErrors);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="signup-container">
      <div className="signup-card code-style-card">

        {/* Logo */}
        <div className="text-center mb-3">
          <img src="/LMSPro.png" alt="LMS Pro Logo" style={{ width: "120px", height: "auto" }} />
        </div>

        <h2 className="mb-3 text-center fw-bold">Sign Up for LMS Pro</h2>
        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="mb-3">
            <label>Full Name</label>
            <input
              type="text"
              className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
              value={fullName}
              onChange={handleFullNameChange}
              placeholder="John Doe"
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label>Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
            {strength.label && (
              <div className="mt-1">
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${strength.value}%`,
                      backgroundColor: strength.color,
                    }}
                  ></div>
                </div>
                <small style={{ color: strength.color }}>Strength: {strength.label}</small>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>

          {/* Terms */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className={`form-check-input ${errors.agreeTerms ? "is-invalid" : ""}`}
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              id="termsCheck"
            />
            <label className="form-check-label" htmlFor="termsCheck">
              I agree to the <Link to="/privacy">PrivacyPolicy</Link>
            </label>
            {errors.agreeTerms && <div className="invalid-feedback d-block">{errors.agreeTerms}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2">Sign Up</button>
        </form>

        <p className="text-center mt-3">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
