import React from "react";
import { useNavigate } from "react-router-dom";

const companies = [
  {
    id: "1",
    name: "TechNova Solutions",
    description: "Innovative software solutions for modern businesses.",
    question: "What is the time complexity of binary search?"
  },
  {
    id: "2",
    name: "FinEdge Analytics",
    description: "Cutting-edge analytics for the finance sector.",
    question: "Explain the difference between supervised and unsupervised learning."
  },
  {
    id: "3",
    name: "HealthSync Systems",
    description: "Healthcare data integration and management.",
    question: "How would you design a scalable REST API for patient records?"
  },
  {
    id: "4",
    name: "EduCore Labs",
    description: "Revolutionizing education with technology.",
    question: "Describe a method to detect plagiarism in code submissions."
  },
  {
    id: "5",
    name: "GreenGrid Energy",
    description: "Smart solutions for sustainable energy.",
    question: "How would you optimize energy consumption in IoT devices?"
  },
  {
    id: "6",
    name: "RetailXpert",
    description: "Next-gen retail analytics and automation.",
    question: "What database schema would you use for an e-commerce inventory system?"
  },
  {
    id: "7",
    name: "AutoMinds AI",
    description: "AI-driven automation for manufacturing.",
    question: "Explain the concept of reinforcement learning with an example."
  },
  {
    id: "8",
    name: "SecureNet",
    description: "Cybersecurity solutions for enterprises.",
    question: "How would you implement two-factor authentication in a web app?"
  },
  {
    id: "9",
    name: "AgroVision",
    description: "Smart agriculture and farm management tools.",
    question: "Design a sensor network for monitoring soil moisture in real time."
  },
  {
    id: "10",
    name: "UrbanMove Logistics",
    description: "Logistics and supply chain optimization for urban areas.",
    question: "How would you route delivery vehicles to minimize total travel time?"
  }
];

export default function Employers() {
  const navigate = useNavigate();
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Employers & Job Assessments</h1>
      <div className="grid grid-cols-1 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{company.name}</h2>
              <p className="text-gray-600 mt-1 mb-2">{company.description}</p>
            </div>
            <button
              className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              onClick={() => navigate(`/employers/${company.id}/assessment`)}
            >
              Assessment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 