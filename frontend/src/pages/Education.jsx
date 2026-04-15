import { useState } from 'react'
import { BookOpen, Play, ChevronDown, ChevronUp, ExternalLink, Clock, Tag } from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    id: 1, category: 'Cycle Basics',
    title: 'Understanding Your Four Cycle Phases',
    readTime: '6 min', emoji: '🌸',
    summary: 'Learn what happens hormonally in each phase — Menstrual, Follicular, Ovulation, and Luteal — and how each affects your energy, mood, and body.',
    content: `Your menstrual cycle is divided into four distinct phases, each governed by shifting hormone levels.

**Menstrual Phase (Days 1–5)**
This phase begins on the first day of your period. Oestrogen and progesterone are at their lowest, causing the uterine lining to shed. You may feel fatigued, experience cramps, and have lower energy. This is a natural time for rest and gentle movement.

**Follicular Phase (Days 6–13)**
After bleeding stops, oestrogen begins rising as follicles in your ovaries mature. You typically feel more energetic, optimistic, and socially engaged during this phase. Cognitive sharpness often peaks here — great for tackling demanding projects.

**Ovulation Phase (Days 13–16)**
A surge of Luteinising Hormone (LH) triggers the release of an egg. Oestrogen peaks, and many people feel their most confident and communicative. Cervical mucus becomes clear and stretchy (resembling egg white), and BBT rises slightly after ovulation.

**Luteal Phase (Days 17–28)**
Progesterone rises to prepare the uterine lining. If fertilisation does not occur, both oestrogen and progesterone drop sharply, potentially causing PMS symptoms — bloating, mood changes, breast tenderness, and fatigue. This is the body preparing to shed the lining again.

Understanding your own pattern across these phases empowers you to plan your lifestyle around your biology rather than against it.`,
  },
  {
    id: 2, category: 'Nutrition',
    title: 'What to Eat During Each Phase of Your Cycle',
    readTime: '8 min', emoji: '🥗',
    summary: 'Cycle-syncing your diet can reduce PMS, boost energy, and support hormonal balance. Here is a phase-by-phase nutrition guide.',
    content: `**Menstrual Phase – Nourish and Replenish**
Iron-rich foods are essential: spinach, lentils, chickpeas, tofu, and jaggery help replenish iron lost through bleeding. Omega-3 fatty acids from walnuts, flaxseeds, and fatty fish reduce prostaglandin-driven cramps. Avoid processed foods, excess salt, and caffeine, which worsen bloating and mood.

**Follicular Phase – Build and Energise**
Rising oestrogen supports a more adventurous palate. Focus on fermented foods (curd, idli, kanji) for gut health, light proteins (eggs, dal, sprouts), and complex carbohydrates (brown rice, oats) for sustained energy.

**Ovulation Phase – Antioxidant Boost**
Your body is working hard. Anti-inflammatory foods like turmeric, berries, and leafy greens support the inflammatory process of ovulation. Raw vegetables and fresh fruits are easily digestible during this high-energy phase.

**Luteal Phase – Support Progesterone**
Magnesium-rich foods reduce PMS: dark chocolate (70%+), pumpkin seeds, banana, and avocado. B6 from chickpeas, potato, and chicken supports mood regulation. Reduce caffeine, which can amplify anxiety and breast tenderness. Small, frequent meals help manage blood sugar dips that worsen mood swings.

**Hydration**
Aim for 2–3 litres of water daily throughout your cycle. Herbal teas such as ginger, chamomile, and fenugreek are excellent choices during the luteal and menstrual phases.`,
  },
  {
    id: 3, category: 'Exercise',
    title: 'Exercising With Your Cycle: Phase-by-Phase Guide',
    readTime: '7 min', emoji: '🧘',
    summary: 'Your hormones significantly affect exercise performance and recovery. Here is how to train smarter by working with your cycle.',
    content: `**Menstrual Phase – Rest and Gentle Movement**
Low oestrogen and progesterone combined with cramping and fatigue call for gentle, restorative exercise. Yoga (particularly yin and restorative), slow walking, and light stretching are ideal. Avoid high-intensity training as it can exacerbate inflammation. Listen to your body — rest is productive.

**Follicular Phase – Build Strength**
Rising oestrogen increases strength, power, and pain tolerance. This is the best time for progressive strength training, high-intensity interval training (HIIT), or trying a new challenging class. Your muscles recover faster and you are less prone to injury during this phase.

**Ovulation Phase – Peak Performance**
Oestrogen peaks, and so does physical performance. Competitive sports, personal records, and long runs are best attempted now. Coordination and reaction time also peak around ovulation.

**Luteal Phase – Moderate and Steady**
Rising progesterone raises body temperature and reduces stamina. Switch to moderate-intensity, steady-state cardio (cycling, swimming, brisk walking), Pilates, or barre. Avoid comparing your performance to the follicular phase — the difference is physiological, not motivational.

**General Tips**
Always warm up for at least 10 minutes. Prioritise sleep — poor sleep exacerbates all cycle symptoms. Track your workouts alongside your cycle logs in SmartFlow to identify your personal performance patterns.`,
  },
  {
    id: 4, category: 'Wearables',
    title: 'How to Use a BBT Thermometer Correctly',
    readTime: '5 min', emoji: '🌡️',
    summary: 'Basal Body Temperature is one of the most reliable fertility and ovulation indicators. Here is how to measure it accurately.',
    content: `**What Is BBT?**
Basal Body Temperature (BBT) is your body's lowest resting temperature, measured immediately after waking before any activity. After ovulation, progesterone causes a sustained rise of 0.2–0.5°C that persists throughout the Luteal phase.

**How to Measure BBT Correctly**
1. Use a dedicated BBT thermometer — it measures to two decimal places (e.g., 36.48°C) unlike standard thermometers.
2. Measure at the same time every morning, within 30 minutes of your usual wake-up time.
3. Take the reading before getting out of bed, drinking water, or talking.
4. Measure orally, vaginally, or rectally — be consistent with the method across your cycle.
5. Log the reading immediately in SmartFlow's daily log.

**Reading Your BBT Chart**
A sustained rise (3+ days) above your pre-ovulation baseline (called the coverline) confirms that ovulation has occurred. A dip just before the rise is sometimes observed on the day of ovulation itself.

**Factors That Disrupt BBT**
Alcohol the night before, fever, poor sleep (<3 consecutive hours before measurement), shift work, travel across time zones, and some medications all affect BBT accuracy. Note these disruptions in your SmartFlow log.

**Integrating with SmartFlow**
SmartFlow's ML model uses your logged BBT readings as a key feature for phase prediction. Connect your Fitbit or Apple Watch to automatically sync wrist skin temperature as a BBT proxy, reducing the need for manual thermometer readings.`,
  },
  {
    id: 5, category: 'Tracking Tools',
    title: 'Cervical Mucus: Reading Your Fertility Signs',
    readTime: '6 min', emoji: '💧',
    summary: 'Cervical mucus changes throughout your cycle and is one of the most reliable natural fertility indicators. Here is how to observe and interpret it.',
    content: `**Why Cervical Mucus Matters**
Cervical mucus is produced by the cervix and its consistency changes dramatically under hormonal influence. Monitoring it alongside BBT and cycle day gives a multi-dimensional picture of your fertility status.

**The Five Types (SmartFlow Scale 1–5)**

**1 – Dry:** Little to no moisture. Typically present in early follicular phase after menstruation. Infertile signal.

**2 – Sticky:** Thick, dense, and might break when stretched. Appears as oestrogen begins rising. Generally infertile.

**3 – Creamy:** White or yellow, lotion-like consistency. Oestrogen continues rising. Possibly fertile zone beginning.

**4 – Watery:** Clear, thin, and slippery. Highly fertile — sperm can survive 3–5 days in this environment.

**5 – Egg White (Peak):** Clear, stretchy, and can be pulled between fingers for several centimetres. This is the peak fertility indicator and coincides closely with ovulation. Most fertile.

**How to Check**
Check internally (on toilet paper, or with a clean finger at the cervix) or externally at your vaginal opening. Check at the same time each day — mid-morning after using the toilet is most consistent.

**In SmartFlow**
Log your cervical mucus type each day. The ML model weights this heavily in fertility scoring. Selecting "EggWhite" or "Watery" will significantly increase your predicted fertility score.`,
  },
  {
    id: 6, category: 'Health Conditions',
    title: 'Understanding PCOS: Signs, Symptoms, and Next Steps',
    readTime: '9 min', emoji: '🔬',
    summary: 'Polycystic Ovary Syndrome affects 1 in 10 women of reproductive age in India. Here is what you need to know.',
    content: `**What Is PCOS?**
Polycystic Ovary Syndrome (PCOS) is a hormonal disorder characterised by elevated androgens (male hormones), irregular or absent ovulation, and/or multiple small follicles visible on the ovaries on ultrasound. It is the most common endocrine disorder in women of reproductive age.

**Common Signs and Symptoms**
- Irregular periods (fewer than 8 cycles per year) or very heavy periods
- Difficulty conceiving due to irregular ovulation
- Excess facial or body hair (hirsutism)
- Acne, particularly along the jawline and back
- Hair thinning or loss on the scalp
- Weight gain, particularly around the abdomen
- Skin darkening (acanthosis nigricans) at the neck or armpits
- Fatigue and mood changes

**Why Early Detection Matters**
PCOS significantly increases the risk of Type 2 diabetes, metabolic syndrome, sleep apnoea, and endometrial cancer if untreated. Women with PCOS who are pregnant have higher rates of gestational diabetes and preeclampsia.

**How SmartFlow Helps**
SmartFlow's Isolation Forest anomaly detection model can flag irregular hormonal patterns (particularly an elevated LH:FSH ratio >2, which is a clinical marker for PCOS) before a formal diagnosis. If the anomaly flag appears repeatedly, it is worth discussing with a gynaecologist or endocrinologist.

**Diagnosis and Management**
PCOS is diagnosed through blood tests (LH, FSH, testosterone, insulin, glucose), ultrasound, and clinical assessment. Management includes lifestyle modification (diet + exercise), hormonal medications, and in some cases insulin-sensitising agents like Metformin. Always consult a qualified specialist — see SmartFlow's Doctor Finder for specialists near you.`,
  },
  {
    id: 7, category: 'Dos and Don\'ts',
    title: 'Period Dos and Don\'ts: A Complete Guide',
    readTime: '7 min', emoji: '✅',
    summary: 'Evidence-based guidance on what to do and avoid during your period for comfort, health, and hygiene.',
    content: `**✅ DOs During Your Period**

**Hygiene**
- Change pads/tampons/menstrual cups every 4–6 hours (tampons max 8 hours).
- Wash hands before and after changing menstrual products.
- Menstrual cups: sterilise between cycles by boiling for 5–10 minutes.
- Period underwear: rinse in cold water before machine washing.
- Maintain regular bathing — warm water relieves cramps and maintains hygiene.

**Diet and Hydration**
- Eat iron-rich foods to replenish blood loss: spinach, beetroot, jaggery, lentils.
- Drink warm water and herbal teas (ginger, chamomile) to ease cramps.
- Eat small, frequent meals to stabilise blood sugar and energy.
- Include magnesium-rich foods (dark chocolate, pumpkin seeds) to reduce muscle cramps.

**Movement and Rest**
- Continue gentle exercise if tolerated — walking and yoga reduce prostaglandins.
- Prioritise 7–9 hours of sleep — melatonin and sleep quality affect cycle regularity.
- Use a hot water bottle or heating pad on your abdomen (20-minute sessions).

**Tracking**
- Log your symptoms in SmartFlow daily — even light days provide valuable data.
- Note flow heaviness, clot size, and pain level for clinical reference.

---

**❌ DON'Ts During Your Period**

**Diet**
- Avoid excess salt (increases bloating and water retention).
- Avoid caffeine in excess — it constricts blood vessels and worsens cramps.
- Avoid processed and fried foods — they increase inflammation.
- Avoid alcohol — it disrupts hormone metabolism and worsens mood swings.
- Avoid very cold drinks and ice cream if they worsen your cramps (individual variation).

**Hygiene**
- Do not use scented pads, wipes, or vaginal washes — they disrupt vaginal pH and can cause yeast infections.
- Do not leave a tampon in for more than 8 hours (risk of Toxic Shock Syndrome).
- Do not douche — the vagina is self-cleaning.
- Do not wear tight synthetic underwear — opt for breathable cotton.

**Activity**
- Avoid overexerting yourself if you are experiencing heavy flow or severe cramps.
- Do not ignore severe symptoms: soaking more than one pad per hour, clots larger than a 50-paise coin, or pain that does not respond to standard painkillers warrants medical attention.

**Mental Health**
- Do not dismiss PMS symptoms as weakness — they are physiological. Track them.
- Do not ignore significant mood changes — they may indicate PMDD (Premenstrual Dysphoric Disorder), which is treatable.`,
  },
  {
    id: 8, category: 'Mental Health',
    title: 'Managing PMS and PMDD: What You Need to Know',
    readTime: '8 min', emoji: '🧠',
    summary: 'PMS affects up to 75% of menstruating people. PMDD is a more severe form. Here is how to identify and manage both.',
    content: `**PMS vs PMDD**
Premenstrual Syndrome (PMS) refers to physical and emotional symptoms that occur in the 1–2 weeks before a period and resolve within a few days of menstruation starting. Premenstrual Dysphoric Disorder (PMDD) is a severe form affecting 3–8% of menstruating people, characterised by debilitating mood symptoms (severe depression, anxiety, irritability) that significantly impair daily functioning.

**Common PMS Symptoms**
Physical: bloating, breast tenderness, headaches, fatigue, acne, food cravings, disrupted sleep.
Emotional: irritability, mood swings, anxiety, difficulty concentrating, crying spells.

**PMDD Warning Signs**
If you experience any of the following in the 1–2 weeks before your period and they resolve after menstruation, speak to a doctor:
- Severe depression or feelings of hopelessness
- Intense anxiety or panic attacks
- Extreme irritability or anger that affects relationships
- Difficulty functioning at work or school
- Suicidal thoughts (seek immediate help: iCall India: 9152987821)

**Managing PMS Naturally**
- Regular aerobic exercise reduces PMS severity by up to 40% (study: Journal of Psychosomatic Obstetrics).
- Calcium supplementation (1000–1200mg daily) reduces mood and physical PMS symptoms.
- Reduce caffeine and alcohol in the luteal phase.
- Chasteberry (Vitex agnus-castus) has modest evidence for reducing breast tenderness and mood symptoms.
- Track symptoms in SmartFlow — a 2-cycle log showing consistent luteal-phase symptoms is the clinical standard for PMS/PMDD diagnosis.

**When to Seek Help**
If symptoms are not managed by lifestyle changes, a gynaecologist or psychiatrist can discuss SSRIs (taken continuously or only in the luteal phase), hormonal therapy, or cognitive behavioural therapy (CBT) — all with strong evidence for PMDD management.`,
  },
]

