import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

const features = [
  { title: 'Custom Courses', desc: 'Create, manage and assign courseware.' },
  { title: 'Admin Dashboard', desc: 'Monitor engagement and track progress.' },
  { title: 'Mobile Friendly', desc: 'Accessible on all devices.' },
];

function Features() {
  return (
    <Container className="text-center py-5">
      <h2 className="mb-4">Why Choose LMS Pro?</h2>
      <Row>
        {features.map((f, i) => (
          <Col md={4} key={i} className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-100 shadow-sm glass-card">
                <Card.Body>
                  <Card.Title>{f.title}</Card.Title>
                  <Card.Text>{f.desc}</Card.Text>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Features;
