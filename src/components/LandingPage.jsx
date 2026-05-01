import React, { useState, useEffect } from 'react';
import toast from '../utils/toast';

const LandingPage = ({ onLoginClick }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        package: 'monthly'
    });
    const [showModal, setShowModal] = useState(false);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success(`ধন্যবাদ ${formData.name}! আপনার ${formData.package === 'monthly' ? 'মাসিক' : 'সাপ্তাহিক'} প্যাকেজের অনুরোধটি গ্রহণ করা হয়েছে। আমরা শীঘ্রই যোগাযোগ করবো।`);
        setShowModal(false);
    };

    const openModal = (pkg = 'monthly') => {
        setFormData(prev => ({ ...prev, package: pkg }));
        setShowModal(true);
    };

    return (
        <>
            {/* Page Content - Wrapped in transformation container */}
            <div className="landing-page animate-fade-in" style={{
                color: '#1e293b',
                background: '#ffffff',
                minHeight: '100vh',
                fontFamily: "'Hind Siliguri', sans-serif"
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
                    padding: '1rem 8%',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(15px)',
                    zIndex: 1000,
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <span style={{ fontSize: '2.2rem' }}>🍱</span>
                        <span>ফুড <span style={{ color: '#0f172a' }}>ক্যাটারিং</span> সার্ভিস</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <a href="#how-it-works" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>কিভাবে কাজ করে</a>
                        <a href="#packages" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>প্যাকেজসমূহ</a>
                        <button onClick={onLoginClick} className="btn-primary" style={{ padding: '0.7rem 2rem', borderRadius: '50px', fontSize: '1rem', fontWeight: '700' }}>
                            লগইন করুন
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
                    background: 'linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.3)), url("https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    padding: '120px 2rem 50px'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.92)',
                        padding: '4rem',
                        borderRadius: '40px',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                        backdropFilter: 'blur(10px)',
                        maxWidth: '1000px',
                        width: '100%',
                        border: '1px solid rgba(255,255,255,0.5)'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1.5rem',
                            background: 'rgba(5, 150, 105, 0.1)',
                            color: 'var(--primary)',
                            borderRadius: '50px',
                            fontWeight: '700',
                            marginBottom: '1.5rem',
                            fontSize: '1rem'
                        }}>
                            ✨ আপনার ঘরের স্বাদের নিশ্চয়তা
                        </div>
                        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', color: '#0f172a', lineHeight: '1.1', fontWeight: '900' }}>
                            শহরের সেরা <span style={{ color: 'var(--primary)' }}>খাবার</span> <br /> এখন আপনার দরজায়
                        </h1>
                        <p style={{ fontSize: '1.5rem', color: '#475569', marginBottom: '2.5rem', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
                            আমরা প্রতিদিন স্বাস্থ্যকর এবং ঘরোয়া স্বাদের দুপুরের ও রাতের খাবার সরবরাহ করি। আপনার ব্যস্ত জীবনে পুষ্টিকর খাবারের দুশ্চিন্তা ছাড়ুন আমাদের ওপর।
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                            <button onClick={() => openModal()} className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.3rem', borderRadius: '50px', fontWeight: '800', boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)' }}>
                                সাবস্ক্রিপশন প্যাকেজে যুক্ত হন
                            </button>
                            <button onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} className="btn-outline" style={{ padding: '1.2rem 3rem', fontSize: '1.3rem', borderRadius: '50px', fontWeight: '800', background: 'white' }}>
                                বিস্তারিত জানুন
                            </button>
                        </div>
                    </div>
                </header>

                {/* 3. How It Works Section */}
                <section id="how-it-works" style={{ padding: '8rem 2rem', background: '#ffffff' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <h2 style={{ fontSize: '3rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: '800' }}>কিভাবে আমরা কাজ করি?</h2>
                            <p style={{ color: '#64748b', fontSize: '1.3rem', maxWidth: '700px', margin: '0 auto' }}>খাবার অর্ডার করা এখন অনেক সহজ। মাত্র ৩টি ধাপে পৌঁছে যাবে আপনার প্রিয় খাবার।</p>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                            {[
                                { step: '০১', title: 'পছন্দ করুন', desc: 'আমাদের প্রতিদিনের ফ্রেশ মেনু থেকে আপনার প্রিয় খাবারটি পছন্দ করুন।', icon: '📱' },
                                { step: '০২', title: 'অর্ডার করুন', desc: 'সকাল ১০টার মধ্যে আপনার অর্ডারটি কনফার্ম করুন।', icon: '📝' },
                                { step: '০৩', title: 'ডেলিভারি নিন', desc: 'আমাদের রাইডার আপনার নির্দিষ্ট ঠিকানায় খাবার পৌঁছে দিবে।', icon: '🛵' }
                            ].map((item, i) => (
                                <div key={i} style={{
                                    padding: '3rem 2rem',
                                    background: '#f8fafc',
                                    borderRadius: '30px',
                                    textAlign: 'center',
                                    position: 'relative',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '60px',
                                        height: '60px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: '900',
                                        boxShadow: '0 10px 20px rgba(5, 150, 105, 0.2)'
                                    }}>{item.step}</div>
                                    <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>{item.icon}</div>
                                    <h3 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '1rem' }}>{item.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Menu Preview Section */}
                <section style={{ padding: '8rem 2rem', background: '#f8fafc' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
                            <div>
                                <h2 style={{ fontSize: '3rem', color: '#0f172a', marginBottom: '1rem', fontWeight: '800' }}>আমাদের নিয়মিত মেনু</h2>
                                <p style={{ color: '#64748b', fontSize: '1.2rem' }}>প্রতিদিন আমরা ভিন্ন ভিন্ন ঘরোয়া মেনু সরবরাহ করি।</p>
                            </div>
                            <button onClick={() => openModal()} className="btn-outline" style={{ background: 'white', padding: '1rem 2rem' }}>সবগুলো দেখুন</button>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
                            {[
                                { name: 'চিকেন কারি প্যাকেজ', price: '৳ ১৮০', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', tag: 'Lunch' },
                                { name: 'ফিশ দোপিয়াজা প্যাকেজ', price: '৳ ১৬০', img: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', tag: 'Lunch/Dinner' },
                                { name: 'চিকেন ভোনা খিচুড়ি', price: '৳ ২২০', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', tag: 'Special' }
                            ].map((item, i) => (
                                <div key={i} style={{
                                    background: 'white',
                                    borderRadius: '32px',
                                    overflow: 'hidden',
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.06)',
                                    transition: 'transform 0.3s'
                                }}>
                                    <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                                        <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'var(--primary)', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.9rem' }}>{item.tag}</div>
                                    </div>
                                    <div style={{ padding: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: '700' }}>{item.name}</h3>
                                            <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1.4rem' }}>{item.price}</span>
                                        </div>
                                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>সালাদ এবং সফট ড্রিংকস সহ পূর্ণাঙ্গ খাবার।</p>
                                        <button onClick={() => openModal()} style={{ width: '100%', background: '#f1f5f9', color: '#0f172a', padding: '1rem', borderRadius: '16px', fontWeight: '700' }}>অর্ডার করুন</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. Pricing/Packages Table Section */}
                <section id="packages" style={{ padding: '8rem 2rem', background: '#fcfcfc' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <h2 style={{ fontSize: '3rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: '800' }}>আমাদের সাবস্ক্রিপশন প্ল্যান</h2>
                            <p style={{ color: '#64748b', fontSize: '1.3rem' }}>নিয়মিত গ্রাহকদের জন্য সাবস্ক্রিপশন প্যাকেজে থাকবে বিশেষ মূল্যছাড়।</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 450px))', gap: '3rem', justifyContent: 'center' }}>
                            {/* Weekly Plan */}
                            <div style={{
                                padding: '4rem 3rem',
                                background: 'white',
                                borderRadius: '40px',
                                border: '1px solid #e2e8f0',
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>সাপ্তাহিক প্যাকেজ</h3>
                                <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem' }}>৳ ৭০০ <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: '400' }}>/ ৭ দিন</span></div>
                                <ul style={{ listStyle: 'none', padding: 10, textAlign: 'left', marginBottom: '2.5rem' }}>
                                    {['৭ দিন উন্নত মানের দুপুরের খাবার', 'প্রতিদিন ভিন্ন ভিন্ন মেনু', 'ফ্রী ডেলিভারি', 'সালাদ ও রাইতা সহ'].map((f, i) => (
                                        <li key={i} style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#475569' }}>✅ {f}</li>
                                    ))}
                                </ul>
                                <button onClick={() => openModal('weekly')} className="btn-outline" style={{ width: '100%', padding: '1.2rem', background: '#f8fafc' }}>বেছে নিন</button>
                            </div>

                            {/* Monthly Plan - Featured */}
                            <div style={{
                                padding: '4rem 3rem',
                                background: 'white',
                                borderRadius: '40px',
                                border: '3px solid var(--primary)',
                                textAlign: 'center',
                                boxShadow: '0 25px 50px rgba(5, 150, 105, 0.1)',
                                position: 'relative',
                                transform: 'scale(1.05)',
                                zIndex: 2
                            }}>
                                <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--primary)', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.9rem' }}>সেরা অফার</div>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>মাসিক প্যাকেজ</h3>
                                <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem' }}>৳ ২৪০০ <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: '400' }}>/ ৩০ দিন</span></div>
                                <ul style={{ listStyle: 'none', padding: 10, textAlign: 'left', marginBottom: '2.5rem' }}>
                                    {['৩০ দিন দুপুরের ও রাতের খাবার', 'মেনু পরিবর্তনের বিশেষ সুযোগ', 'ফ্রী সুপারফাস্ট ডেলিভারি', 'প্রতি সপ্তাহে একটি করে ডেজার্ট ফ্রী'].map((f, i) => (
                                        <li key={i} style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#475569' }}>✅ {f}</li>
                                    ))}
                                </ul>
                                <button onClick={() => openModal('monthly')} className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>সাবস্ক্রাইব করুন</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. FAQ Section */}
                <section style={{ padding: '8rem 2rem', background: '#ffffff' }}>
                    <div className="container" style={{ maxWidth: '800px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)</h2>
                            <p style={{ color: '#64748b' }}>আপনার কোনো প্রশ্ন থাকলে নিচের উত্তরগুলো দেখে নিতে পারেন।</p>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {[
                                { q: 'আপনারা কি প্রতিদিন খাবার সরবরাহ করেন?', a: 'হ্যাঁ, শুক্র ও শনিবার সহ সপ্তাহের ৭ দিনই আমরা খাবার সরবরাহ করে থাকি।' },
                                { q: 'অর্ডারের শেষ সময় কখন?', a: 'দুপুরের খাবারের জন্য সকাল ১০টা এবং রাতের খাবারের জন্য বিকেল ৫টার মধ্যে অর্ডার করতে হবে।' },
                                { q: 'আমি কি আমার মেনু পরিবর্তন করতে পারি?', a: 'মাসিক গ্রাহকদের জন্য ২৪ ঘণ্টা আগে অবগত করলে মেনু পরিবর্তনের সুবিধা রয়েছে।' },
                                { q: 'কিভাবে পেমেন্ট করবো?', a: 'আপনি বিকাশ (bKash) অথবা কার্ডের মাধ্যমে খুব সহজেই অ্যাপ থেকে পেমেন্ট করতে পারবেন।' }
                            ].map((item, i) => (
                                <details key={i} style={{
                                    background: '#f8fafc',
                                    padding: '1.5rem',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <summary style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>{item.q}</summary>
                                    <p style={{ marginTop: '1rem', color: '#64748b', lineHeight: '1.6' }}>{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. Footer - Detailed */}
                <footer style={{ padding: '6rem 2rem 3rem', background: '#0f172a', color: 'white' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                            <div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '2.5rem' }}>🍱</span>
                                    <span>ফুড ক্যাটারিং</span>
                                </div>
                                <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem' }}>আমরা আপনার তৃপ্তি এবং স্বাস্থ্যের কথা মাথায় রেখে প্রতিদিন সেরা উপকরণে ঘরোয়া খাবার রান্না করি।</p>
                                <div className="flex" style={{ gap: '1.5rem' }}>
                                    <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📘</span>
                                    <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📸</span>
                                    <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>🐦</span>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>লিঙ্কসমূহ</h4>
                                <ul style={{ listStyle: 'none', padding: 0, color: '#94a3b8' }}>
                                    <li style={{ marginBottom: '0.8rem', cursor: 'pointer' }}>হোম</li>
                                    <li style={{ marginBottom: '0.8rem', cursor: 'pointer' }}>প্যাকেজসমূহ</li>
                                    <li style={{ marginBottom: '0.8rem', cursor: 'pointer' }}>কিভাবে কাজ করে</li>
                                    <li style={{ marginBottom: '0.8rem', cursor: 'pointer' }}>টার্মস এন্ড কন্ডিশন</li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>যোগাযোগ</h4>
                                <ul style={{ listStyle: 'none', padding: 0, color: '#94a3b8' }}>
                                    <li style={{ marginBottom: '1rem' }}>📍 ধানমন্ডি, ঢাকা - ১২০৯</li>
                                    <li style={{ marginBottom: '1rem' }}>📞 +৮৮০ ১৮০০-XXXXXX</li>
                                    <li style={{ marginBottom: '1rem' }}>✉️ support@foodcatering.com</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
                            <p>&copy; ২০২৬ ফুড ক্যাটারিং সার্ভিস | সর্বস্বত্ব সংরক্ষিত</p>
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
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="animate-pop-in"
                        style={{
                            background: 'white',
                            color: '#1e293b',
                            padding: '3rem',
                            borderRadius: '40px',
                            width: '100%',
                            maxWidth: '550px',
                            boxShadow: '0 50px 120px rgba(0,0,0,0.5)',
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setShowModal(false)} style={{
                            position: 'absolute',
                            top: '25px',
                            right: '25px',
                            background: '#f1f5f9',
                            border: 'none',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            fontSize: '1.3rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                        }}>✕</button>

                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '2.2rem', color: '#0f172a', marginBottom: '0.8rem', fontWeight: '900' }}>সাবস্ক্রিপশন ফরম</h3>
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>সেরা প্যাকেজটি বেছে নিতে নিচের তথ্যগুলো দিন</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: '#334155' }}>আপনার পূর্ণ নাম</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                                    placeholder="আপনার নাম লিখুন"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: '#334155' }}>মোবাইল নাম্বার</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', border: '2px solid #f1f5f9', fontSize: '1rem' }}
                                    placeholder="০১৭XXXXXXXX"
                                />
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '1.2rem', fontWeight: '700', color: '#334155' }}>পছন্দের প্যাকেজ</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <label style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '1.5rem',
                                        borderRadius: '24px',
                                        border: formData.package === 'weekly' ? '3px solid var(--primary)' : '2px solid #f1f5f9',
                                        background: formData.package === 'weekly' ? 'rgba(5, 150, 105, 0.05)' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div className="flex" style={{ marginBottom: '0.8rem' }}>
                                            <input type="radio" name="package" value="weekly" checked={formData.package === 'weekly'} onChange={handleInputChange} />
                                            <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>সাপ্তাহিক</span>
                                        </div>
                                        <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1.3rem' }}>৳ ৭০০</span>
                                    </label>
                                    <label style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '1.5rem',
                                        borderRadius: '24px',
                                        border: formData.package === 'monthly' ? '3px solid var(--primary)' : '2px solid #f1f5f9',
                                        background: formData.package === 'monthly' ? 'rgba(5, 150, 105, 0.05)' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div className="flex" style={{ marginBottom: '0.8rem' }}>
                                            <input type="radio" name="package" value="monthly" checked={formData.package === 'monthly'} onChange={handleInputChange} />
                                            <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>মাসিক</span>
                                        </div>
                                        <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1.3rem' }}>৳ ২৪০০</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.4rem', fontSize: '1.2rem', borderRadius: '18px', fontWeight: '900', letterSpacing: '0.5px' }}>অনুরোধ পাঠান</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default LandingPage;
