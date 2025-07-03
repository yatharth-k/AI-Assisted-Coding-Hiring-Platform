import React from "react";
import { useNavigate } from "react-router-dom";
import { problems } from "@/data/problems";

const companies = [
  {
    id: "1",
    name: "TechNova Solutions",
    description: "Innovative software solutions for modern businesses.",
  },
  {
    id: "2",
    name: "FinEdge Analytics",
    description: "Cutting-edge analytics for the finance sector.",
  },
  {
    id: "3",
    name: "HealthSync Systems",
    description: "Healthcare data integration and management.",
  },
  {
    id: "4",
    name: "EduCore Labs",
    description: "Revolutionizing education with technology.",
  },
  {
    id: "5",
    name: "GreenGrid Energy",
    description: "Smart solutions for sustainable energy.",
  },
  {
    id: "6",
    name: "RetailXpert",
    description: "Next-gen retail analytics and automation.",
  },
  {
    id: "7",
    name: "AutoMinds AI",
    description: "AI-driven automation for manufacturing.",
  },
  {
    id: "8",
    name: "SecureNet",
    description: "Cybersecurity solutions for enterprises.",
  },
  {
    id: "9",
    name: "AgroVision",
    description: "Smart agriculture and farm management tools.",
  },
  {
    id: "10",
    name: "UrbanMove Logistics",
    description: "Logistics and supply chain optimization for urban areas.",
  }
];

export default function Employers() {
  const navigate = useNavigate();
  // Cycle through problems for each company
  const getProblemId = (idx: number) => {
    if (!problems.length) return 1;
    return problems[idx % problems.length].id;
  };
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">SkillUp Employers & Job Assessments</h1>
      <div className="grid grid-cols-1 gap-6">
        {companies.map((company, idx) => (
          <div key={company.id} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{company.name}</h2>
              <p className="text-gray-600 mt-1 mb-2">{company.description}</p>
            </div>
            <button
              className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              onClick={() => navigate(`/problems/${getProblemId(idx)}`)}
            >
              Assessment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 