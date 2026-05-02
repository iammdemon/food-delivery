import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from '../utils/toast';
import API_BASE from '../api';

const LandingPage = ({ onLoginClick }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        package: 'monthly'
    });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        document.title = "ফুড ক্যাটারিং বরিশাল";
    }, []);

    // Lock scroll when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.top = `-${window.scrollY}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
        };
    }, [showModal]);

    const prices = {
        weekly: 700,
        monthly: 2400
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE}/subscriptions`, formData);

            if (response.status === 200 || response.status === 201) {
                toast.success(`ধন্যবাদ ${formData.name}! আপনার ${formData.package === 'monthly' ? 'মাসিক' : 'সাপ্তাহিক'} প্যাকেজের অনুরোধটি গ্রহণ করা হয়েছে। আমরা শীঘ্রই যোগাযোগ করবো।`);
                setShowModal(false);
                setFormData({ name: '', phone: '', package: 'monthly' });
            } else {
                toast.error('দুঃখিত, অনুরোধটি পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।');
            }
        } catch (err) {
            console.error('Subscription Error:', err);
            toast.error('সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে।');
        }
    };

    const openModal = (pkg = 'monthly') => {
        setFormData(prev => ({ ...prev, package: pkg }));
        setShowModal(true);
    };

    return (
        <>
            {/* Page Content - Wrapped in transformation container */}
            <div className="landing-page animate-fade-in" style={{
                color: 'var(--text-main)',
                background: 'var(--charcoal)',
                minHeight: '100vh',
                fontFamily: "'Inter', sans-serif"
            }}>
                {/* 1. Navigation Header */}
                <nav style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.2rem 8%',
                    background: 'rgba(11, 17, 26, 0.8)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 1000,
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary)', fontFamily: "'Poppins', sans-serif" }}>
                        <span style={{ filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.4))' }}>🍱</span>
                        <span style={{ letterSpacing: '-0.03em' }}>ফুড ক্যাটারিং <span style={{ color: 'white' }}>বরিশাল</span></span>
                    </div>
                    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                        <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>প্রক্রিয়া</a>
                        <a href="#menu" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>মেনু</a>
                        <a href="#packages" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>প্যাকেজ</a>
                        <button onClick={onLoginClick} className="btn-primary" style={{ padding: '0.8rem 2.2rem', fontSize: '0.95rem' }}>
                            লগইন
                        </button>
                    </div>
                </nav>

                {/* 2. Hero Section */}
                <header style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    background: 'linear-gradient(rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.8)), url("/images/hero.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    padding: '120px 2rem 50px'
                }}>
                    <div style={{ maxWidth: '1100px', width: '100%' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.6rem 1.4rem',
                            background: 'rgba(249, 115, 22, 0.1)',
                            border: '1px solid rgba(249, 115, 22, 0.2)',
                            color: 'var(--primary)',
                            borderRadius: '50px',
                            fontWeight: '600',
                            marginBottom: '2rem',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <span>🏠</span> প্রতিদিন ঘরে তৈরি খাবারের স্বাদ
                        </div>
                        <h1 style={{ 
                            fontSize: 'clamp(3rem, 8vw, 5.5rem)', 
                            marginBottom: '1.5rem', 
                            color: 'white', 
                            lineHeight: '1.05', 
                            fontWeight: '900', 
                            fontFamily: "'Poppins', sans-serif",
                            letterSpacing: '-0.04em'
                        }}>
                            <span style={{ color: 'var(--primary)' }}>ফুড ক্যাটারিং বরিশাল</span> <br />
                            রান্নার ঝামেলা <span style={{ 
                                background: 'linear-gradient(to right, #F97316, #F59E0B)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>বিদায়</span> করুন
                        </h1>
                        <p style={{ 
                            fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
                            color: 'var(--text-muted)', 
                            marginBottom: '3.5rem', 
                            lineHeight: '1.6', 
                            maxWidth: '850px', 
                            margin: '0 auto 3.5rem' 
                        }}>
                            অফিসগামী বা শিক্ষার্থীদের জন্য সেরা মান্থলি মিল ক্যাটারিং। বাজারের চিন্তা আর রান্নার ক্লান্তি ছাড়াই 
                            উপভোগ করুন স্বাস্থ্যসম্মত ও সাশ্রয়ী ঘরোয়া খাবার।
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <button onClick={() => openModal()} className="btn-primary" style={{ padding: '1.3rem 3.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
                                মেম্বারশিপ শুরু করুন
                            </button>
                            <button onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })} className="btn-outline" style={{ padding: '1.3rem 3.5rem', fontSize: '1.1rem', fontWeight: '700', backdropFilter: 'blur(10px)' }}>
                                আমাদের প্ল্যানগুলো দেখুন
                            </button>
                        </div>
                    </div>
                </header>

                {/* 3. How It Works Section */}
                <section id="how-it-works" style={{ padding: '10rem 2rem', background: 'var(--deep-dark)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(249, 115, 22, 0.05)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                            <h2 style={{ fontSize: '3.5rem', color: 'white', marginBottom: '1.5rem', fontWeight: '800', fontFamily: "'Poppins', sans-serif" }}>কিভাবে <span style={{ color: 'var(--primary)' }}>কাজ</span> করে?</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>অর্ডার থেকে ডেলিভারি—পুরো প্রক্রিয়াটি একদম সহজ এবং ঝামেলামুক্ত।</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', position: 'relative' }}>
                            {[
                                { step: '০১', title: 'প্যাকেজ বাছাই করুন', desc: 'আপনার প্রয়োজন অনুযায়ী সাপ্তাহিক বা মাসিক খাবারের প্যাকেজ সিলেক্ট করুন।', icon: '📦' },
                                { step: '০২', title: 'অর্ডার নিশ্চিত করুন', desc: 'সহজ পেমেন্ট মেথড ব্যবহার করে আপনার সাবস্ক্রিপশন নিশ্চিত করুন।', icon: '✅' },
                                { step: '০৩', title: 'গরম খাবার গ্রহণ করুন', desc: 'নির্ধারিত সময়ে আপনার অফিস বা বাসায় পৌঁছে যাবে পুষ্টিকর গরম খাবার।', icon: '🍲' }
                            ].map((item, i) => (
                                <div key={i} className="glass-card" style={{
                                    padding: '4rem 2.5rem',
                                    textAlign: 'center',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        margin: '0 auto 2rem',
                                        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
                                    }}>{item.icon}</div>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '800',
                                        color: 'var(--primary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.2em',
                                        marginBottom: '0.5rem'
                                    }}>ধাপ {item.step}</div>
                                    <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1.2rem', fontWeight: '700' }}>{item.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Menu Preview Section */}
                <section id="menu" style={{ padding: '10rem 2rem', background: 'var(--charcoal)' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <h2 style={{ fontSize: '3.5rem', color: 'white', marginBottom: '1.5rem', fontWeight: '800', fontFamily: "'Poppins', sans-serif" }}>জনপ্রিয় <span style={{ color: 'var(--primary)' }}>খাবার</span> সমূহ</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>আমাদের মেম্বারদের পছন্দের তালিকার সেরা কয়েকটি মেনু।</p>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                            {[
                                { name: 'চিকেন বিরিয়ানি প্ল্যাটার', price: '৳ ২২০', img: '/images/hero.png', tag: 'বেস্ট সেলার', desc: 'সুগন্ধি পোলাও চালের সাথে ঝাল চিকেন এবং ডিমের কম্বো।' },
                                { name: 'রুই মাছের দোপেঁয়াজা', price: '৳ ১৮০', img: '/images/ilish.png', tag: 'ঘরোয়া স্বাদ', desc: 'তাজা মাছের সাথে আলু-বেগুনের ঝোল এবং সাদা ভাতের প্যাকেজ।' },
                                { name: 'বিফ কারি লাঞ্চ বক্স', price: '৳ ২৪০', img: '/images/beef.png', tag: 'প্রিমিয়াম', desc: 'গরুর মাংসের সাথে মুগ ডাল এবং গরম ভাতের পরিপূর্ণ লাঞ্চ।' }
                            ].map((item, i) => (
                                <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="image-zoom-container" style={{ height: '280px', position: 'relative' }}>
                                        <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '20px', 
                                            left: '20px', 
                                            background: 'rgba(249, 115, 22, 0.9)', 
                                            backdropFilter: 'blur(10px)',
                                            color: 'white', 
                                            padding: '0.5rem 1.5rem', 
                                            borderRadius: '50px', 
                                            fontWeight: '700', 
                                            fontSize: '0.8rem',
                                            boxShadow: '0 5px 15px rgba(249, 115, 22, 0.3)'
                                        }}>{item.tag}</div>
                                    </div>
                                    <div style={{ padding: '2.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.6rem', color: 'white', fontWeight: '700', fontFamily: "'Poppins', sans-serif" }}>{item.name}</h3>
                                            <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.5rem' }}>{item.price}</span>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.desc}</p>
                                        <button onClick={() => openModal()} className="btn-outline" style={{ width: '100%', padding: '1rem', borderRadius: '16px', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            এই খাবারটি বুক করুন
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. Pricing/Packages Table Section */}
                <section id="packages" style={{ padding: '10rem 2rem', background: 'var(--deep-dark)' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                            <h2 style={{ fontSize: '3.5rem', color: 'white', marginBottom: '1.5rem', fontWeight: '800', fontFamily: "'Poppins', sans-serif" }}>মিল <span style={{ color: 'var(--primary)' }}>সাবস্ক্রিপশন</span></h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>সাশ্রয়ী মূল্যে আপনার পছন্দের মান্থলি প্ল্যানটি নির্বাচন করুন।</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 450px))', gap: '3rem', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Weekly Plan */}
                            <div className="glass-card" style={{
                                padding: '4rem 3rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1rem', fontWeight: '700' }}>সাপ্তাহিক ট্রায়াল</h3>
                                <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white', marginBottom: '1rem', fontFamily: "'Poppins', sans-serif" }}>৳ ১৪০০ <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '400' }}>/ সপ্তাহ</span></div>
                                <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '3rem' }}>
                                    {['৭ দিন ডাবল মিল (লাঞ্চ ও ডিনার)', 'পরিচ্ছন্ন ও স্বাস্থ্যকর প্যাকিং', 'অফিস বা বাসায় ফ্রি ডেলিভারি', 'সাপ্তাহিক মেনু কাস্টমাইজেশন'].map((f, i) => (
                                        <li key={i} style={{ marginBottom: '1.2rem', fontSize: '1.05rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ color: 'var(--primary)' }}>✦</span> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => openModal('weekly')} className="btn-outline" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>ট্রায়াল শুরু করুন</button>
                            </div>

                            {/* Monthly Plan - Featured */}
                            <div className="glass-card orange-glow" style={{
                                padding: '5rem 3.5rem',
                                background: 'rgba(249, 115, 22, 0.03)',
                                border: '2px solid var(--primary)',
                                textAlign: 'center',
                                position: 'relative',
                                transform: 'scale(1.05)',
                                zIndex: 2
                            }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '-20px', 
                                    left: '50%', 
                                    transform: 'translateX(-50%)', 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    padding: '0.6rem 2rem', 
                                    borderRadius: '50px', 
                                    fontWeight: '800', 
                                    fontSize: '0.9rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>সেরা অফার</div>
                                <h3 style={{ fontSize: '2rem', color: 'white', marginBottom: '1rem', fontWeight: '800' }}>প্রফেশনাল মান্থলি</h3>
                                <div style={{ fontSize: '4rem', fontWeight: '900', color: 'white', marginBottom: '1rem', fontFamily: "'Poppins', sans-serif" }}>৳ ৫০০০ <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '400' }}>/ মাস</span></div>
                                <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '3.5rem' }}>
                                    {['৩০ দিন নিরবচ্ছিন্ন সার্ভিস', 'মাছের ৩টি ও মাংসের ৩টি আইটেম', 'ডাল, সবজি ও সালাদ প্রতিদিন', '২৪/৭ কাস্টমার সাপোর্ট'].map((f, i) => (
                                        <li key={i} style={{ marginBottom: '1.2rem', fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ color: 'var(--primary)' }}>✦</span> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => openModal('monthly')} className="btn-primary" style={{ width: '100%', padding: '1.4rem', fontSize: '1.2rem' }}>সাবস্ক্রিপশন নিন</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. FAQ Section */}
                <section style={{ padding: '10rem 2rem', background: 'var(--charcoal)' }}>
                    <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>সাধারণ <span style={{ color: 'var(--primary)' }}>জিজ্ঞাসা</span></h2>
                            <p style={{ color: 'var(--text-muted)' }}>আমাদের ক্যাটারিং সার্ভিস সম্পর্কে বিস্তারিত জানুন।</p>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {[
                                { q: 'খাবারের মান কেমন হবে?', a: 'আমরা ১০০% ফ্রেশ এবং অর্গানিক উপাদান ব্যবহার করি। আপনার ঘরের খাবারের মতোই স্বাস্থ্যকর স্বাদ আমরা নিশ্চিত করি।' },
                                { q: 'ডেলিভারি চার্জ কত?', a: 'আমাদের মান্থলি এবং উইকলি সব প্যাকেজেই ডেলিভারি একদম ফ্রি!' },
                                { q: 'কোন কারণে মিল অফ রাখা যাবে কি?', a: 'হ্যাঁ, যদি আপনি কোনদিন খাবার না নিতে চান তবে ২৪ ঘণ্টা আগে জানালে সেই মিলটি আপনার একাউন্টে জমা থাকবে।' },
                                { q: 'মেনু কি প্রতিদিন একই থাকে?', a: 'না, আমরা প্রতিদিন ভিন্ন ভিন্ন স্বাদের মেনু প্রদান করি যাতে আপনি খাবারের একঘেয়েমি থেকে মুক্তি পান।' }
                            ].map((item, i) => (
                                <details key={i} className="glass-card" style={{
                                    padding: '1.5rem 2.5rem',
                                    cursor: 'pointer'
                                }}>
                                    <summary style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {item.q}
                                        <span style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>+</span>
                                    </summary>
                                    <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. Footer - Detailed */}
                <footer style={{ padding: '8rem 2rem 4rem', background: 'var(--deep-dark)', color: 'white' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '5rem', marginBottom: '6rem' }}>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontFamily: "'Poppins', sans-serif" }}>
                                    <span style={{ filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.4))' }}>🍱</span>
                                    <span style={{ letterSpacing: '-0.03em' }}>প্রিমিয়াম <span style={{ color: 'var(--primary)' }}>ক্যাটারিং</span></span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2.5rem', fontSize: '1.05rem' }}>আমরা দিচ্ছি মায়ের হাতের রান্নার স্বাদে সেরা মান্থলি মিল ক্যাটারিং সার্ভিস। সুস্থ থাকুন, ভালো খান।</p>
                                <div className="flex" style={{ gap: '1.2rem' }}>
                                    {['📘', '📸', '🐦', '🔗'].map((icon, idx) => (
                                        <div key={idx} style={{ 
                                            width: '45px', 
                                            height: '45px', 
                                            background: 'rgba(255,255,255,0.03)', 
                                            borderRadius: '12px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '1.2rem', 
                                            cursor: 'pointer',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            transition: 'var(--transition)'
                                        }} onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(249, 115, 22, 0.2)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}>{icon}</div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ন্যাভিগেশন</h4>
                                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                                    <li style={{ marginBottom: '1.2rem', cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>সহযোগিতা</li>
                                    <li style={{ marginBottom: '1.2rem', cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>মেম্বার সুবিধা</li>
                                    <li style={{ marginBottom: '1.2rem', cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>প্রাইভেসি পলিসি</li>
                                    <li style={{ marginBottom: '1.2rem', cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>শর্তাবলী</li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>যোগাযোগ</h4>
                                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                                    <li style={{ marginBottom: '1.2rem', display: 'flex', gap: '1rem' }}><span>📍</span> সদর রোড, বরিশাল</li>
                                    <li style={{ marginBottom: '1.2rem', display: 'flex', gap: '1rem' }}><span>📞</span> +৮৮০ ১৭০০-বরিশাল</li>
                                    <li style={{ marginBottom: '1.2rem', display: 'flex', gap: '1rem' }}><span>✉️</span> info@cateringbarisal.com</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <p>&copy; ২০২৬ ফুড ক্যাটারিং বরিশাল | সেরা স্বাদের নিশ্চয়তা</p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* True Modal Overlay - Fixed to Viewport Center */}
            {showModal && (
                <div
                    className="animate-fade-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(2, 6, 23, 0.85)',
                        backdropFilter: 'blur(15px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="animate-pop-in glass-card"
                        style={{
                            background: 'var(--charcoal)',
                            padding: '3.5rem',
                            width: '100%',
                            maxWidth: '600px',
                            position: 'relative',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setShowModal(false)} style={{
                            position: 'absolute',
                            top: '30px',
                            right: '30px',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'var(--transition)'
                        }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.05)'}>✕</button>

                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '1rem', fontWeight: '900', fontFamily: "'Poppins', sans-serif" }}>এলিট ক্লাবে যোগ দিন</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>আপনার তথ্য প্রদান করে যাত্রা শুরু করুন।</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.8rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: 'white', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>পূর্ণ নাম</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', outline: 'none', transition: 'var(--transition)' }}
                                    placeholder="আপনার নাম লিখুন"
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>

                            <div style={{ marginBottom: '1.8rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: 'white', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ফোন নাম্বার</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
                                    placeholder="+৮৮০"
                                />
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <label style={{ display: 'block', marginBottom: '1.2rem', fontWeight: '600', color: 'white', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>পছন্দের মেম্বারশিপ</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <label style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '1.5rem',
                                        borderRadius: '20px',
                                        border: formData.package === 'weekly' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                        background: formData.package === 'weekly' ? 'rgba(249, 115, 22, 0.05)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div className="flex" style={{ marginBottom: '1rem' }}>
                                            <input type="radio" name="package" value="weekly" checked={formData.package === 'weekly'} onChange={handleInputChange} />
                                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white' }}>সাপ্তাহিক ট্রায়াল</span>
                                        </div>
                                        <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.4rem' }}>৳ ১৪০০</span>
                                    </label>
                                    <label style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '1.5rem',
                                        borderRadius: '20px',
                                        border: formData.package === 'monthly' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                        background: formData.package === 'monthly' ? 'rgba(249, 115, 22, 0.05)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div className="flex" style={{ marginBottom: '1rem' }}>
                                            <input type="radio" name="package" value="monthly" checked={formData.package === 'monthly'} onChange={handleInputChange} />
                                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white' }}>প্রফেশনাল মান্থলি</span>
                                        </div>
                                        <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.4rem' }}>৳ ৫০০০</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.4rem', fontSize: '1.2rem', fontWeight: '800' }}>অনুরোধ পাঠান</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default LandingPage;
