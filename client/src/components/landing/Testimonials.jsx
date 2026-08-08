'use client';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  { name:'Arjun Sharma', role:'B.Tech CSE, VIT', avatar:'A', color:'#8B5CF6',
    text:'NoteNova completely changed how I prepare for exams. The Creative Notes feature generates visual booklets that are better than any textbook summary. Got 89% in my OS exam!', stars:5 },
  { name:'Priya Mehta', role:'MBBS, AIIMS Delhi', avatar:'P', color:'#10B981',
    text:'The PYQ Analyzer is a game changer. It identified that CRC and Sliding Window appear in every semester exam. I focused on those and cleared with distinction.', stars:5 },
  { name:'Rahul Gupta', role:'B.Sc Mathematics, DU', avatar:'R', color:'#F59E0B',
    text:'Focus Lock Pro helped me eliminate phone addiction during study hours. The 90-minute sessions with the AI coach are incredibly motivating. Best ₹99 I\'ve spent.', stars:5 },
  { name:'Sneha Iyer', role:'CA Final Student', avatar:'S', color:'#EC4899',
    text:'I use the AI Tutor in Socratic mode for complex accounting problems. It guides me to the answer instead of just giving it — I actually understand concepts now.', stars:5 },
  { name:'Karan Patel', role:'GATE Aspirant, IIT-JEE', avatar:'K', color:'#06B6D4',
    text:'Study Journey gave me a realistic 90-day roadmap for GATE preparation. Daily tasks, weak topic detection, and the revision tracker together are unbeatable.', stars:5 },
  { name:'Ananya Singh', role:'B.Com, Mumbai University', avatar:'A', color:'#F43F5E',
    text:'The Mistake Notebook automatically saved all my wrong quiz answers. I reviewed them before exams — it\'s like having a personalized error log. Scored 92%!', stars:5 },
];

export default function Testimonials() {
  return (
    <section id="testimonials" style={{ padding:'100px 24px', maxWidth:1200, margin:'0 auto' }}>
      <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }} style={{ textAlign:'center', marginBottom:60 }}>
        <span style={{ display:'inline-block', padding:'6px 18px', borderRadius:50,
          background:'rgba(236,72,153,0.1)', border:'1px solid rgba(236,72,153,0.25)',
          color:'#EC4899', fontSize:13, fontWeight:700, marginBottom:16 }}>
          Student Stories
        </span>
        <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, color:'var(--text-primary)', marginBottom:12 }}>
          Loved by <span className="gradient-text">Students Across India</span>
        </h2>
        <p style={{ fontSize:17, color:'var(--text-secondary)', maxWidth:480, margin:'0 auto' }}>
          Real students, real results. See how NoteNova is transforming exam preparation.
        </p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 }}>
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={i} initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:(i%3)*0.1 }}
            style={{ padding:'24px', borderRadius:20, background:'var(--bg-card)',
              border:'1px solid var(--border-color)', display:'flex', flexDirection:'column', gap:16 }}>
            {/* Stars */}
            <div style={{ display:'flex', gap:3 }}>
              {[...Array(t.stars)].map((_,j)=>(
                <span key={j} style={{ color:'#F59E0B', fontSize:15 }}>★</span>
              ))}
            </div>
            {/* Quote */}
            <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.7, flex:1,
              fontStyle:'italic' }}>"{t.text}"</p>
            {/* Author */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:`${t.color}20`,
                border:`2px solid ${t.color}40`, display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:15, fontWeight:800, color:t.color, flexShrink:0 }}>
                {t.avatar}
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{t.name}</p>
                <p style={{ fontSize:12, color:'var(--text-muted)' }}>{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
