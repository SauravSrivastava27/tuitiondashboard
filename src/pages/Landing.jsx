import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <span style={styles.brandIcon}>📚</span>
          <span style={styles.brandName}>BrightMinds Tuition</span>
        </div>
        <div style={styles.navButtons}>
          <button onClick={() => navigate("/login")} style={styles.navLoginBtn}>Login</button>
          <button onClick={() => navigate("/register")} style={styles.navRegisterBtn}>Register</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>Trusted by 500+ students</div>
        <h1 style={styles.heroTitle}>
          Shaping Futures,<br />
          <span style={styles.heroAccent}>One Student at a Time</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Quality education, personalised attention, and a nurturing environment — helping students
          excel academically and grow with confidence.
        </p>
        <div style={styles.heroActions}>
          <button onClick={() => navigate("/register")} style={styles.primaryBtn}>Get Started</button>
          <button onClick={() => navigate("/login")} style={styles.outlineBtn}>Login to Dashboard</button>
        </div>
      </section>

      {/* Stats */}
      <section style={styles.statsRow}>
        {[
          { number: "500+", label: "Students Enrolled" },
          { number: "10+", label: "Years of Experience" },
          { number: "95%", label: "Pass Rate" },
          { number: "20+", label: "Subjects Covered" },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statNumber}>{s.number}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Our Story */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Story</h2>
        <p style={styles.sectionSubtitle}>How BrightMinds began</p>
        <div style={styles.storyGrid}>
          <div style={styles.storyCard}>
            <div style={styles.storyYear}>2014</div>
            <h3 style={styles.storyHeading}>The Beginning</h3>
            <p style={styles.storyText}>
              BrightMinds Tuition started in a small room with just 5 students and a single teacher
              who believed every child deserves personalised attention. Armed with a passion for
              teaching and a whiteboard, the journey began.
            </p>
          </div>
          <div style={styles.storyCard}>
            <div style={styles.storyYear}>2018</div>
            <h3 style={styles.storyHeading}>Growing Together</h3>
            <p style={styles.storyText}>
              Word spread quickly. Parents trusted us because they saw results. We expanded to
              multiple classrooms, brought in experienced teachers, and began covering classes from
              Grade 1 all the way through to Grade 12.
            </p>
          </div>
          <div style={styles.storyCard}>
            <div style={styles.storyYear}>Today</div>
            <h3 style={styles.storyHeading}>A Community</h3>
            <p style={styles.storyText}>
              Today, BrightMinds is more than a tuition centre — it's a community. Over 500 students
              trust us with their education, and we continue to deliver personalised, result-oriented
              coaching with care and dedication.
            </p>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section style={{ ...styles.section, backgroundColor: "#f8f7ff" }}>
        <h2 style={styles.sectionTitle}>Why Choose Us</h2>
        <p style={styles.sectionSubtitle}>What makes BrightMinds different</p>
        <div style={styles.featuresGrid}>
          {[
            { icon: "🎯", title: "Personalised Attention", desc: "Small batch sizes ensure every student gets the focus they deserve, not lost in a crowd." },
            { icon: "📊", title: "Regular Progress Tracking", desc: "Parents stay informed with regular updates, tests, and detailed progress reports." },
            { icon: "👩‍🏫", title: "Experienced Teachers", desc: "Our teachers are subject experts with years of experience making complex topics simple." },
            { icon: "🏆", title: "Proven Results", desc: "95% of our students show significant grade improvement within the first semester." },
            { icon: "📅", title: "Flexible Schedules", desc: "Morning and evening batches to fit every student's school timetable and routine." },
            { icon: "💬", title: "Doubt Sessions", desc: "Dedicated doubt-clearing sessions so no student ever feels stuck or left behind." },
          ].map((f) => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>What Parents Say</h2>
        <p style={styles.sectionSubtitle}>Real stories from our community</p>
        <div style={styles.testimonialsGrid}>
          {[
            { name: "Priya Sharma", role: "Parent of Class 10 student", text: "My daughter's marks improved from 55% to 88% in one year. The teachers here genuinely care about each child." },
            { name: "Rajesh Verma", role: "Parent of Class 8 student", text: "What I love most is the regular feedback. I always know how my son is doing without having to ask." },
            { name: "Sunita Patel", role: "Parent of Class 12 student", text: "My son cracked his boards with distinction. BrightMinds gave him the confidence and preparation he needed." },
          ].map((t) => (
            <div key={t.name} style={styles.testimonialCard}>
              <p style={styles.testimonialText}>"{t.text}"</p>
              <div style={styles.testimonialAuthor}>
                <div style={styles.authorAvatar}>{t.name[0]}</div>
                <div>
                  <div style={styles.authorName}>{t.name}</div>
                  <div style={styles.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Start Your Journey?</h2>
        <p style={styles.ctaSubtitle}>Join hundreds of students who are already excelling with BrightMinds.</p>
        <div style={styles.heroActions}>
          <button onClick={() => navigate("/register")} style={styles.primaryBtn}>Register Now</button>
          <button onClick={() => navigate("/login")} style={{ ...styles.outlineBtn, borderColor: "#fff", color: "#fff" }}>Admin Login</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2024 BrightMinds Tuition. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Segoe UI', Roboto, sans-serif", color: "#1a1a2e", backgroundColor: "#fff", minHeight: "100vh", textAlign: "left" },

  // Navbar
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #eee", backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 100 },
  navBrand: { display: "flex", alignItems: "center", gap: "10px" },
  brandIcon: { fontSize: "24px" },
  brandName: { fontSize: "18px", fontWeight: "700", color: "#4f46e5" },
  navButtons: { display: "flex", gap: "12px" },
  navLoginBtn: { padding: "8px 20px", border: "1px solid #4f46e5", borderRadius: "6px", backgroundColor: "transparent", color: "#4f46e5", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  navRegisterBtn: { padding: "8px 20px", border: "none", borderRadius: "6px", backgroundColor: "#4f46e5", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "14px" },

  // Hero
  hero: { padding: "80px 2rem 60px", maxWidth: "800px", margin: "0 auto", textAlign: "center" },
  heroBadge: { display: "inline-block", backgroundColor: "#ede9fe", color: "#4f46e5", padding: "6px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: "600", marginBottom: "24px" },
  heroTitle: { fontSize: "52px", fontWeight: "800", lineHeight: "1.15", margin: "0 0 20px", color: "#0f0a23" },
  heroAccent: { color: "#4f46e5" },
  heroSubtitle: { fontSize: "18px", color: "#555", lineHeight: "1.7", marginBottom: "36px", maxWidth: "600px", margin: "0 auto 36px" },
  heroActions: { display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" },
  primaryBtn: { padding: "14px 32px", backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  outlineBtn: { padding: "14px 32px", backgroundColor: "transparent", color: "#4f46e5", border: "2px solid #4f46e5", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },

  // Stats
  statsRow: { display: "flex", justifyContent: "center", gap: "0", backgroundColor: "#4f46e5", padding: "40px 2rem", flexWrap: "wrap" },
  statCard: { textAlign: "center", padding: "0 40px", borderRight: "1px solid rgba(255,255,255,0.2)" },
  statNumber: { fontSize: "40px", fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: "14px", color: "rgba(255,255,255,0.8)", marginTop: "4px" },

  // Sections
  section: { padding: "80px 2rem", maxWidth: "1200px", margin: "0 auto", width: "100%", boxSizing: "border-box" },
  sectionTitle: { fontSize: "36px", fontWeight: "800", textAlign: "center", margin: "0 0 8px", color: "#0f0a23" },
  sectionSubtitle: { textAlign: "center", color: "#888", marginBottom: "48px", fontSize: "16px" },

  // Story
  storyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" },
  storyCard: { padding: "32px", border: "1px solid #eee", borderRadius: "12px", position: "relative" },
  storyYear: { fontSize: "13px", fontWeight: "700", color: "#4f46e5", backgroundColor: "#ede9fe", display: "inline-block", padding: "4px 12px", borderRadius: "100px", marginBottom: "16px" },
  storyHeading: { fontSize: "20px", fontWeight: "700", margin: "0 0 12px", color: "#0f0a23" },
  storyText: { fontSize: "15px", color: "#666", lineHeight: "1.7", margin: 0 },

  // Features
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" },
  featureCard: { padding: "28px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  featureIcon: { fontSize: "32px", marginBottom: "14px" },
  featureTitle: { fontSize: "17px", fontWeight: "700", margin: "0 0 8px", color: "#0f0a23" },
  featureDesc: { fontSize: "14px", color: "#666", lineHeight: "1.7", margin: 0 },

  // Testimonials
  testimonialsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" },
  testimonialCard: { padding: "28px", border: "1px solid #eee", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "20px" },
  testimonialText: { fontSize: "15px", color: "#444", lineHeight: "1.75", fontStyle: "italic", margin: 0 },
  testimonialAuthor: { display: "flex", alignItems: "center", gap: "12px" },
  authorAvatar: { width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px", flexShrink: 0 },
  authorName: { fontWeight: "700", fontSize: "14px", color: "#0f0a23" },
  authorRole: { fontSize: "12px", color: "#888" },

  // CTA
  cta: { backgroundColor: "#4f46e5", padding: "80px 2rem", textAlign: "center" },
  ctaTitle: { fontSize: "36px", fontWeight: "800", color: "#fff", margin: "0 0 12px" },
  ctaSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: "16px", marginBottom: "36px" },

  // Footer
  footer: { backgroundColor: "#0f0a23", padding: "24px 2rem", textAlign: "center" },
  footerText: { color: "#888", fontSize: "14px", margin: 0 },
};
