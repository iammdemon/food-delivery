import React, { useState, useEffect, useRef } from 'react';
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

/* ── Section wrapper with slide-up reveal ───────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
    const [ref, visible] = useReveal();
    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(48px)',
            transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
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

    useEffect(() => { document.title = 'ফুড ক্যাটারিং বরিশাল'; }, []);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 50);
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

    const FOOD_FLOATERS = ['🍛', '🍱', '🥘', '🍲', '🥗', '🍚'];
    const STATS = [
        { n: 500, s: '+', label: 'সন্তুষ্ট সদস্য' },
        { n: 30, s: 'K+', label: 'মিল ডেলিভারি' },
        { n: 3, s: ' বছর', label: 'অভিজ্ঞতা' },
        { n: 99, s: '%', label: 'সন্তুষ্টির হার' },
    ];
    const HOW = [
        { step: '০১', icon: '📦', title: 'প্যাকেজ বাছাই', desc: 'আপনার প্রয়োজন অনুযায়ী সাপ্তাহিক বা মাসিক খাবারের প্যাকেজ সিলেক্ট করুন।' },
        { step: '০২', icon: '✅', title: 'অর্ডার নিশ্চিত', desc: 'সহজ পেমেন্ট মেথড ব্যবহার করে আপনার সাবস্ক্রিপশন নিশ্চিত করুন।' },
        { step: '০৩', icon: '🚴', title: 'ডেলিভারি', desc: 'নির্ধারিত সময়ে আপনার অফিস বা বাসায় পৌঁছে যাবে পুষ্টিকর গরম খাবার।' },
    ];
    const MENU_ITEMS = [
        { name: 'চিকেন বিরিয়ানি', price: '৳ ২২০', img: '/images/hero.png', tag: 'বেস্ট সেলার', desc: 'সুগন্ধি পোলাও চালের সাথে ঝাল চিকেন ও ডিমের কম্বো।' },
        { name: 'রুই মাছের ঝোল', price: '৳ ১৮০', img: '/images/ilish.png', tag: 'ঘরোয়া স্বাদ', desc: 'তাজা মাছের সাথে আলু-বেগুনের ঝোল এবং গরম ভাত।' },
        { name: 'বিফ কারি লাঞ্চ', price: '৳ ২৪০', img: '/images/beef.png', tag: 'প্রিমিয়াম', desc: 'গরুর মাংসের সাথে মুগ ডাল এবং গরম ভাতের পরিপূর্ণ লাঞ্চ।' },
    ];
    const TESTIMONIALS = [
        { name: 'রাফি হোসেন', role: 'সফটওয়্যার ইঞ্জিনিয়ার', text: 'রান্নার ঝামেলা থেকে মুক্তি! প্রতিদিন গরম, সুস্বাদু খাবার পাচ্ছি।', stars: 5 },
        { name: 'সাদিয়া ইসলাম', role: 'মেডিকেল স্টুডেন্ট', text: 'হোস্টেলে থেকে এত ভালো খাবার পাওয়া সত্যিই অসাধারণ অভিজ্ঞতা।', stars: 5 },
        { name: 'করিম সাহেব', role: 'ব্যবসায়ী', text: 'মিলের মান অত্যন্ত ভালো এবং ডেলিভারি সবসময় সময়মতো।', stars: 5 },
        { name: 'নাফিসা বেগম', role: 'শিক্ষিকা', text: 'স্বাস্থ্যকর ও সুস্বাদু খাবার প্রতিদিন পাচ্ছি। সেরা সার্ভিস!', stars: 5 },
        { name: 'জামাল উদ্দীন', role: 'সরকারি কর্মকর্তা', text: 'তিন মাস ধরে ব্যবহার করছি, একবারও হতাশ হইনি।', stars: 5 },
    ];
    const FAQS = [
        { q: 'খাবারের মান কেমন হবে?', a: 'আমরা ১০০% ফ্রেশ ও অর্গানিক উপাদান ব্যবহার করি। আপনার ঘরের খাবারের মতোই স্বাস্থ্যকর স্বাদ আমরা নিশ্চিত করি।' },
        { q: 'ডেলিভারি চার্জ কত?', a: 'আমাদের মান্থলি ও উইকলি সব প্যাকেজেই ডেলিভারি একদম ফ্রি!' },
        { q: 'কোনো কারণে মিল বন্ধ রাখা যাবে?', a: 'হ্যাঁ, ২৪ ঘণ্টা আগে জানালে সেই মিলটি আপনার একাউন্টে জমা থাকবে।' },
        { q: 'মেনু কি প্রতিদিন একই থাকে?', a: 'না, আমরা প্রতিদিন ভিন্ন স্বাদের মেনু প্রদান করি যাতে একঘেয়েমি না আসে।' },
    ];

    return (
        <>
            <style>{`
                @keyframes blink { 50% { opacity: 0; } }
                @keyframes floatUp {
                    0%   { transform: translateY(0) rotate(0deg);   opacity: 0.7; }
                    100% { transform: translateY(-120vh) rotate(20deg); opacity: 0; }
                }
                @keyframes orbPulse {
                    0%, 100% { transform: scale(1);   opacity: 0.4; }
                    50%       { transform: scale(1.2); opacity: 0.6; }
                }
                @keyframes marquee {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes navSlideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes heroScale {
                    from { opacity: 0; transform: scale(0.94); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes badgePop {
                    0%   { opacity: 0; transform: scale(0.7) translateY(10px); }
                    70%  { transform: scale(1.08) translateY(-2px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .landing-floater {
                    position: absolute;
                    pointer-events: none;
                    animation: floatUp linear infinite;
                    will-change: transform;
                }
                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(90px);
                    pointer-events: none;
                    animation: orbPulse ease-in-out infinite;
                }
                .marquee-track {
                    display: flex;
                    width: max-content;
                    animation: marquee 28s linear infinite;
                }
                .marquee-track:hover { animation-play-state: paused; }
                .hero-content {
                    animation: heroScale 1s cubic-bezier(0.22,1,0.36,1) 0.1s both;
                }
                .nav-anim { animation: navSlideDown 0.6s ease both; }
                .badge-anim { animation: badgePop 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.5s both; }
                .shimmer-text {
                    background: linear-gradient(90deg, var(--primary) 25%, var(--secondary) 50%, var(--primary) 75%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 3s linear infinite;
                }
                .step-card { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease; }
                .step-card:hover { transform: translateY(-12px) !important; box-shadow: 0 30px 60px rgba(0,0,0,0.5) !important; }
                .menu-card { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease; overflow: hidden; }
                .menu-card:hover { transform: translateY(-10px); box-shadow: 0 24px 50px rgba(0,0,0,0.5) !important; }
                .menu-card:hover img { transform: scale(1.08); }
                .menu-card img { transition: transform 0.6s ease; }
                .faq-answer {
                    overflow: hidden;
                    transition: max-height 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease;
                }
                .pulse-btn {
                    position: relative;
                    overflow: hidden;
                }
                .pulse-btn::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    box-shadow: 0 0 0 0 rgba(249,115,22,0.6);
                    animation: pulsering 2.2s ease-out infinite;
                }
                @keyframes pulsering {
                    0%   { box-shadow: 0 0 0 0 rgba(249,115,22,0.5); }
                    70%  { box-shadow: 0 0 0 18px rgba(249,115,22,0); }
                    100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
                }
                .social-icon { transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; }
                .social-icon:hover { transform: translateY(-4px); border-color: var(--primary) !important; box-shadow: 0 8px 20px rgba(249,115,22,0.25); }
                .nav-link { transition: color 0.25s ease; }
                .nav-link:hover { color: white !important; }
            `}</style>

            <div style={{ color: 'var(--text-main)', background: 'var(--charcoal)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

                {/* ── NAV ─────────────────────────────────────────────── */}
                <nav className="nav-anim" style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 8%',
                    background: scrolled ? 'rgba(2,6,23,0.92)' : 'rgba(2,6,23,0.4)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                    zIndex: 1000,
                    transition: 'background 0.4s ease, border-color 0.4s ease',
                }}>
                    <div style={{ fontSize: '1.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.7rem', fontFamily: "'Poppins', sans-serif" }}>
                        <span style={{ filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.5))', fontSize: '1.8rem' }}>🍱</span>
                        <span style={{ color: 'var(--primary)' }}>ফুড ক্যাটারিং</span>
                        <span style={{ color: 'white' }}>বরিশাল</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                        {[['how-it-works', 'প্রক্রিয়া'], ['menu', 'মেনু'], ['packages', 'প্যাকেজ']].map(([id, label]) => (
                            <button key={id} className="nav-link" onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem', padding: 0, cursor: 'pointer' }}>{label}</button>
                        ))}
                        <button onClick={onLoginClick} className="btn-primary" style={{ padding: '0.7rem 2rem', fontSize: '0.9rem' }}>লগইন</button>
                    </div>
                </nav>

                {/* ── HERO ────────────────────────────────────────────── */}
                <header style={{
                    minHeight: '100vh', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                    padding: '120px 2rem 60px', position: 'relative', overflow: 'hidden',
                    background: 'linear-gradient(160deg, #020617 0%, #0f172a 50%, #1a0a00 100%)',
                }}>
                    {/* Orbs */}
                    <div className="orb" style={{ width: 600, height: 600, background: 'rgba(249,115,22,0.12)', top: '-15%', right: '-10%', animationDuration: '8s' }} />
                    <div className="orb" style={{ width: 400, height: 400, background: 'rgba(245,158,11,0.08)', bottom: '-5%', left: '-8%', animationDuration: '11s', animationDelay: '2s' }} />
                    <div className="orb" style={{ width: 250, height: 250, background: 'rgba(249,115,22,0.07)', top: '40%', left: '5%', animationDuration: '6s', animationDelay: '1s' }} />

                    {/* Floating food particles */}
                    {FOOD_FLOATERS.map((emoji, i) => (
                        <span key={i} className="landing-floater" style={{
                            left: `${10 + i * 15}%`,
                            bottom: `-5%`,
                            fontSize: `${1.4 + (i % 3) * 0.5}rem`,
                            animationDuration: `${8 + i * 2}s`,
                            animationDelay: `${i * 1.3}s`,
                        }}>{emoji}</span>
                    ))}

                    {/* Grid overlay */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

                    <div className="hero-content" style={{ maxWidth: 1000, position: 'relative', zIndex: 1 }}>
                        <div className="badge-anim" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.55rem 1.4rem',
                            background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)',
                            color: 'var(--primary)', borderRadius: 50, fontWeight: 700,
                            marginBottom: '2.2rem', fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'pulsering 2s ease-out infinite' }} />
                            এখন অর্ডার নিচ্ছি · বরিশাল সিটি
                        </div>

                        <h1 style={{ fontSize: 'clamp(2.6rem,7vw,5rem)', fontWeight: 900, lineHeight: 1.08, fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.04em', marginBottom: '1.6rem', color: 'white' }}>
                            <Typewriter /> থেকে<br />
                            <span className="shimmer-text">মুক্তি পান আজই!</span>
                        </h1>

                        <p style={{ fontSize: 'clamp(1rem,2.5vw,1.25rem)', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 700, margin: '0 auto 3rem' }}>
                            অফিসগামী বা শিক্ষার্থীদের জন্য সেরা মান্থলি মিল ক্যাটারিং। বাজারের চিন্তা আর রান্নার ক্লান্তি ছাড়াই উপভোগ করুন স্বাস্থ্যসম্মত ঘরোয়া খাবার।
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                            <button onClick={() => openModal()} className="btn-primary pulse-btn" style={{ padding: '1.1rem 3rem', fontSize: '1.05rem', fontWeight: 700 }}>
                                মেম্বারশিপ শুরু করুন ✦
                            </button>
                            <button onClick={() => scrollTo('packages')} className="btn-outline" style={{ padding: '1.1rem 3rem', fontSize: '1.05rem', fontWeight: 600, backdropFilter: 'blur(10px)' }}>
                                প্ল্যানগুলো দেখুন
                            </button>
                        </div>

                        {/* Scroll indicator */}
                        <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', opacity: 0.45 }}>
                            <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>স্ক্রোল করুন</span>
                            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, white, transparent)' }} />
                        </div>
                    </div>
                </header>

                {/* ── STATS ───────────────────────────────────────────── */}
                <section style={{ padding: '5rem 2rem', background: 'var(--deep-dark)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '2rem', textAlign: 'center' }}>
                        {STATS.map(({ n, s, label }, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div style={{ padding: '2rem 1rem' }}>
                                    <div style={{ fontSize: 'clamp(2.2rem,5vw,3rem)', fontWeight: 900, fontFamily: "'Poppins',sans-serif", color: 'var(--primary)', lineHeight: 1 }}>
                                        <Counter target={n} suffix={s} />
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', marginTop: '0.6rem', fontSize: '0.95rem' }}>{label}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ── HOW IT WORKS ────────────────────────────────────── */}
                <section id="how-it-works" style={{ padding: '9rem 2rem', background: 'var(--charcoal)', position: 'relative', overflow: 'hidden' }}>
                    <div className="orb" style={{ width: 500, height: 500, background: 'rgba(249,115,22,0.05)', top: '-10%', right: '-8%', animationDuration: '10s' }} />
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <Reveal style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>কিভাবে কাজ করে</p>
                            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif" }}>
                                মাত্র তিনটি ধাপে <span style={{ color: 'var(--primary)' }}>শুরু করুন</span>
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 560, margin: '1rem auto 0' }}>অর্ডার থেকে ডেলিভারি — পুরো প্রক্রিয়াটি একদম সহজ।</p>
                        </Reveal>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '2rem', position: 'relative' }}>
                            {/* connector line */}
                            <div style={{ position: 'absolute', top: '80px', left: '25%', right: '25%', height: 2, background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)', pointerEvents: 'none' }} />
                            {HOW.map((item, i) => (
                                <Reveal key={i} delay={i * 0.15}>
                                    <div className="step-card glass-card" style={{ padding: '3.5rem 2.5rem', textAlign: 'center', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', color: 'white', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', padding: '0.3rem 1rem', borderRadius: '0 0 12px 12px', textTransform: 'uppercase' }}>ধাপ {item.step}</div>
                                        <div style={{ width: 80, height: 80, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0.5rem auto 2rem' }}>{item.icon}</div>
                                        <h3 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 700, marginBottom: '1rem' }}>{item.title}</h3>
                                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── MENU PREVIEW ────────────────────────────────────── */}
                <section id="menu" style={{ padding: '9rem 2rem', background: 'var(--deep-dark)' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <Reveal style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>আমাদের মেনু</p>
                            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif" }}>
                                জনপ্রিয় <span style={{ color: 'var(--primary)' }}>খাবার</span> সমূহ
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '1rem' }}>আমাদের মেম্বারদের পছন্দের তালিকার সেরা কয়েকটি মেনু।</p>
                        </Reveal>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '2.5rem' }}>
                            {MENU_ITEMS.map((item, i) => (
                                <Reveal key={i} delay={i * 0.12}>
                                    <div className="menu-card glass-card" style={{ padding: 0, border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ height: 240, position: 'relative', overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
                                            <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,6,23,0.6) 0%, transparent 60%)' }} />
                                            <span style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(249,115,22,0.9)', backdropFilter: 'blur(8px)', color: 'white', padding: '0.35rem 1rem', borderRadius: 50, fontWeight: 700, fontSize: '0.78rem' }}>{item.tag}</span>
                                        </div>
                                        <div style={{ padding: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                                <h3 style={{ fontSize: '1.35rem', color: 'white', fontWeight: 700 }}>{item.name}</h3>
                                                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.3rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>{item.price}</span>
                                            </div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>{item.desc}</p>
                                            <button onClick={() => openModal()} className="btn-outline" style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}>এই খাবারটি বুক করুন</button>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS MARQUEE ────────────────────────────── */}
                <section style={{ padding: '7rem 0', background: 'var(--charcoal)', overflow: 'hidden' }}>
                    <Reveal style={{ textAlign: 'center', marginBottom: '4rem', padding: '0 2rem' }}>
                        <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>রিভিউ</p>
                        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif" }}>
                            আমাদের <span style={{ color: 'var(--primary)' }}>সদস্যরা</span> বলেন
                        </h2>
                    </Reveal>
                    <div style={{ overflow: 'hidden' }}>
                        <div className="marquee-track">
                            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                                <div key={i} className="glass-card" style={{ flexShrink: 0, width: 320, margin: '0 1rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ color: 'var(--secondary)', fontSize: '1.1rem', marginBottom: '1rem' }}>{'★'.repeat(t.stars)}</div>
                                    <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>"{t.text}"</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: 'white' }}>{t.name[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{t.name}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PACKAGES ────────────────────────────────────────── */}
                <section id="packages" style={{ padding: '9rem 2rem', background: 'var(--deep-dark)' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <Reveal style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>প্রাইসিং</p>
                            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif" }}>
                                মিল <span style={{ color: 'var(--primary)' }}>সাবস্ক্রিপশন</span>
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '1rem' }}>সাশ্রয়ী মূল্যে আপনার পছন্দের প্ল্যানটি নির্বাচন করুন।</p>
                        </Reveal>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,450px))', gap: '2.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Weekly */}
                            <Reveal delay={0}>
                                <div className="glass-card" style={{ padding: '3.5rem 3rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
                                    <h3 style={{ fontSize: '1.6rem', color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>সাপ্তাহিক ট্রায়াল</h3>
                                    <div style={{ fontSize: '3rem', fontWeight: 900, color: 'white', margin: '1.2rem 0', fontFamily: "'Poppins',sans-serif" }}>৳ ১৪০০<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / সপ্তাহ</span></div>
                                    <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '2.5rem' }}>
                                        {['৭ দিন ডাবল মিল (লাঞ্চ ও ডিনার)', 'পরিচ্ছন্ন ও স্বাস্থ্যকর প্যাকিং', 'ফ্রি ডেলিভারি', 'সাপ্তাহিক মেনু কাস্টমাইজেশন'].map((f, i) => (
                                            <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginBottom: '0.9rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                                <span style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }}>✦</span>{f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => openModal('weekly')} className="btn-outline" style={{ width: '100%', padding: '1.1rem', fontSize: '1rem' }}>ট্রায়াল শুরু করুন</button>
                                </div>
                            </Reveal>

                            {/* Monthly - featured */}
                            <Reveal delay={0.12}>
                                <div className="glass-card orange-glow" style={{ padding: '4.5rem 3.5rem', textAlign: 'center', background: 'rgba(249,115,22,0.04)', border: '2px solid var(--primary)', position: 'relative', transform: 'scale(1.04)' }}>
                                    <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', color: 'white', padding: '0.5rem 2rem', borderRadius: 50, fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>⭐ সেরা অফার</div>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏆</div>
                                    <h3 style={{ fontSize: '1.8rem', color: 'white', fontWeight: 800, marginBottom: '0.5rem' }}>প্রফেশনাল মান্থলি</h3>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', margin: '1.2rem 0', fontFamily: "'Poppins',sans-serif" }}>৳ ৫০০০<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / মাস</span></div>
                                    <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '3rem' }}>
                                        {['৩০ দিন নিরবচ্ছিন্ন সার্ভিস', 'মাছের ৩টি ও মাংসের ৩টি আইটেম', 'ডাল, সবজি ও সালাদ প্রতিদিন', '২৪/৭ কাস্টমার সাপোর্ট'].map((f, i) => (
                                            <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginBottom: '0.9rem', color: 'white', fontSize: '1rem' }}>
                                                <span style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }}>✦</span>{f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => openModal('monthly')} className="btn-primary pulse-btn" style={{ width: '100%', padding: '1.3rem', fontSize: '1.1rem', fontWeight: 800 }}>সাবস্ক্রিপশন নিন</button>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ── CTA BANNER ──────────────────────────────────────── */}
                <section style={{ padding: '7rem 2rem', background: 'linear-gradient(135deg,rgba(249,115,22,0.15) 0%,rgba(245,158,11,0.1) 100%)', borderTop: '1px solid rgba(249,115,22,0.15)', borderBottom: '1px solid rgba(249,115,22,0.15)' }}>
                    <Reveal style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif", marginBottom: '1rem' }}>
                            আজই শুরু করুন — <span style={{ color: 'var(--primary)' }}>প্রথম সপ্তাহ বিনামূল্যে!</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>কোনো ঝামেলা নেই, যেকোনো সময় বাতিল করুন।</p>
                        <button onClick={() => openModal()} className="btn-primary pulse-btn" style={{ padding: '1.2rem 3.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                            বিনামূল্যে শুরু করুন →
                        </button>
                    </Reveal>
                </section>

                {/* ── FAQ ─────────────────────────────────────────────── */}
                <section style={{ padding: '9rem 2rem', background: 'var(--charcoal)' }}>
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>FAQ</p>
                            <h2 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, color: 'white', fontFamily: "'Poppins',sans-serif" }}>
                                সাধারণ <span style={{ color: 'var(--primary)' }}>জিজ্ঞাসা</span>
                            </h2>
                        </Reveal>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {FAQS.map((item, i) => (
                                <Reveal key={i} delay={i * 0.08}>
                                    <div className="glass-card" style={{ padding: '1.5rem 2rem', cursor: 'pointer', border: openFaq === i ? '1px solid rgba(249,115,22,0.35)' : '1px solid var(--glass-border)', transition: 'border-color 0.3s ease' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, color: 'white', fontSize: '1.05rem' }}>{item.q}</span>
                                            <span style={{ color: 'var(--primary)', fontSize: '1.4rem', transition: 'transform 0.35s ease', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', flexShrink: 0, marginLeft: '1rem' }}>+</span>
                                        </div>
                                        <div className="faq-answer" style={{ maxHeight: openFaq === i ? '200px' : '0', opacity: openFaq === i ? 1 : 0 }}>
                                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '1.2rem' }}>{item.a}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ──────────────────────────────────────────── */}
                <footer style={{ padding: '7rem 2rem 3rem', background: 'var(--deep-dark)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '4rem', marginBottom: '5rem' }}>
                            <div>
                                <div style={{ fontSize: '1.7rem', fontWeight: 900, marginBottom: '1.5rem', fontFamily: "'Poppins',sans-serif" }}>
                                    <span style={{ filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.4))' }}>🍱</span>
                                    <span style={{ marginLeft: '0.6rem' }}>প্রিমিয়াম <span style={{ color: 'var(--primary)' }}>ক্যাটারিং</span></span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '0.95rem' }}>আমরা দিচ্ছি মায়ের হাতের রান্নার স্বাদে সেরা মান্থলি মিল ক্যাটারিং সার্ভিস।</p>
                                <div style={{ display: 'flex', gap: '0.9rem' }}>
                                    {['📘', '📸', '🐦', '🔗'].map((icon, i) => (
                                        <div key={i} className="social-icon" style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.04)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' }}>{icon}</div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'white' }}>ন্যাভিগেশন</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {['সহযোগিতা', 'মেম্বার সুবিধা', 'প্রাইভেসি পলিসি', 'শর্তাবলী'].map((l, i) => (
                                        <li key={i} className="nav-link" style={{ marginBottom: '1rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.95rem' }}>{l}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'white' }}>যোগাযোগ</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {[['📍', 'সদর রোড, বরিশাল'], ['📞', '+৮৮০ ১৭০০-বরিশাল'], ['✉️', 'info@cateringbarisal.com']].map(([icon, val], i) => (
                                        <li key={i} style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}><span>{icon}</span>{val}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            © ২০২৬ ফুড ক্যাটারিং বরিশাল · সেরা স্বাদের নিশ্চয়তা
                        </div>
                    </div>
                </footer>
            </div>

            {/* ── SUBSCRIPTION MODAL ──────────────────────────────────── */}
            {showModal && (
                <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(16px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeInOverlay 0.25s ease' }}>
                    <div onClick={e => e.stopPropagation()} className="glass-card animate-pop-in" style={{ background: 'var(--charcoal)', padding: '3rem', width: '100%', maxWidth: 580, position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.06)', color: 'white', width: 38, height: 38, borderRadius: '50%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍱</div>
                            <h3 style={{ fontSize: '2rem', color: 'white', fontWeight: 900, fontFamily: "'Poppins',sans-serif" }}>এলিট ক্লাবে যোগ দিন</h3>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>আপনার তথ্য প্রদান করে যাত্রা শুরু করুন।</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {[['name', 'text', 'পূর্ণ নাম', 'আপনার নাম লিখুন'], ['phone', 'tel', 'ফোন নাম্বার', '+৮৮০']].map(([n, t, label, ph]) => (
                                <div key={n} style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, color: 'white', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                                    <input type={t} name={n} required value={formData[n]} onChange={handleInputChange} placeholder={ph}
                                        style={{ width: '100%', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                </div>
                            ))}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'white', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>পছন্দের মেম্বারশিপ</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {[['weekly', 'সাপ্তাহিক', '৳ ১৪০০'], ['monthly', 'প্রফেশনাল', '৳ ৫০০০']].map(([val, name, price]) => (
                                        <label key={val} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.2rem', borderRadius: 16, border: formData.package === val ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', background: formData.package === val ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.3s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <input type="radio" name="package" value={val} checked={formData.package === val} onChange={handleInputChange} />
                                                <span style={{ fontWeight: 700, color: 'white' }}>{name}</span>
                                            </div>
                                            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.3rem' }}>{price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 800 }}>অনুরোধ পাঠান →</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default LandingPage;
