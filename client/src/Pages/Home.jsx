import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronDown, Globe, Users, GraduationCap, Heart, Calendar, BarChart2, Timer, Trophy } from "lucide-react";
import heroImg from "../assets/hero.jpg";
import featurePeer from "../assets/feature-peer.jpg";
import featureCommunity from "../assets/feature-community.jpg";
import featureGamify from "../assets/feature-gamify.jpg";


const discover = [
  { title: "Own Study Universe", desc: "Create your very own study room with atmospheric backgrounds, personal timers, and goals.", icon: Globe },
  { title: "Group Study Rooms", desc: "Join motivated students from all over the world to boost your productivity and find your study flow.", icon: Users },
  { title: "Free Tutor Help!", desc: "Feeling stuck? Just raise your hand and one of our expert community tutors will jump in and help.", icon: GraduationCap },
  { title: "Mindfulness", desc: "Balance is crucial – check out our mindfulness exercises to give your mind a breather.", icon: Heart },
  { title: "Community Events", desc: "Our live events tackle everything from productivity courses to career advice.", icon: Calendar },
  { title: "Study Stats", desc: "See your progress every day in your Stats and on the community leaderboard.", icon: BarChart2 },
];
const features = [
  {
    title: 'The "good" kind of peer pressure',
    desc: "You know how your parents always say peer pressure is bad? Well… when it comes to studying, they're wrong. Studying with peers helps you get better grades — and that's scientifically proven.",
    img: featurePeer,
    icon: Timer,
  },
  {
    title: "24/7 support, all year round",
    desc: "Find a study buddy (or a procrastinate-mate), access exclusive boot camps, chat with tutors, or ask for community help. When you need a break, take a 5 min guided mindfulness session.",
    img: featureCommunity,
    icon: Heart,
  },
  {
    title: "Studying, reloaded",
    desc: "Let's be honest, any task is more fun when you know there's a reward at the end of it. We'll track your progress and gamify your study sessions – all you have to do is set session goals, start the timer and you'll get rewarded.",
    img: featureGamify,
    icon: Trophy,
  },
];

