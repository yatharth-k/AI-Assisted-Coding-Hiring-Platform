import React from 'react';
import { Mail, Phone, MapPin, Linkedin, FileText, Send } from 'lucide-react';

const contactInfo = [
  {
    icon: <MapPin className="text-cyan-400" size={24} aria-label="Location" />,
    label: "Location",
    value: "India",
    link: null
  },
  {
    icon: <Mail className="text-cyan-400" size={24} aria-label="Email" />,
    label: "Email",
    value: "yatharth00kherodia@gmail.com",
    link: "mailto:yatharth00kherodia@gmail.com"
  },
  {
    icon: <Phone className="text-cyan-400" size={24} aria-label="Phone" />,
    label: "Phone",
    value: "+91-7023733199",
    link: "tel:+917023733199"
  },
  {
    icon: <Linkedin className="text-cyan-400" size={24} aria-label="LinkedIn" />,
    label: "LinkedIn",
    value: "linkedin.com/in/yatharth-kherodia-44b868184",
    link: "https://linkedin.com/in/yatharth-kherodia-44b868184"
  }
];

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Get In Touch</h2>
          <div className="w-24 h-1 bg-cyan-400 mx-auto mb-4"></div>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            I'm always open to discussing new opportunities, innovative projects, or potential collaborations. Let's connect!
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-800/60 to-indigo-700/40 p-8 rounded-2xl shadow-2xl border border-indigo-700/30">
              <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="bg-cyan-400/10 p-3 rounded-lg">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm text-indigo-300 font-medium">{info.label}</p>
                      {info.link ? (
                        <a
                          href={info.link}
                          target={info.link.startsWith('http') ? '_blank' : undefined}
                          rel={info.link && info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-white hover:text-cyan-400 transition-colors font-medium"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-white font-medium">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-indigo-700/30">
                <button className="w-full flex items-center justify-center gap-3 bg-cyan-400 text-indigo-900 px-6 py-3 rounded-lg hover:bg-cyan-300 transition-all hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2">
                  <FileText size={20} aria-label="Download Resume" />
                  Download Resume
                </button>
              </div>
            </div>
          </div>
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-indigo-800/60 to-indigo-700/40 p-8 rounded-2xl shadow-2xl border border-indigo-700/30">
            <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-indigo-200 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full px-4 py-3 border border-indigo-700/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all bg-indigo-900/30 text-white"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-indigo-200 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full px-4 py-3 border border-indigo-700/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all bg-indigo-900/30 text-white"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-indigo-700/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all bg-indigo-900/30 text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-indigo-200 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 border border-indigo-700/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all bg-indigo-900/30 text-white"
                  placeholder="Project Discussion"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-indigo-200 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-indigo-700/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all bg-indigo-900/30 text-white resize-none"
                  placeholder="Tell me about your project or opportunity..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-indigo-900 text-cyan-400 px-6 py-3 rounded-lg hover:bg-indigo-800 transition-all hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
              >
                <Send size={20} aria-label="Send Message" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact; 