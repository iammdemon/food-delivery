import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from '../utils/toast';
import API_BASE from '../api';

/* ── Scroll-reveal hook ─────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

/* ── Animated counter ───────────────────────────────────────────────── */
function Counter({ target, suffix = '', duration = 1800 }) {
    const [count, setCount] = useState(0);
    const [ref, visible] = useReveal(0.4);
    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(t); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(t);
    }, [visible, target, duration]);
    return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Typewriter ─────────────────────────────────────────────────────── */
const WORDS = ['রান্নার ঝামেলা', 'বাজারের দুশ্চিন্তা', 'অস্বাস্থ্যকর খাবার'];
function Typewriter() {
    const [idx, setIdx] = useState(0);
    const [text, setText] = useState('');
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const word = WORDS[idx];
        let timeout;
        if (!deleting && text.length < word.length) {
            timeout = setTimeout(() => setText(word.slice(0, text.length + 1)), 80);
        } else if (!deleting && text.length === word.length) {
            timeout = setTimeout(() => setDeleting(true), 1800);
        } else if (deleting && text.length > 0) {
            timeout = setTimeout(() => setText(text.slice(0, -1)), 45);
        } else if (deleting && text.length === 0) {
            setDeleting(false);
            setIdx(i => (i + 1) % WORDS.length);
        }
        return () => clearTimeout(timeout);
    }, [text, deleting, idx]);
    return (
        <span style={{ color: 'var(--primary)', display: 'inline-block', minWidth: '2ch' }}>
            {text}<span style={{ opacity: 0.7, animation: 'blink 0.9s step-end infinite' }}>|</span>
        </span>
    );
}