const VIDEOS = [
  { id: 1, title: 'The Menstrual Cycle Explained', channel: 'Osmosis',
    duration: '8:42', url: 'https://www.youtube.com/watch?v=2_owp8k5HUE',
    thumb: '🎬', topic: 'Cycle Basics',
    description: 'A clear, animated walkthrough of all four phases with hormonal graphs.' },
  { id: 2, title: 'How to Use a Menstrual Cup', channel: 'Ruby Cup',
    duration: '5:20', url: 'https://www.youtube.com/results?search_query=how+to+use+menstrual+cup',
    thumb: '🎬', topic: 'Tracking Tools',
    description: 'Step-by-step guide to folding, inserting, removing, and cleaning a menstrual cup.' },
  { id: 3, title: 'Understanding BBT Charting', channel: 'Fertility Friday',
    duration: '12:15', url: 'https://www.youtube.com/results?search_query=bbt+charting+tutorial',
    thumb: '🎬', topic: 'Tracking Tools',
    description: 'How to take, log, and interpret your Basal Body Temperature chart for cycle tracking.' },
  { id: 4, title: 'Yoga for Period Cramps', channel: 'Yoga with Adriene',
    duration: '20:00', url: 'https://www.youtube.com/watch?v=3OPBXByDPCs',
    thumb: '🎬', topic: 'Exercise',
    description: 'Gentle yoga flow specifically designed to relieve menstrual cramps and low back pain.' },
  { id: 5, title: 'PCOS Explained: Causes, Symptoms & Treatment', channel: 'Nucleus Medical Media',
    duration: '4:35', url: 'https://www.youtube.com/results?search_query=PCOS+explained',
    thumb: '🎬', topic: 'Health Conditions',
    description: 'Animated medical explanation of PCOS — what happens in the ovaries and why symptoms occur.' },
  { id: 6, title: 'Cervical Mucus Monitoring Tutorial', channel: 'Kindara',
    duration: '6:18', url: 'https://www.youtube.com/results?search_query=cervical+mucus+monitoring+fertility',
    thumb: '🎬', topic: 'Tracking Tools',
    description: 'Visual guide to identifying and tracking the five types of cervical mucus.' },
  { id: 7, title: 'Eating for Your Menstrual Cycle', channel: 'Pick Up Limes',
    duration: '15:00', url: 'https://www.youtube.com/results?search_query=eating+for+your+cycle+nutrition',
    thumb: '🎬', topic: 'Nutrition',
    description: 'A registered dietitian explains cycle syncing your diet for hormonal balance.' },
  { id: 8, title: 'PMS vs PMDD: Know the Difference', channel: 'Psych Hub',
    duration: '7:30', url: 'https://www.youtube.com/results?search_query=PMS+vs+PMDD+explained',
    thumb: '🎬', topic: 'Mental Health',
    description: 'Mental health educators explain when period mood changes cross into PMDD territory.' },
]

