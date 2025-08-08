import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext'; // Uncomment when AuthContext is ready
import './Header.css';

function Header() {
  const navigate = useNavigate();
  // const { currentUser } = useAuth(); // Uncomment when AuthContext is ready

  // TEMP: use a dummy currentUser for now
  const currentUser = null; // Change to a mock object to test logged-in view

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="py-1">
      <Container>
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/LMSPro.png" alt="LMSPro Logo" className="logo-img" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {currentUser ? (
              <>
                <Nav.Link onClick={() => navigate('/learner-dashboard')}>
                  Dashboard
                </Nav.Link>
                <Button 
                  variant="outline-light" 
                  onClick={() => {
                    // Implement logout logic here
                    navigate('/');
                  }}
                  className="ms-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link 
                  onClick={() => navigate('/signup')}
                  className="me-2"
                >
                  Sign Up
                </Nav.Link>
                <Button 
                  variant="outline-light" 
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
