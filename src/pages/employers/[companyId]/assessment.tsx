import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const companies = [
  {
    id: "1",
    name: "TechNova Solutions",
    question: "What is the time complexity of binary search?"
  },
  {
    id: "2",
    name: "FinEdge Analytics",
    question: "Explain the difference between supervised and unsupervised learning."
  },
  {
    id: "3",
    name: "HealthSync Systems",
    question: "How would you design a scalable REST API for patient records?"
  },
  {
    id: "4",
    name: "EduCore Labs",
    question: "Describe a method to detect plagiarism in code submissions."
  },
  {
    id: "5",
    name: "GreenGrid Energy",
    question: "How would you optimize energy consumption in IoT devices?"
  },
  {
    id: "6",
    name: "RetailXpert",
    question: "What database schema would you use for an e-commerce inventory system?"
  },
  {
    id: "7",
    name: "AutoMinds AI",
    question: "Explain the concept of reinforcement learning with an example."
  },
  {
    id: "8",
    name: "SecureNet",
    question: "How would you implement two-factor authentication in a web app?"
  },
  {
    id: "9",
    name: "AgroVision",
    question: "Design a sensor network for monitoring soil moisture in real time."
  },
  {
    id: "10",
    name: "UrbanMove Logistics",
    question: "How would you route delivery vehicles to minimize total travel time?"
  }
];

export default function CompanyAssessment() {
  const { companyId } = useParams<{ companyId: string }>();
  const company = useMemo(() => companies.find(c => c.id === companyId), [companyId]);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!company) return <div className="p-8 text-center text-xl">Company not found.</div>;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2 text-purple-700">{company.name}</h1>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Assessment Question</h2>
        <p className="text-gray-700 mb-6">{company.question}</p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] mb-4"
          placeholder="Write your answer here..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={submitted}
        />
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          onClick={() => setSubmitted(true)}
          disabled={submitted || !answer.trim()}
        >
          {submitted ? "Submitted!" : "Submit Answer"}
        </button>
        {submitted && <div className="mt-4 text-green-600 font-semibold">Your answer has been submitted.</div>}
      </div>
    </div>
  );
} 