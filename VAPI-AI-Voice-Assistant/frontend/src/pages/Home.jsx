import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="main-bg">
      <header className="main-header">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src="assets/orange.png" alt="Orange Maroc Logo" className="main-logo" />
          <div className="main-header-title">Orange Maroc Digital Center</div>
        </div>
        <div className="main-header-actions">
          <button className="button" onClick={() => navigate("/login")}>Login</button>
          <button className="button" onClick={() => navigate("/register")}>Register</button>
        </div>
      </header>
      <main className="main-content">
        <section className="intro-section">
          <h1>Welcome to Orange Maroc AI Recruitment Platform</h1>
          <p>
            Orange Maroc is committed to innovation and excellence in digital transformation. Our platform offers candidates a unique opportunity to experience AI-driven interviews and explore a variety of professional courses designed to boost your career in the digital world.
          </p>
        </section>
        {/* Visual showcase section */}
        <section className="visual-showcase">
          <div className="visual-cards">
            <div className="visual-card">
              <img src="/assets/digital_future.jpg" alt="Orange Maroc" />
              <p>Empowering Morocco's digital future</p>
            </div>
            <div className="visual-card">
              <img src="/assets/ai_assistant.jpg" alt="AI Interview" />
              <p>Experience AI-driven interviews</p>
            </div>
            <div className="visual-card">
              <img src="/assets/courses.jpg" alt="Courses" />
              <p>Explore our professional courses</p>
            </div>
          </div>
        </section>
        <section className="courses-section">
          <h2>Our Courses</h2>
          <ul className="courses-list">
            <li><b>AI & Data Science</b> – Learn the fundamentals of artificial intelligence, machine learning, and data analysis.</li>
            <li><b>Cloud Computing</b> – Master cloud platforms and deployment strategies for modern businesses.</li>
            <li><b>Cybersecurity</b> – Understand the essentials of protecting digital assets and privacy.</li>
            <li><b>Telecom & Networks</b> – Dive into the world of telecommunications and next-gen network technologies.</li>
            <li><b>Soft Skills</b> – Develop communication, teamwork, and leadership skills for the digital era.</li>
          </ul>
        </section>
        {/* visual section */}
        <section className="visual-showcase">
          <div className="visual-cards">
            <div className="visual-card">
              <img src="/assets/team_work.jpg" alt="Teamwork" />
              <p>Collaborate and grow with Orange Maroc</p>
            </div>
            <div className="visual-card">
              <img src="/assets/innovation.jpg" alt="Innovation" />
              <p>Innovate for a better tomorrow</p>
            </div>
          </div>
        </section>
        <section className="about-section">
          <h2>About Orange Maroc</h2>
          <p>
            As a leader in the Moroccan telecom sector, Orange Maroc is dedicated to empowering youth and professionals with the skills needed for tomorrow's jobs. Our AI-powered recruitment and training platform is designed to make your journey engaging, fair, and insightful.
          </p>
        </section>
      </main>
      <footer className="main-footer">
        <div className="footer-links">
          <a href="#">Contact</a> | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
        </div>
        <div className="footer-copy">&copy; {new Date().getFullYear()} Orange Maroc. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Home;
