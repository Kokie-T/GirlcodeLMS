import React from 'react';
import { Container, Button } from 'react-bootstrap';

function CTA() {
  return (
    <div className="bg-dark text-white text-center py-5">
      <Container>
        <h3>Ready to transform learning in your company?</h3>
        <Button variant="outline-light" size="lg" className="mt-3">Request a Demo</Button>
      </Container>
    </div>
  );
}

export default CTA;
