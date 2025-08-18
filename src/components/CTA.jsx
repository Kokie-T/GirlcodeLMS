import React from 'react';
import { useNavigate } from 'react-router-dom';

function CTA() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-white text-center py-10">
      <h3 className="text-2xl font-semibold">
        Ready to transform learning in your company?
      </h3>
      <button
        onClick={() => navigate('/contact')}
        className="mt-4 px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition"
      >
        Contact Us
      </button>
    </div>
  );
}

export default CTA;