const faqs = [
  {
    question: "What is Studia and how does it work?",
    answer: "Studia is a real-time virtual co-studying space. You can join live focus rooms, study alongside peers from around the world, manage tasks with our integrated planner, and block out distractions using custom ambient sounds."
  },
  {
    question: "How does the Deep Focus Lock (Lockdown Mode) work?",
    answer: "When enabled, the Deep Focus Lock triggers browser fullscreen mode and monitors tab visibility. If you switch tabs, exit fullscreen, or navigate away, the timer automatically pauses, a warning chime sounds, and you lose 10 XP as a distraction penalty."
  },
  {
    question: "How do I earn Experience Points (XP) and level up?",
    answer: "For every minute you successfully study with the Pomodoro timer, you earn 10 XP. Accumulating XP automatically promotes your scholar rank (e.g., from Level 1 Novice to higher levels) which syncs to your profile."
  },
  {
    question: "Are the ambient sounds and focus timer synchronized?",
    answer: "Yes! The Pomodoro timer is synchronized in real-time using WebSockets so everyone in the room studies and breaks together. The ambient soundboard, however, is controlled individually so you can mix your own custom soundscape."
  },
  {
    question: "Is Studia free to use?",
    answer: "Yes, Studia is 100% free to use. All core features—including synchronized rooms, local ambient tracks, progress tracking, and scholar levels—are available to all students."
  }
];

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav user={user} />
      <Hero />
      <Discover />
      <Features />
      <FAQSection />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav({ user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 relative">
        <Link to="/" className="flex items-center group">
          <span className="font-extrabold tracking-wider text-xl text-white group-hover:text-primary transition-colors font-display">
            Studia
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/90 md:flex">
          <a href="#how" className="hover:text-white">How Studia Works</a>
          <a href="#discover" className="hover:text-white">Design a Study Universe</a>
          <a href="#events" className="hover:text-white">Community events</a>
        </nav>
        {user ? (
          <div className="relative">
            {/* Clickable Initial Avatar Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-10 w-10 rounded-xl bg-gradient-neon uppercase font-extrabold text-xs flex items-center justify-center text-white shadow-glow hover:scale-105 active:scale-95 transition-all border border-white/20 cursor-pointer"
            >
              {user.username ? user.username.slice(0, 2) : "US"}
            </button>

            {/* Interactive Profile Dropdown Card */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-card border border-border p-5 shadow-glow z-50 text-left backdrop-blur-lg bg-card/95 flex flex-col gap-4">
                {/* User avatar & Username */}
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-neon uppercase font-extrabold text-sm flex items-center justify-center text-white shadow-soft">
                    {user.username ? user.username.slice(0, 2) : "US"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate lowercase">
                      {user.username}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-black text-accent mt-0.5">
                      Level {user.level || 1} Scholar
                    </span>
                  </div>
                </div>

                <div className="h-[1px] bg-white/10 w-full"></div>

                {/* Profile Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                    <span className="text-[8px] uppercase tracking-widest font-black text-muted-foreground block">EXP</span>
                    <span className="text-xs font-extrabold text-white">{user.experience || 0}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                    <span className="text-[8px] uppercase tracking-widest font-black text-muted-foreground block">Streak</span>
                    <span className="text-xs font-extrabold text-white">{user.studyStreak || 0} Days</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl col-span-2">
                    <span className="text-[8px] uppercase tracking-widest font-black text-muted-foreground block">Total Study Time</span>
                    <span className="text-xs font-extrabold text-white">{user.totalStudyTime || 0} Mins</span>
                  </div>
                </div>

                <div className="h-[1px] bg-white/10 w-full"></div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Link
                    to="/dashboard"
                    className="w-full text-center py-2.5 rounded-xl bg-gradient-primary text-xs font-bold text-white shadow-soft hover:shadow-glow active:scale-95 transition-all"
                  >
                    Go To Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.dispatchEvent(new Event("hh_login_state_change"));
                      window.location.reload();
                    }}
                    className="w-full py-2 text-[10px] uppercase tracking-widest font-black text-white/60 hover:text-red-400 transition-colors cursor-pointer rounded-xl bg-white/5 border border-white/10 hover:border-red-500/20"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 animate-pulse"
          >
            Login / Signup
          </Link>
        )}
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={heroImg}
        alt="Students studying together over video call"
        width={1920}
        height={1080}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-secondary/70 via-secondary/40 to-primary/50" />
      <div className="mx-auto max-w-7xl px-6 pt-40 pb-32 md:pt-48 md:pb-44">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl text-white font-display">
            Meet, chat, and study with students from all over the world 
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/90">
            Join the largest global student community online on Studia and say goodbye to lack of motivation.
          </p>
          <Link
            to="/dashboard"
            className="mt-10 inline-flex rounded-full bg-white px-8 py-4 text-base font-bold text-primary shadow-xl transition hover:scale-[1.02] text-primary"
          >
            Enter Studia now
          </Link>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="bg-accent/40 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mx-auto max-w-3xl text-center text-2xl font-bold md:text-3xl text-white">
          Our <span className="text-secondary">student community</span> is{" "}
          <span className="text-primary">more than one million</span> strong (and this is just the beginning)
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-secondary md:text-4xl">{s.num}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Discover() {
  return (
    <section id="discover" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-extrabold md:text-5xl text-white font-display">Discover Studia</h2>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {discover.map((d) => (
            <div
              key={d.title}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
                           <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white shadow-soft">
                <d.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">{d.title}</h3>
              <p className="mt-3 text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/dashboard"
            className="inline-flex rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110"
          >
            Ready? Try it out!
          </Link>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="how" className="bg-gradient-to-b from-accent/30 to-transparent py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-secondary">
          The benefits of studying online
        </p>
        <h2 className="mt-3 text-center text-3xl font-extrabold md:text-5xl text-white">
          "Just" a study room? Think again!
        </h2>
        <div className="mt-20 space-y-24">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`grid items-center gap-12 md:grid-cols-2 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white shadow-soft">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-extrabold md:text-3xl text-white">{f.title}</h3>
                <p className="mt-4 text-lg text-muted-foreground">{f.desc}</p>
                <Link to="/dashboard" className="mt-6 inline-flex font-semibold text-primary hover:underline">
                  Learn more →
                </Link>
              </div>
              <img
                src={f.img}
                alt={f.title}
                loading="lazy"
                width={1200}
                height={900}
                className="rounded-3xl shadow-xl"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-accent">
          Questions & Answers
        </p>
        <h2 className="mt-3 text-center text-3xl font-extrabold md:text-5xl text-white font-display tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground leading-relaxed">
          Everything you need to know about the Studia co-studying sanctum and focus tools.
        </p>
        
        {/* Accordion List */}
        <div className="mt-14 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-accent/10 border border-accent/20 overflow-hidden transition-all duration-300 hover:border-accent/40 shadow-soft"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer transition-colors bg-accent/5 hover:bg-accent/10"
                >
                  <span className="text-sm font-bold text-white tracking-wide">{faq.question}</span>
                  <ChevronDown 
                    className={`h-4.5 w-4.5 text-accent transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                  />
                </button>
                
                {/* Collapsible Content */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[300px] border-t border-accent/15 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <p className="px-6 py-5 text-xs text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Universities() {
  return (
    <section id="about" className="bg-muted py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-2xl font-extrabold md:text-3xl text-white">
          Meet fellow students from all over the world
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-6 text-center text-sm font-semibold text-muted-foreground sm:grid-cols-3 md:grid-cols-6">
          {universities.map((u) => (
            <div
              key={u}
              className="rounded-xl bg-card px-4 py-5 shadow-sm transition hover:shadow-md text-white"
            >
              {u}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="join" className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-secondary via-secondary/80 to-primary" />
      <div className="mx-auto max-w-3xl px-6 text-center text-white">
        <h2 className="text-3xl font-extrabold md:text-5xl text-white">
          What are you waiting for? Join the study team!
        </h2>
        <p className="mt-5 text-lg text-white/90">
          Free to start. Find your community, set goals, achieve them, and get rewarded.
        </p>
        <Link
          to="/login"
          className="mt-10 inline-flex rounded-full bg-white px-10 py-4 text-base font-bold text-primary shadow-xl transition hover:scale-[1.02] text-primary"
        >
          Create your free account
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  const [copied, setCopied] = useState(false);

  const handleContactClick = () => {
    // Copy your email address to the clipboard
    navigator.clipboard.writeText("rajnibala.singh8423@gmail.com");
    setCopied(true);
    // Hide the tooltip after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground">Studia</span>
        </div>
        <p>© {new Date().getFullYear()} Studia. All rights reserved.</p>
        <div className="flex gap-5 items-center">
          <div className="relative">
            <a 
              href="mailto:rajnibala.singh8423@gmail.com" 
              onClick={handleContactClick}
              className="hover:text-foreground transition-colors cursor-pointer relative"
            >
              Contact
            </a>
            {copied && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-white text-xs px-2.5 py-1.5 rounded-xl shadow-glow whitespace-nowrap z-50">
                Email copied to clipboard! 📋
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}