/* ── Reveal wrapper ─────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
    const [ref, visible] = useReveal();
    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
            ...style
        }}>
            {children}
        </div>
    );
}

/* ── Main component ─────────────────────────────────────────────────── */
const LandingPage = ({ onLoginClick }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', package: 'monthly' });
    const [showModal, setShowModal] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => { document.title = 'Easy Food — সেরা মিল ক্যাটারিং'; }, []);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        if (showModal) {
            document.body.style.top = `-${window.scrollY}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            const top = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(top || '0') * -1);
        }
        return () => { document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = ''; };
    }, [showModal]);

    const handleInputChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE}/subscriptions`, formData);
            if (res.status === 200 || res.status === 201) {
                toast.success(`ধন্যবাদ ${formData.name}! আপনার অনুরোধটি গ্রহণ করা হয়েছে।`);
                setShowModal(false);
                setFormData({ name: '', phone: '', package: 'monthly' });
            } else toast.error('দুঃখিত, অনুরোধটি পাঠানো সম্ভব হয়নি।');
        } catch { toast.error('সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে।'); }
    };

    const openModal = (pkg = 'monthly') => { setFormData(p => ({ ...p, package: pkg })); setShowModal(true); };
    const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const STATS = [
        { n: 500, s: '+', label: 'সন্তুষ্ট সদস্য' },
        { n: 30,  s: 'K+', label: 'মিল ডেলিভারি' },
        { n: 3,   s: ' বছর', label: 'অভিজ্ঞতা' },
        { n: 99,  s: '%', label: 'সন্তুষ্টির হার' },
    ];
    const HOW = [
        { step: '01', icon: '📦', title: 'প্যাকেজ বাছাই', desc: 'আপনার প্রয়োজন অনুযায়ী সাপ্তাহিক বা মাসিক খাবারের প্যাকেজ সিলেক্ট করুন।' },
        { step: '02', icon: '✅', title: 'অর্ডার নিশ্চিত', desc: 'সহজ পেমেন্ট মেথড ব্যবহার করে আপনার সাবস্ক্রিপশন নিশ্চিত করুন।' },
        { step: '03', icon: '🚴', title: 'ডেলিভারি', desc: 'নির্ধারিত সময়ে আপনার অফিস বা বাসায় পৌঁছে যাবে পুষ্টিকর গরম খাবার।' },
    ];
    const MENU_ITEMS = [
        { name: 'চিকেন বিরিয়ানি', price: '৳ ২২০', img: '/images/hero.png',  tag: 'Best Seller', desc: 'সুগন্ধি পোলাও চালের সাথে ঝাল চিকেন ও ডিমের কম্বো।' },
        { name: 'রুই মাছের ঝোল',   price: '৳ ১৮০', img: '/images/ilish.png', tag: 'ঘরোয়া স্বাদ', desc: 'তাজা মাছের সাথে আলু-বেগুনের ঝোল এবং গরম ভাত।' },
        { name: 'বিফ কারি লাঞ্চ',   price: '৳ ২৪০', img: '/images/beef.png',  tag: 'Premium', desc: 'গরুর মাংসের সাথে মুগ ডাল এবং গরম ভাতের পরিপূর্ণ লাঞ্চ।' },
    ];
    const TESTIMONIALS = [
        { name: 'রাফি হোসেন',   role: 'Software Engineer',     text: 'রান্নার ঝামেলা থেকে মুক্তি! Easy Food-এর মাধ্যমে প্রতিদিন গরম, সুস্বাদু খাবার পাচ্ছি।', stars: 5 },
        { name: 'সাদিয়া ইসলাম', role: 'Medical Student',        text: 'হোস্টেলে থেকে Easy Food-এর মাধ্যমে এত ভালো খাবার পাওয়া সত্যিই অসাধারণ।', stars: 5 },
        { name: 'করিম সাহেব',   role: 'Business Owner',         text: 'Easy Food-এর মিলের মান অত্যন্ত ভালো এবং ডেলিভারি সবসময় সময়মতো।', stars: 5 },
        { name: 'নাফিসা বেগম',  role: 'Teacher',                text: 'স্বাস্থ্যকর ও সুস্বাদু খাবার প্রতিদিন পাচ্ছি। Easy Food সেরা সার্ভিস!', stars: 5 },
        { name: 'জামাল উদ্দীন', role: 'Government Officer',     text: 'তিন মাস ধরে Easy Food ব্যবহার করছি, একবারও হতাশ হইনি।', stars: 5 },
    ];
    const FAQS = [
        { q: 'খাবারের মান কেমন হবে?', a: 'Easy Food ১০০% ফ্রেশ ও অর্গানিক উপাদান ব্যবহার করে। আপনার ঘরের খাবারের মতোই স্বাস্থ্যকর স্বাদ আমরা নিশ্চিত করি।' },
        { q: 'ডেলিভারি চার্জ কত?',    a: 'Easy Food-এর সব মান্থলি ও উইকলি প্যাকেজেই ডেলিভারি একদম ফ্রি!' },
        { q: 'মিল বন্ধ রাখা যাবে?',    a: 'হ্যাঁ, ২৪ ঘণ্টা আগে জানালে সেই মিলটি আপনার একাউন্টে জমা থাকবে।' },
        { q: 'মেনু কি প্রতিদিন একই?',  a: 'না, Easy Food প্রতিদিন ভিন্ন স্বাদের মেনু প্রদান করে যাতে একঘেয়েমি না আসে।' },
    ];

    return (
        <>
            <style>{`
                @keyframes blink     { 50% { opacity: 0; } }
                @keyframes orbFloat  { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
                @keyframes marquee   { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                @keyframes shimmer   { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
                @keyframes navDown   { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes heroIn    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
                @keyframes badgePop  { 0% { opacity:0; transform:scale(0.8); } 100% { opacity:1; transform:scale(1); } }
                @keyframes pulsering { 0% { box-shadow:0 0 0 0 rgba(249,115,22,0.5); } 70% { box-shadow:0 0 0 16px rgba(249,115,22,0); } 100% { box-shadow:0 0 0 0 rgba(249,115,22,0); } }
                @keyframes gridFade  { from { opacity:0; } to { opacity:1; } }

                .orb {
                    position: absolute; border-radius: 50%;
                    filter: blur(100px); pointer-events: none;
                    animation: orbFloat ease-in-out infinite;
                }
                .marquee-track { display:flex; width:max-content; animation: marquee 30s linear infinite; }
                .marquee-track:hover { animation-play-state: paused; }
                .shimmer-text {
                    background: linear-gradient(90deg, #fff 20%, var(--primary) 45%, var(--secondary) 55%, #fff 80%);
                    background-size: 200% auto;
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    animation: shimmer 4s linear infinite;
                }
                .nav-anim  { animation: navDown 0.5s ease both; }
                .hero-anim { animation: heroIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
                .badge-anim { animation: badgePop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both; }
                .pulse-btn { position:relative; overflow:hidden; }
                .pulse-btn::after { content:''; position:absolute; inset:0; border-radius:inherit; animation:pulsering 2.4s ease-out infinite; }
                .faq-answer { overflow:hidden; transition: max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease; }
                .nav-link   { transition: color 0.2s ease; }
                .nav-link:hover { color: white !important; }
                .menu-card img { transition: transform 0.5s ease; }
                .menu-card:hover img { transform: scale(1.05); }
                .social-icon { transition: border-color 0.25s ease, background 0.25s ease; }
                .social-icon:hover { border-color: var(--primary) !important; background: rgba(249,115,22,0.1) !important; }
                .step-num { background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            `}</style>

            <div style={{ color: 'var(--text-main)', background: 'var(--charcoal)', minHeight: '100vh' }}>

                {/* ── NAV ───────────────────────────────────────────── */}
                <nav className="nav-anim" style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.9rem 8%',
                    background: scrolled ? 'rgba(13,17,23,0.95)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(24px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
                    zIndex: 1000,
                    transition: 'all 0.35s ease',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}>🍽️</div>
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>
                            <span style={{ color: 'white' }}>Easy</span><span style={{ color: 'var(--primary)' }}>Food</span>
                        </div>
                    </div>

                    {/* Nav links */}
                    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                        {[['how-it-works', 'How It Works'], ['menu', 'Menu'], ['packages', 'Pricing']].map(([id, label]) => (
                            <button key={id} className="nav-link" onClick={() => scrollTo(id)}
                                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontWeight: 500, fontSize: '0.9rem', padding: 0, cursor: 'pointer', letterSpacing: '0.01em' }}>
                                {label}
                            </button>
                        ))}
                        <button onClick={onLoginClick} className="btn-primary" style={{ padding: '0.6rem 1.6rem', fontSize: '0.88rem', fontWeight: 700 }}>
                            Sign In
                        </button>
                    </div>
                </nav>

                {/* ── HERO ──────────────────────────────────────────── */}
                <header style={{
                    minHeight: '100vh', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                    padding: '130px 2rem 80px', position: 'relative', overflow: 'hidden',
                    background: 'linear-gradient(170deg, #080c18 0%, #0d1117 40%, #130800 100%)',
                }}>
                    {/* Background orbs */}
                    <div className="orb" style={{ width: 700, height: 700, background: 'rgba(249,115,22,0.09)', top: '-20%', right: '-15%', animationDuration: '10s' }} />
                    <div className="orb" style={{ width: 500, height: 500, background: 'rgba(245,158,11,0.06)', bottom: '-10%', left: '-12%', animationDuration: '14s', animationDelay: '3s' }} />
                    <div className="orb" style={{ width: 300, height: 300, background: 'rgba(139,92,246,0.05)', top: '35%', left: '8%', animationDuration: '8s', animationDelay: '1.5s' }} />

                    {/* Dot grid */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '36px 36px', animation: 'gridFade 2s ease both', pointerEvents: 'none' }} />

                    {/* Floating food emojis */}
                    {['🍛','🍱','🥘','🍲','🥗','🍚'].map((e, i) => (
                        <span key={i} style={{
                            position: 'absolute', pointerEvents: 'none',
                            left: `${8 + i * 15}%`, bottom: '-3%',
                            fontSize: `${1.2 + (i % 3) * 0.4}rem`,
                            opacity: 0.4,
                            animation: `orbFloat ${9 + i * 2}s ease-in-out ${i * 1.2}s infinite`,
                        }}>{e}</span>
                    ))}

                    <div className="hero-anim" style={{ maxWidth: 960, position: 'relative', zIndex: 1 }}>
                        {/* Live badge */}
                        <div className="badge-anim" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.45rem 1.2rem',
                            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
                            color: 'var(--primary)', borderRadius: 50, fontWeight: 700,
                            marginBottom: '2rem', fontSize: '0.82rem', letterSpacing: '0.07em',
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'pulsering 2s ease-out infinite' }} />
                            NOW ACCEPTING ORDERS · BARISAL
                        </div>

                        {/* Headline */}
                        <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5.2rem)', fontWeight: 900, lineHeight: 1.06, fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.04em', marginBottom: '1.4rem', color: 'white' }}>
                            <Typewriter /> থেকে<br />
                            <span className="shimmer-text">মুক্তি পান আজই!</span>
                        </h1>

                        {/* Sub */}
                        <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 640, margin: '0 auto 2.8rem' }}>
                            Easy Food — অফিসগামী ও শিক্ষার্থীদের জন্য সেরা মান্থলি মিল ক্যাটারিং।<br />
                            বাজারের চিন্তা ও রান্নার ক্লান্তি ছাড়াই উপভোগ করুন স্বাস্থ্যসম্মত গরম খাবার।
                        </p>

                        {/* CTAs */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <button onClick={() => openModal()} className="btn-primary pulse-btn"
                                style={{ padding: '1rem 2.8rem', fontSize: '1rem', fontWeight: 700, borderRadius: 50 }}>
                                মেম্বারশিপ শুরু করুন ✦
                            </button>
                            <button onClick={() => scrollTo('packages')} className="btn-outline"
                                style={{ padding: '1rem 2.8rem', fontSize: '1rem', fontWeight: 600, borderRadius: 50, backdropFilter: 'blur(10px)' }}>
                                প্ল্যানগুলো দেখুন
                            </button>
                        </div>

                        {/* Scroll hint */}
                        <div style={{ marginTop: '4.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.3 }}>
                            <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>scroll</span>
                            <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, white, transparent)' }} />
                        </div>
                    </div>
                </header>

                {/* ── TRUST BAR / STATS ─────────────────────────────── */}
                <section style={{ padding: '5rem 2rem', background: '#080c18', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        {STATS.map(({ n, s, label }, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div style={{ textAlign: 'center', padding: '2rem 1rem', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <div style={{ fontSize: 'clamp(2.2rem,5vw,3rem)', fontWeight: 900, fontFamily: "'Poppins',sans-serif", background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                                        <Counter target={n} suffix={s} />
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.6rem', fontSize: '0.88rem', letterSpacing: '0.02em' }}>{label}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ── HOW IT WORKS ──────────────────────────────────── */}
                <section id="how-it-works" style={{ padding: '9rem 2rem', background: 'var(--charcoal)', position: 'relative', overflow: 'hidden' }}>
                    <div className="orb" style={{ width: 600, height: 600, background: 'rgba(249,115,22,0.04)', top: '-10%', right: '-10%', animationDuration: '12s' }} />
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <Reveal style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <span style={{ display: 'inline-block', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', padding: '0.35rem 1rem', borderRadius: 50 }}>How It Works</span>
                            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif", marginBottom: '1rem' }}>
                                মাত্র তিনটি ধাপে <span style={{ color: 'var(--primary)' }}>শুরু করুন</span>
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>অর্ডার থেকে ডেলিভারি — Easy Food-এর পুরো প্রক্রিয়াটি একদম সহজ।</p>
                        </Reveal>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {HOW.map((item, i) => (
                                <Reveal key={i} delay={i * 0.12}>
                                    <div className="glass-card" style={{ padding: '3rem 2.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        {/* Step number */}
                                        <div className="step-num" style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: "'Poppins',sans-serif", lineHeight: 1, marginBottom: '1.5rem' }}>{item.step}</div>
                                        <div style={{ width: 64, height: 64, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>{item.icon}</div>
                                        <h3 style={{ fontSize: '1.35rem', color: 'white', fontWeight: 700, marginBottom: '0.8rem' }}>{item.title}</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, fontSize: '0.93rem' }}>{item.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── MENU PREVIEW ──────────────────────────────────── */}
                <section id="menu" style={{ padding: '9rem 2rem', background: '#080c18' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <Reveal style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <span style={{ display: 'inline-block', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', padding: '0.35rem 1rem', borderRadius: 50 }}>Our Menu</span>
                            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif", marginBottom: '1rem' }}>
                                জনপ্রিয় <span style={{ color: 'var(--primary)' }}>খাবার</span> সমূহ
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>Easy Food-এর মেম্বারদের পছন্দের তালিকার সেরা কয়েকটি মেনু।</p>
                        </Reveal>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {MENU_ITEMS.map((item, i) => (
                                <Reveal key={i} delay={i * 0.1}>
                                    <div className="menu-card glass-card" style={{ padding: 0, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                                        <div style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
                                            <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,24,0.7) 0%, transparent 55%)' }} />
                                            <span style={{ position: 'absolute', top: 14, left: 14, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', color: 'white', padding: '0.3rem 0.9rem', borderRadius: 50, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.04em' }}>{item.tag}</span>
                                        </div>
                                        <div style={{ padding: '1.75rem 2rem 2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                                                <h3 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 700 }}>{item.name}</h3>
                                                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>{item.price}</span>
                                            </div>
                                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{item.desc}</p>
                                            <button onClick={() => openModal()} className="btn-outline" style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem' }}>এই খাবারটি বুক করুন</button>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ──────────────────────────────────── */}
                <section style={{ padding: '7rem 0', background: 'var(--charcoal)', overflow: 'hidden' }}>
                    <Reveal style={{ textAlign: 'center', marginBottom: '4rem', padding: '0 2rem' }}>
                        <span style={{ display: 'inline-block', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', padding: '0.35rem 1rem', borderRadius: 50 }}>Reviews</span>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif" }}>
                            Easy Food সম্পর্কে <span style={{ color: 'var(--primary)' }}>সদস্যরা বলেন</span>
                        </h2>
                    </Reveal>
                    <div style={{ overflow: 'hidden' }}>
                        <div className="marquee-track">
                            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                                <div key={i} style={{
                                    flexShrink: 0, width: 320, margin: '0 0.75rem',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 16, padding: '1.75rem',
                                }}>
                                    <div style={{ color: 'var(--secondary)', fontSize: '1rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>{'★'.repeat(t.stars)}</div>
                                    <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '0.9rem' }}>"{t.text}"</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', color: 'white', flexShrink: 0 }}>{t.name[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem' }}>{t.name}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.76rem' }}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PACKAGES / PRICING ────────────────────────────── */}
                <section id="packages" style={{ padding: '9rem 2rem', background: '#080c18' }}>
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        <Reveal style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <span style={{ display: 'inline-block', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', padding: '0.35rem 1rem', borderRadius: 50 }}>Pricing</span>
                            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif", marginBottom: '1rem' }}>
                                Easy Food <span style={{ color: 'var(--primary)' }}>Subscription</span>
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>সাশ্রয়ী মূল্যে আপনার পছন্দের প্ল্যানটি নির্বাচন করুন।</p>
                        </Reveal>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 430px))', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Weekly */}
                            <Reveal delay={0}>
                                <div className="glass-card" style={{ padding: '3rem 2.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.06)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1.5rem' }}>📅</div>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Trial Plan</p>
                                    <h3 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 700, marginBottom: '0.3rem' }}>সাপ্তাহিক</h3>
                                    <div style={{ margin: '1.5rem 0 2rem' }}>
                                        <span style={{ fontSize: '3rem', fontWeight: 900, color: 'white', fontFamily: "'Poppins',sans-serif" }}>৳ ১৪০০</span>
                                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}> / সপ্তাহ</span>
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '2.5rem' }}>
                                        {['৭ দিন ডাবল মিল (লাঞ্চ ও ডিনার)', 'পরিচ্ছন্ন ও স্বাস্থ্যকর প্যাকিং', 'ফ্রি ডেলিভারি', 'সাপ্তাহিক মেনু কাস্টমাইজেশন'].map((f, i) => (
                                            <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.85rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>
                                                <span style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}>✓</span>{f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => openModal('weekly')} className="btn-outline" style={{ width: '100%', padding: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>ট্রায়াল শুরু করুন</button>
                                </div>
                            </Reveal>

                            {/* Monthly — featured */}
                            <Reveal delay={0.1}>
                                <div style={{
                                    padding: '3.5rem 2.5rem', textAlign: 'center', position: 'relative',
                                    background: 'linear-gradient(160deg, rgba(249,115,22,0.1) 0%, rgba(245,158,11,0.05) 100%)',
                                    border: '2px solid rgba(249,115,22,0.45)',
                                    borderRadius: 'var(--card-radius)',
                                    boxShadow: '0 0 40px rgba(249,115,22,0.12)',
                                }}>
                                    <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', color: 'white', padding: '0.4rem 1.6rem', borderRadius: 50, fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>⭐ Best Value</div>
                                    <div style={{ width: 56, height: 56, background: 'rgba(249,115,22,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0.5rem auto 1.5rem' }}>🏆</div>
                                    <p style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Most Popular</p>
                                    <h3 style={{ fontSize: '1.6rem', color: 'white', fontWeight: 800, marginBottom: '0.3rem' }}>প্রফেশনাল মান্থলি</h3>
                                    <div style={{ margin: '1.5rem 0 2rem' }}>
                                        <span style={{ fontSize: '3.2rem', fontWeight: 900, color: 'white', fontFamily: "'Poppins',sans-serif" }}>৳ ৫০০০</span>
                                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}> / মাস</span>
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '2.5rem' }}>
                                        {['৩০ দিন নিরবচ্ছিন্ন সার্ভিস', 'মাছের ৩টি ও মাংসের ৩টি আইটেম', 'ডাল, সবজি ও সালাদ প্রতিদিন', '২৪/৭ কাস্টমার সাপোর্ট'].map((f, i) => (
                                            <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.85rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.93rem' }}>
                                                <span style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}>✓</span>{f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => openModal('monthly')} className="btn-primary pulse-btn" style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: 800 }}>সাবস্ক্রিপশন নিন</button>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ── CTA BANNER ────────────────────────────────────── */}
                <section style={{ padding: '7rem 2rem', background: 'var(--charcoal)', position: 'relative', overflow: 'hidden' }}>
                    <div className="orb" style={{ width: 500, height: 500, background: 'rgba(249,115,22,0.08)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animationDuration: '8s' }} />
                    <Reveal style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif", marginBottom: '1rem' }}>
                            আজই Easy Food-এ যোগ দিন —<br />
                            <span style={{ color: 'var(--primary)' }}>প্রথম সপ্তাহ বিনামূল্যে!</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', marginBottom: '2.5rem' }}>কোনো ঝামেলা নেই। যেকোনো সময় বাতিল করুন।</p>
                        <button onClick={() => openModal()} className="btn-primary pulse-btn" style={{ padding: '1.1rem 3.2rem', fontSize: '1rem', fontWeight: 700 }}>
                            বিনামূল্যে শুরু করুন →
                        </button>
                    </Reveal>
                </section>

                {/* ── FAQ ───────────────────────────────────────────── */}
                <section style={{ padding: '9rem 2rem', background: '#080c18' }}>
                    <div style={{ maxWidth: 720, margin: '0 auto' }}>
                        <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <span style={{ display: 'inline-block', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', padding: '0.35rem 1rem', borderRadius: 50 }}>FAQ</span>
                            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif" }}>
                                সাধারণ <span style={{ color: 'var(--primary)' }}>জিজ্ঞাসা</span>
                            </h2>
                        </Reveal>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {FAQS.map((item, i) => (
                                <Reveal key={i} delay={i * 0.07}>
                                    <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: '1.4rem 1.75rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: openFaq === i ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 14, transition: 'border-color 0.25s ease, background 0.25s ease', background: openFaq === i ? 'rgba(249,115,22,0.04)' : 'rgba(255,255,255,0.03)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, color: 'white', fontSize: '0.98rem' }}>{item.q}</span>
                                            <span style={{ color: 'var(--primary)', fontSize: '1.3rem', transition: 'transform 0.3s ease', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', flexShrink: 0, marginLeft: '1rem' }}>+</span>
                                        </div>
                                        <div className="faq-answer" style={{ maxHeight: openFaq === i ? '200px' : '0', opacity: openFaq === i ? 1 : 0 }}>
                                            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>{item.a}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ────────────────────────────────────────── */}
                <footer style={{ padding: '6rem 2rem 3rem', background: '#05070f', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3.5rem', marginBottom: '4rem' }}>
                            {/* Brand */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🍽️</div>
                                    <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '1.3rem' }}>
                                        <span style={{ color: 'white' }}>Easy</span><span style={{ color: 'var(--primary)' }}>Food</span>
                                    </div>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, marginBottom: '1.8rem', fontSize: '0.88rem' }}>আমরা দিচ্ছি মায়ের হাতের রান্নার স্বাদে সেরা মান্থলি মিল ক্যাটারিং সার্ভিস।</p>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {['📘', '📸', '🐦', '🔗'].map((icon, i) => (
                                        <div key={i} className="social-icon" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.04)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)' }}>{icon}</div>
                                    ))}
                                </div>
                            </div>
                            {/* Nav */}
                            <div>
                                <h4 style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)' }}>Company</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {['সহযোগিতা', 'মেম্বার সুবিধা', 'প্রাইভেসি পলিসি', 'শর্তাবলী'].map((l, i) => (
                                        <li key={i} className="nav-link" style={{ marginBottom: '0.9rem', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.9rem' }}>{l}</li>
                                    ))}
                                </ul>
                            </div>
                            {/* Contact */}
                            <div>
                                <h4 style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)' }}>Contact</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {[['📍', 'সদর রোড, বরিশাল'], ['📞', '+৮৮০ ১৭০০-বরিশাল'], ['✉️', 'info@easyfood.com.bd']].map(([icon, val], i) => (
                                        <li key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.9rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', alignItems: 'center' }}><span>{icon}</span>{val}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem' }}>
                            © 2026 Easy Food · সেরা স্বাদের নিশ্চয়তা · Made with ❤️ in Barisal
                        </div>
                    </div>
                </footer>
            </div>

            {/* ── SUBSCRIPTION MODAL ──────────────────────────────── */}
            {showModal && (
                <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(5,7,15,0.92)', backdropFilter: 'blur(20px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeInOverlay 0.2s ease' }}>
                    <div onClick={e => e.stopPropagation()} className="glass-card animate-pop-in" style={{ background: '#0d1117', padding: '2.5rem', width: '100%', maxWidth: 560, position: 'relative', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20 }}>
                        {/* Close */}
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', width: 36, height: 36, borderRadius: '50%', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 1rem' }}>🍽️</div>
                            <h3 style={{ fontSize: '1.7rem', color: 'white', fontWeight: 900, fontFamily: "'Poppins',sans-serif", marginBottom: '0.4rem' }}>Easy Food-এ যোগ দিন</h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>আপনার তথ্য প্রদান করে যাত্রা শুরু করুন।</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {[['name', 'text', 'পূর্ণ নাম', 'আপনার নাম লিখুন'], ['phone', 'tel', 'ফোন নাম্বার', '+৮৮০']].map(([n, t, label, ph]) => (
                                <div key={n} style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                                    <input type={t} name={n} required value={formData[n]} onChange={handleInputChange} placeholder={ph}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.25s', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                </div>
                            ))}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Membership Plan</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {[['weekly', 'সাপ্তাহিক', '৳ ১৪০০'], ['monthly', 'প্রফেশনাল', '৳ ৫০০০']].map(([val, name, price]) => (
                                        <label key={val} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '1rem', borderRadius: 12, border: formData.package === val ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.09)', background: formData.package === val ? 'rgba(249,115,22,0.07)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.25s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input type="radio" name="package" value={val} checked={formData.package === val} onChange={handleInputChange} />
                                                <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{name}</span>
                                            </div>
                                            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.15rem' }}>{price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', fontWeight: 800 }}>Easy Food-এ যোগ দিন →</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default LandingPage;
