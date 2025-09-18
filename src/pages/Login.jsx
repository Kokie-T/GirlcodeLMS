import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Login.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const redirectBasedOnRole = async (userUid) => {
    const userDoc = await getDoc(doc(db, "users", userUid));
    if (!userDoc.exists()) {
      setError("User data not found. Contact admin.");
      return;
    }
    const role = userDoc.data().role;
    if (role === "student") navigate("/learner-dashboard");
    else if (role === "Facilitator") navigate("/facilitator-dashboard");
    else if (role === "Admin") navigate("/admin-dashboard");
    else navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await redirectBasedOnRole(userCredential.user.uid);
    } catch (err) {
      console.error(err);
      setError("Failed to log in. Please check your email and password.");
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!formData.email) {
      setError("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setSuccess("✅ Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to send reset email. Make sure the email is correct.");
    }
  };
  
  return (
    <Container className="login-page py-5" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={5}>
          <div
            className={`p-4 shadow-sm rounded bg-white code-style-card ${
              showForgotPassword ? "forgot-password-active" : ""
            }`}
          >
            {/* Logo */}
            <img src="/LMSPro.png" alt="LMS Pro Logo" className="login-logo" />

            <h2 className="text-center mb-4 fw-bold">Login</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </Form.Group>

              {!showForgotPassword && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between mb-3 align-items-center">
                    <Form.Check
                      type="checkbox"
                      label="Remember me"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button variant="primary" type="submit" className="w-100 mb-3">
                    Login
                  </Button>
                </>
              )}

              {showForgotPassword && (
                <>
                  <p className="text-center mb-3">
                    Enter your email and click below to reset your password.
                  </p>
                  <Button
                    variant="warning"
                    type="button"
                    className="w-100 mb-3"
                    onClick={handleForgotPassword}
                  >
                    Send Reset Email
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Back to Login
                    </button>
                  </div>
                </>
              )}

              {!showForgotPassword && (
                <div className="text-center mt-3">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-decoration-none">
                    Sign up
                  </Link>
                </div>
              )}
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
