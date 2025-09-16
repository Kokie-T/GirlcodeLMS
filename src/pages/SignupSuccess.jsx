import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function SignupSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get user details passed from SignUp.jsx
  const { email, password, fullName } = location.state || {};

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: "500px", width: "100%", borderRadius: "12px" }}>
        <div className="card-body text-center p-4">
          <h3 className="mb-3 text-success">🎉 Sign Up Successful!</h3>
          <p className="text-muted">Welcome aboard, <strong>{fullName}</strong>!</p>
          
          <div className="alert alert-success text-start">
            <p className="mb-1"><strong>Email:</strong> {email}</p>
            <p className="mb-0"><strong>Password:</strong> {password}</p>
          </div>

          <p className="text-muted mt-3">
            We’ve sent a <strong>verification email</strong> to <em>{email}</em>.  
            Please check your inbox and verify your account.
          </p>

          <button 
            className="btn btn-primary mt-3 w-100"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupSuccess;
