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

const SignUp = () => {
  const [role, setRole] = useState('Learner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
  };

  // Password strength function
  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (strongRegex.test(password)) return 'Strong';
    return 'Medium';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    // Name validation
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      setError("Please enter a valid full name (letters and spaces only).");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Email domain restriction
    const allowedDomains = ["gmail.com", "outlook.com", "yahoo.com"];
    const emailDomain = email.split("@")[1];
    if (!allowedDomains.includes(emailDomain)) {
      setError("Please use a valid Gmail, Outlook, or Yahoo email address.");
      return;
    }

    // Password validation
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
      });

      // Send verification email
      await sendEmailVerification(user);
      setInfo('A verification email has been sent. Please check your inbox.');

      // Redirect based on role
      if (role === 'Learner') navigate('/learner-dashboard');
      else if (role === 'Facilitator') navigate('/facilitator-dashboard');
      else if (role === 'Admin') navigate('/admin-dashboard');
      else navigate('/');
    } catch (err) {
      console.error('Signup error:', err.message);

      // Friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Your password is too weak. Please choose a stronger one.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="signup-container d-flex justify-content-center align-items-center">
      <div className="signup-background" /> {/* Blur background */}
      <div className="card p-4 signup-card">
        <h2 className="text-center mb-2">Sign-Up To Get Started</h2>
        <p className="text-center text-muted mb-4">Select your role</p>

        <div className="btn-group d-flex mb-3" role="group">
          {['Learner', 'Facilitator', 'Admin'].map((r) => (
            <button
              key={r}
              type="button"
              className={`btn ${role === r ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleRoleChange(r)}
            >
              {r}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}

        {info && (
          <div className="alert alert-info py-2" role="alert">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && (
              <small
                className={`d-block mt-1 ${
                  getPasswordStrength(password) === 'Strong'
                    ? 'text-success'
                    : getPasswordStrength(password) === 'Medium'
                    ? 'text-warning'
                    : 'text-danger'
                }`}
              >
                Strength: {getPasswordStrength(password)}
              </small>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Create {role.toLowerCase()} account
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-decoration-none">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
