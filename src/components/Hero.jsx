import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './Hero.css';

function Hero() {
  return (
    <motion.div
      className="hero-section text-white text-center"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <Container className="glass-box py-5">
        <motion.h1 className="display-4 fw-bold" whileHover={{ scale: 1.05 }}>
          Future-Proof Your Learning
        </motion.h1>
        <p className="lead">An all-in-one LMS built for the next generation of digital education</p>
        <Button variant="primary" size="lg">Get Started</Button>
      </Container>
    </motion.div>
  );
}

export default Hero;
