import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f0f0f0] min-h-screen font-sans text-nb-black selection:bg-nb-yellow">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b-5 border-nb-black sticky top-0 z-[100] shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <span className="text-3xl filter drop-shadow-[2px_2px_0px_black]">📚</span>
          <span className="text-xl font-black uppercase tracking-tighter italic">BrightMinds Tuition</span>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/login")} className="bg-white">Login</Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/register")}>Register</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-24 pb-16 max-w-[900px] mx-auto text-center">
        <div className="inline-block bg-nb-blue border-2 border-nb-black px-4 py-1 font-bold text-xs uppercase tracking-widest mb-8 shadow-[3px_3px_0px_black]">
          Trusted by 500+ students
        </div>
        <h1 className="text-6xl md:text-7xl font-black uppercase leading-[0.9] mb-8 tracking-tighter">
          Shaping Futures,<br />
          <span className="text-nb-pink drop-shadow-[4px_4px_0px_black] [-webkit-text-stroke:2px_black]">One Student at a Time</span>
        </h1>
        <p className="text-lg font-bold text-nb-black/70 mb-12 max-w-[650px] mx-auto border-l-5 border-nb-yellow pl-6 text-left">
          Quality education, personalised attention, and a nurturing environment — helping students
          excel academically and grow with confidence.
        </p>
        <div className="flex gap-6 justify-center flex-wrap">
          <Button variant="primary" size="lg" onClick={() => navigate("/register")} className="!px-10 !text-xl uppercase tracking-widest">Get Started</Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/login")} className="bg-white !px-10 !text-xl uppercase tracking-widest">Dashboard</Button>
        </div>
      </section>

      {/* Stats */}
      <section className="flex justify-center gap-0 bg-nb-black py-16 flex-wrap border-y-5 border-nb-black">
        {[
          { number: "500+", label: "Students Enrolled", color: "text-nb-yellow" },
          { number: "10+", label: "Years of Experience", color: "text-nb-pink" },
          { number: "95%", label: "Pass Rate", color: "text-nb-blue" },
          { number: "20+", label: "Subjects Covered", color: "text-nb-green" },
        ].map((s) => (
          <div key={s.label} className="text-center px-12 py-6 border-r-2 border-white/20 last:border-r-0">
            <div className={`text-5xl font-black mb-2 ${s.color}`}>{s.number}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/60">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Our Story */}
      <section className="px-8 py-24 max-w-[1240px] mx-auto">
        <h2 className="text-center mb-2">Our Story</h2>
        <p className="text-center font-bold uppercase tracking-widest text-nb-black/50 mb-16 italic">How BrightMinds began</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { year: "2014", title: "The Beginning", text: "BrightMinds Tuition started in a small room with just 5 students and a single teacher who believed every child deserves personalised attention.", color: "bg-nb-yellow" },
            { year: "2018", title: "Growing Together", text: "Word spread quickly. Parents trusted us because they saw results. We expanded to multiple classrooms and brought in subject experts.", color: "bg-nb-pink" },
            { year: "Today", title: "A Community", text: "Today, BrightMinds is more than a tuition centre — it's a community of 500+ students excelling with care and dedication.", color: "bg-nb-blue" },
          ].map((story) => (
            <div key={story.year} className="nb-card hover:-translate-y-2 transition-transform">
              <div className={`${story.color} border-2 border-nb-black px-3 py-1 font-bold text-xs uppercase inline-block mb-4 shadow-[2px_2px_0px_black]`}>
                {story.year}
              </div>
              <h3 className="text-xl font-black uppercase mb-4 tracking-tight">{story.title}</h3>
              <p className="font-medium text-nb-black/80 leading-relaxed italic">{story.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-white border-y-5 border-nb-black py-24">
        <div className="px-8 max-w-[1240px] mx-auto">
          <h2 className="text-center mb-2">Why Choose Us</h2>
          <p className="text-center font-bold uppercase tracking-widest text-nb-black/50 mb-16 italic">What makes BrightMinds different</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🎯", title: "Personalised Attention", desc: "Small batch sizes ensure every student gets the focus they deserve, not lost in a crowd.", color: "bg-nb-yellow/10" },
              { icon: "📊", title: "Progress Tracking", desc: "Parents stay informed with regular updates, tests, and detailed progress reports.", color: "bg-nb-pink/10" },
              { icon: "👩‍🏫", title: "Expert Teachers", desc: "Our teachers are subject experts with years of experience making complex topics simple.", color: "bg-nb-blue/10" },
              { icon: "🏆", title: "Proven Results", desc: "95% of our students show significant grade improvement within the first semester.", color: "bg-nb-green/10" },
              { icon: "📅", title: "Flexible Schedules", desc: "Morning and evening batches to fit every student's school timetable and routine.", color: "bg-nb-yellow/10" },
              { icon: "💬", title: "Doubt Sessions", desc: "Dedicated doubt-clearing sessions so no student ever feels stuck or left behind.", color: "bg-nb-pink/10" },
            ].map((f) => (
              <div key={f.title} className={`nb-card ${f.color} hover:rotate-1 transition-transform cursor-pointer`}>
                <div className="text-4xl mb-4 filter drop-shadow-[2px_2px_0px_black]">{f.icon}</div>
                <h3 className="text-lg font-black uppercase mb-2 tracking-tight">{f.title}</h3>
                <p className="font-medium text-nb-black/70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-nb-pink py-24 text-center border-b-5 border-nb-black shadow-[inset_0_8px_0_0_rgba(0,0,0,0.1)]">
        <div className="px-8 max-w-[800px] mx-auto">
          <h2 className="text-5xl font-black uppercase text-white mb-6 drop-shadow-[1px_1px_0px_black] [-webkit-text-stroke:1px_black]">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl font-bold text-white mb-10 uppercase tracking-widest leading-tight">
            Join hundreds of students who are already excelling with BrightMinds.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Button variant="primary" size="lg" onClick={() => navigate("/register")} className="!px-12 !text-xl bg-nb-yellow hover:bg-yellow-400">Register Now</Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/login")} className="bg-white !px-12 !text-xl">Login</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-nb-black py-8 text-center border-t-2 border-white/10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">© 2024 BrightMinds Tuition. All rights reserved.</p>
      </footer>
    </div>
  );
}