const CATEGORIES = ['All', 'Cycle Basics', 'Nutrition', 'Exercise', 'Tracking Tools',
                    'Health Conditions', "Dos and Don'ts", 'Mental Health']

// ── Components ────────────────────────────────────────────────────────────────
function ArticleCard({ article, onClick }) {
  return (
    <div onClick={() => onClick(article)}
      className="card cursor-pointer hover:shadow-md hover:border-rose/30 transition-all group">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{article.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-blush text-rose px-2 py-0.5 rounded-full font-medium">
              {article.category}
            </span>
            <span className="text-xs text-ink-soft flex items-center gap-1">
              <Clock size={11} /> {article.readTime} read
            </span>
          </div>
          <h3 className="font-display text-base text-ink group-hover:text-rose transition-colors leading-snug">
            {article.title}
          </h3>
          <p className="text-xs text-ink-soft font-body mt-1 line-clamp-2">{article.summary}</p>
        </div>
      </div>
    </div>
  )
}

function ArticleModal({ article, onClose }) {
  if (!article) return null
  const paragraphs = article.content.split('\n\n')

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
          <div className="sticky top-0 bg-white rounded-t-2xl flex items-center justify-between p-4
                          border-b border-blush z-10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{article.emoji}</span>
              <span className="text-xs bg-blush text-rose px-2 py-0.5 rounded-full">{article.category}</span>
            </div>
            <button onClick={onClose} className="text-ink-soft hover:text-rose p-1.5">✕</button>
          </div>
          <div className="p-5 overflow-y-auto max-h-[75vh]">
            <h2 className="font-display text-xl text-ink mb-1">{article.title}</h2>
            <p className="text-xs text-ink-soft mb-4 flex items-center gap-1">
              <Clock size={11} /> {article.readTime} read
            </p>
            <div className="space-y-3 font-body text-sm text-ink leading-relaxed">
              {paragraphs.map((para, i) => {
                if (para.startsWith('**') && para.endsWith('**') && para.split('**').length === 3) {
                  return <h4 key={i} className="font-semibold text-rose mt-4">{para.replace(/\*\*/g,'')}</h4>
                }
                if (para.startsWith('- ')) {
                  return <ul key={i} className="list-disc list-inside space-y-1 text-ink-soft pl-2">
                    {para.split('\n').map((l,j) => <li key={j}>{l.replace('- ','')}</li>)}
                  </ul>
                }
                const formatted = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VideoCard({ video }) {
  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer"
      className="card hover:shadow-md hover:border-rose/30 transition-all group block">
      <div className="bg-gradient-to-br from-blush to-white rounded-xl h-28 flex items-center
                      justify-center mb-3 relative overflow-hidden">
        <span className="text-5xl opacity-60">{video.thumb}</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-rose/90 flex items-center justify-center
                          shadow-lg group-hover:scale-110 transition-transform">
            <Play size={20} className="text-white ml-1" fill="white" />
          </div>
        </div>
      </div>
      <span className="text-[10px] bg-blush text-rose px-2 py-0.5 rounded-full">{video.topic}</span>
      <h3 className="font-medium text-sm text-ink mt-1.5 leading-snug group-hover:text-rose transition-colors">
        {video.title}
      </h3>
      <p className="text-xs text-ink-soft mt-1">{video.description}</p>
      <div className="flex items-center justify-between mt-2 text-xs text-ink-soft">
        <span>{video.channel}</span>
        <span className="flex items-center gap-1"><Clock size={10}/>{video.duration}</span>
      </div>
    </a>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Education() {
  const [tab, setTab]             = useState('articles')
  const [category, setCategory]   = useState('All')
  const [openArticle, setOpenArticle] = useState(null)
  const [search, setSearch]       = useState('')

  const filteredArticles = ARTICLES.filter(a =>
    (category === 'All' || a.category === category) &&
    (a.title.toLowerCase().includes(search.toLowerCase()) ||
     a.summary.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredVideos = VIDEOS.filter(v =>
    (category === 'All' || v.topic === category) &&
    (v.title.toLowerCase().includes(search.toLowerCase()) ||
     v.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fadeUp">
      <div className="mb-5">
        <h1 className="text-2xl font-display text-ink mb-0.5">Education Hub</h1>
        <p className="text-sm text-ink-soft font-body">
          Evidence-based articles and video guides for every phase of your cycle
        </p>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search articles and videos..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input-field mb-4"
      />

      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        {[['articles','📖 Articles'],['videos','▶️ Videos']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
              ${tab===key ? 'bg-rose text-white' : 'bg-blush text-rose hover:bg-blush-dark'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0
              ${category===cat ? 'bg-ink text-white' : 'bg-white border border-blush-dark text-ink-soft hover:border-rose/40'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'articles' ? (
        <div className="space-y-3">
          {filteredArticles.length === 0 ? (
            <p className="text-center text-ink-soft py-10 font-body">No articles found.</p>
          ) : filteredArticles.map(a => (
            <ArticleCard key={a.id} article={a} onClick={setOpenArticle} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVideos.length === 0 ? (
            <p className="text-center text-ink-soft py-10 font-body col-span-2">No videos found.</p>
          ) : filteredVideos.map(v => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}

      <ArticleModal article={openArticle} onClose={() => setOpenArticle(null)} />
    </div>
  )
}
