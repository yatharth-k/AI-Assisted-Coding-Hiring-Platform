import React from 'react';
import { Rocket } from 'lucide-react';

const Career = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] py-20 bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 backdrop-blur-md">
      <div className="bg-gradient-to-br from-indigo-800/60 to-indigo-700/40 p-10 rounded-2xl shadow-2xl border border-indigo-700/30 flex flex-col items-center">
        <Rocket className="text-cyan-400 animate-bounce mb-4" size={48} aria-label="Coming Soon" />
        <h2 className="text-3xl font-bold text-white mb-2">Careers</h2>
        <p className="text-lg text-indigo-100 mb-4">We're working on something exciting!<br />Career opportunities coming soon.</p>
        <span className="inline-block bg-cyan-400/10 text-cyan-300 px-4 py-2 rounded-full font-medium">Stay tuned!</span>
      </div>
    </section>
  );
};

export default Career; 