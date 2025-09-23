import React, { useState } from 'react';

const apiKey = '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';
const apiUrl = 'https://api.deepseek.com/chat/completions';

export default function QuestionGenerator() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [answerType, setAnswerType] = useState('text');
  const [assessmentType, setAssessmentType] = useState('test');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setQuestions([]);

    // Create prompt for AI model based on inputs
    const prompt = `Generate ${numQuestions} ${assessmentType} questions with ${answerType} answers on the topic "${topic}". Each question should be clear and concise. Number the questions as Q1, Q2, etc.`;

    // Call DeepSeek-R1 API with the prompt
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: [
            { role: 'system', content: 'You are a helpful educational assistant.' },
            { role: 'user', content: prompt },
          ],
          stream: false,
        }),
      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        // Extract the generated text
        const text = data.choices[0].message.content;

        // Split into questions by lines or numbers
        // Simple parsing assuming questions start with Q1, Q2 etc.
        const splitQuestions = text
          .split(/\n/)
          .map((line) => line.trim())
          .filter((line) => line.match(/^Q\d+/))
          .map((line) => line.replace(/^Q\d+\.\s*/, ''));

        setQuestions(splitQuestions.length > 0 ? splitQuestions : [text]);
      } else {
        setQuestions(['No questions generated.']);
      }
    } catch (err) {
      setQuestions(['Error generating questions: ' + err.message]);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <h2>AI Question Generator for LMS</h2>

      <label>
        Topic:
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic"
          style={{ width: '100%', padding: 6, marginBottom: 12 }}
        />
      </label>

      <label>
        Number of Questions:
        <input
          type="number"
          min="1"
          max="50"
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          style={{ width: '100%', padding: 6, marginBottom: 12 }}
        />
      </label>

      <label>
        Answer Type:
        <select
          value={answerType}
          onChange={(e) => setAnswerType(e.target.value)}
          style={{ width: '100%', padding: 6, marginBottom: 12 }}
        >
          <option value="text">Text</option>
          <option value="multiple choice">Multiple Choice</option>
        </select>
      </label>

      <label>
        Assessment Type:
        <select
          value={assessmentType}
          onChange={(e) => setAssessmentType(e.target.value)}
          style={{ width: '100%', padding: 6, marginBottom: 12 }}
        >
          <option value="test">Test</option>
          <option value="quiz">Quiz</option>
          <option value="assignment">Assignment</option>
        </select>
      </label>

      <button
        onClick={handleGenerateQuestions}
        disabled={loading || !topic.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          cursor: 'pointer',
          border: 'none',
          borderRadius: 4,
          marginBottom: 20,
        }}
      >
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>

      {questions.length > 0 && (
        <div>
          <h3>Generated Questions:</h3>
          <ol>
            {questions.map((q, idx) => (
              <li key={idx} style={{ marginBottom: 10 }}>
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
