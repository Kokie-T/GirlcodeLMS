import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';  // Make sure this is correctly configured!
import './SignUp.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const SignUp = () => {
  const [role, setRole] = useState('Learner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(''); // Info message for email verification
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      // Create user with email & password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user data (name and role) in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
      });

      // Send verification email
      await sendEmailVerification(user);

      // Notify user to check email
      setInfo('A verification email has been sent to your email address. Please check your inbox.');

      // Redirect based on role
      if (role === 'Learner') navigate('/learner-dashboard');
      else if (role === 'Facilitator') navigate('/facilitator-dashboard');
      else if (role === 'Admin') navigate('/admin-dashboard');
      else navigate('/');

    } catch (err) {
      console.error('Signup error:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="signup-container d-flex justify-content-center align-items-center">
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
              minLength={6}
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
