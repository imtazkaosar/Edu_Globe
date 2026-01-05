import React from "react";
import Logo from "./Logo";
import { Mail, Phone, MapPin, Users, BookOpen, Globe2 } from "lucide-react";
import { useSelector } from "react-redux";

const Footer = () => {
  const user = useSelector((state) => state.user?.user);
  const enrolledCourses = useSelector((state) => state.enrollments?.list || []);
  const completedCourses = enrolledCourses.filter(c => c.status === 'completed').length;

  return (
    <footer className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About Us Section */}
          <div className="space-y-4">
            <div className="mb-4">
              <Logo w={160} h={50} />
            </div>
            <h3 className="text-lg font-semibold text-white">About Us</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our mission is to empower learners with the knowledge and skills they need to achieve their goals and succeed in an ever-changing world.
            </p>
            {user && (
              <div className="pt-2 space-y-1">
                <p className="text-emerald-400 text-sm font-medium">Your Progress</p>
                <p className="text-slate-300 text-xs">
                  {enrolledCourses.length} courses enrolled 
                </p>
              </div>
            )}
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2">
                  <BookOpen size={16} />
                  Browse Courses
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2">
                  <Globe2 size={16} />
                  Study Abroad
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2">
                  <Users size={16} />
                  Find Instructors
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Email</p>
                  <a href="mailto:support@eduglobe.com" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm">
                    support@eduglobe.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Phone</p>
                  <a href="tel:+8801234567890" className="text-slate-300 hover:text-emerald-400 transition-colors text-sm">
                    +880 1234567890
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Address</p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    EduGlobe HQ, 123 Learning Avenue, Brac U, Dhaka
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Partner With Us Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Partner With Us</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Collaborate with us to share your expertise and reach global learners.
            </p>
            <div className="space-y-2 pt-2">
              <a 
                href="mailto:partners@eduglobe.com" 
                className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Mail size={16} />
                partners@eduglobe.com
              </a>
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm mt-3">
                Become an Instructor
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} EduGlobe. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-slate-400 text-xs">Platform Active · Server Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer