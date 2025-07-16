// frontend/src/components/ai/BeautyAdvisor.jsx

import React, { useState } from 'react';
import apiClient from '../../api/axiosConfig'; // استيراد مثيل Axios
import { Link } from 'react-router-dom'; // لإنشاء روابط التنقل

function BeautyAdvisor() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAnswer('');
    setLoading(true);

    try {
      // إرسال السؤال إلى الواجهة الخلفية لـ Laravel
      const response = await apiClient.post('/beauty-advisor/ask', { question });
      setAnswer(response.data.answer);
    } catch (err) {
      console.error('Error asking AI advisor:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to get an answer from the AI advisor. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          AI Beauty Advisor ✨
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Ask me anything about beauty, skincare, makeup, or product ingredients!
        </p>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label htmlFor="question" className="block text-gray-700 text-sm font-bold mb-2">
              Your Question:
            </label>
            <textarea
              id="question"
              name="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y h-24"
              placeholder="e.g., What's a good skincare routine for oily skin?"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 w-full"
            disabled={loading}
          >
            {loading ? 'Asking AI...' : 'Ask AI Advisor'}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {answer && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg relative mt-6">
            <h3 className="font-bold mb-2">AI Advisor's Answer:</h3>
            <p className="whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        <p className="text-center text-gray-600 text-sm mt-6">
          <Link to="/logout" className="text-red-500 hover:text-red-700 font-bold">
            Logout
          </Link> (Logout functionality not yet implemented, but you can add it later)
        </p>
      </div>
    </div>
  );
}

export default BeautyAdvisor;
