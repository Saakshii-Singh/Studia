import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero.jpg";
import featurePeer from "../assets/feature-peer.jpg";
import featureCommunity from "../assets/feature-community.jpg";
import featureGamify from "../assets/feature-gamify.jpg";

const stats = [
  { num: "1M+", label: "community members" },
  { num: "19M+", label: "study sessions" },
  { num: "4M+", label: "study goals reached" },
  { num: "215", label: "countries" },
  { num: "4.8/5", label: "positive reviews" },
];

const discover = [
  { title: "Own Study Universe", desc: "Create your very own study room with atmospheric backgrounds, personal timers, and goals.", emoji: "🌌" },
  { title: "Group Study Rooms", desc: "Join motivated students from all over the world to boost your productivity and find your study flow.", emoji: "👥" },
  { title: "Free Tutor Help!", desc: "Feeling stuck? Just raise your hand and one of our expert community tutors will jump in and help.", emoji: "🙋" },
  { title: "Mindfulness", desc: "Balance is crucial – check out our mindfulness exercises to give your mind a breather.", emoji: "🧘" },
  { title: "Community Events", desc: "Our live events tackle everything from productivity courses to career advice.", emoji: "🎉" },
  { title: "Study Stats", desc: "See your progress every day in your Stats and on the community leaderboard.", emoji: "📊" },
];

const features = [
  {
    title: 'The "good" kind of peer pressure',
    desc: "You know how your parents always say peer pressure is bad? Well… when it comes to studying, they're wrong. Studying with peers helps you get better grades — and that's scientifically proven.",
    img: featurePeer,
    icon: "⏱️",
  },
  {
    title: "24/7 support, all year round",
    desc: "Find a study buddy (or a procrastinate-mate), access exclusive boot camps, chat with tutors, or ask for community help. When you need a break, take a 5 min guided mindfulness session.",
    img: featureCommunity,
    icon: "💜",
  },
  {
    title: "Studying, reloaded",
    desc: "Let's be honest, any task is more fun when you know there's a reward at the end of it. We'll track your progress and gamify your study sessions – all you have to do is set session goals, start the timer and you'll get rewarded.",
    img: featureGamify,
    icon: "🏆",
  },
];

const testimonials = [
  { title: "Awesome Community", body: "As a chronic procrastinator, this community really helps me motivate myself to get my homework done. Cool leaderboards, timers, and study tips." },
  { title: "Productivity Booster", body: "I have never been so focused and productive when studying by myself before. I can study with someone basically 24/7. 💜 Thanks Studia!" },
  { title: "Goals", body: "I've noticed how it's improved my ability to stay focused. Since everyone is also studying in the call, I feel obliged to stay on task as well." },
  { title: "The level system is pog", body: "The VC level system keeps me motivated — the more time spent studying, the more levels you gain. 10/10 would recommend." },
  { title: "Studia is great", body: "Studia is perfect. It gives me a purpose and before this I did not study a lot — now I do. Thanks Studia." },
  { title: "Thank you", body: "Yesterday I completed my one year in this community. So many study hours without even noticing them, just because I was focused with my study pals!" },
];

const universities = ["MIT", "Harvard", "Stanford", "Yale", "Princeton", "Oxford", "Cambridge", "IIT Bombay", "NUS", "TU Delft", "LMU München", "King's College"];

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
      <Stats />
      <Discover />
      <Features />
      <Testimonials />
      <Universities />
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
          <a href="#about" className="hover:text-white">About</a>
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
            Meet, chat, and study with students from all over the world 🌎
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
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-2xl">
                {d.emoji}
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
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-2xl">
                  {f.icon}
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

function Testimonials() {
  return (
    <section id="events" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-extrabold md:text-5xl text-white font-display">
          Don't just take our word for it
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          Studying online in a focus room with friends and strangers is a game-changer for millions of students all over the world.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.title} className="rounded-3xl bg-accent/40 p-7">
              <div className="text-2xl">💜</div>
              <h3 className="mt-3 font-bold text-white">{t.title}</h3>
              <p className="mt-3 text-sm text-foreground/80">"{t.body}"</p>
            </div>
          ))}
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
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white">📚</div>
          <span className="font-bold text-foreground">Studia</span>
        </div>
        <p>© {new Date().getFullYear()} Studia. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="mailto:contact@studiatogether.com" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}