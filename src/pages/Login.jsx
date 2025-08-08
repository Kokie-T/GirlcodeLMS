import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import './Login.css';


function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
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
    if (role === "Learner") navigate("/learner-dashboard");
    else if (role === "Facilitator") navigate("/facilitator-dashboard");
    else if (role === "Admin") navigate("/admin-dashboard");
    else navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await redirectBasedOnRole(userCredential.user.uid);
    } catch (err) {
      setError("Failed to log in. Please check your email and password.");
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore, else create a new 'Learner' user
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await userDocRef.set({
          uid: user.uid,
          name: user.displayName || "",
          email: user.email,
          role: "Learner", // default role for Google sign-in
          createdAt: new Date().toISOString(),
        });
      }

      await redirectBasedOnRole(user.uid);
    } catch (err) {
      setError("Google login failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <Container className="login-page py-5" style={{ minHeight: "100vh" }}>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div className="p-4 shadow-sm rounded bg-white">
            <h2 className="text-center mb-4">Login</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-between mb-3">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Link to="/forgot-password" className="text-decoration-none">
                  Forgot password?
                </Link>
              </div>

              <Button variant="primary" type="submit" className="w-100 mb-3">
                Login
              </Button>

              <div className="text-center mb-3">OR</div>

              <Button
                variant="outline-danger"
                className="w-100 d-flex align-items-center justify-content-center mb-3"
                onClick={handleGoogleLogin}
              >
                <FaGoogle className="me-2" />
                Login with Google
              </Button>

              <div className="text-center">
                Don't have an account?{" "}
                <Link to="/signup" className="text-decoration-none">
                  Sign up
                </Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
