import React from 'react';
import { GraduationCap, MapPin, Calendar } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">About Me</h2>
          <div className="w-24 h-1 bg-cyan-400 mx-auto"></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-indigo-100 leading-relaxed">
              I'm a Computer Science and Engineering student at VIT Chennai specializing in AI & Robotics, now in my final year. My academic foundation lies in Data Structures, Algorithms, Java programming, and control systems.
            </p>
            <p className="text-lg text-indigo-100 leading-relaxed">
              I'm passionate about building automation, integrating software and hardware, and solving real-world problems through innovative engineering. My projects span from web applications to IoT systems and robotic control systems.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-cyan-400/10 px-4 py-2 rounded-full">
                <span className="text-cyan-300 font-medium">Problem Solving</span>
              </div>
              <div className="bg-cyan-400/10 px-4 py-2 rounded-full">
                <span className="text-cyan-300 font-medium">Innovation</span>
              </div>
              <div className="bg-cyan-400/10 px-4 py-2 rounded-full">
                <span className="text-cyan-300 font-medium">Automation</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-800/60 to-indigo-700/40 p-8 rounded-2xl shadow-2xl border border-indigo-700/30">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="text-cyan-400" size={32} aria-label="Graduation Cap" />
              <h3 className="text-2xl font-bold text-white">Education</h3>
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-white">Vellore Institute of Technology (VIT), Chennai</h4>
              <p className="text-lg text-indigo-100">B.Tech in CSE with specialization in AI & Robotics</p>
              <div className="flex items-center gap-4 text-indigo-300">
                <div className="flex items-center gap-2">
                  <Calendar size={16} aria-label="Calendar" />
                  <span>Expected Graduation: July 2026</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-indigo-300">
                <MapPin size={16} aria-label="Location" />
                <span>Chennai, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 