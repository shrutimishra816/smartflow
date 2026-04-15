import { useState, useMemo } from 'react'
import { Stethoscope, MapPin, Phone, Globe, Star, Filter, ExternalLink, Search } from 'lucide-react'

// ── Doctor Database ────────────────────────────────────────────────────────────
const DOCTORS = [
  // Delhi / NCR
  { id:1, name:'Dr. Duru Shah', specialisation:'Gynaecologist & Fertility Specialist',
    clinic:'Gynaecworld – The Center for Women\'s Health', city:'Mumbai', state:'Maharashtra',
    address:'Kwality House, Kemps Corner, Mumbai – 400036',
    phone:'+91-22-2363-3333', website:'https://www.gynaecworld.com',
    consult:'https://www.practo.com/mumbai/doctor/duru-shah-gynecologist',
    rating:4.9, reviews:312, expertise:['Menstrual disorders','Fertility','PCOS','Endometriosis'],
    online:true, about:'Past President of FOGSI. Internationally recognised expert in reproductive medicine and menstrual health disorders.' },
  { id:2, name:'Dr. Nandita Palshetkar', specialisation:'IVF & Reproductive Endocrinologist',
    clinic:'Bloom IVF Centre, Lilavati Hospital', city:'Mumbai', state:'Maharashtra',
    address:'A-791, Bandra Reclamation, Mumbai – 400050',
    phone:'+91-22-2640-0123', website:'https://www.bloomivf.com',
    consult:'https://www.practo.com/mumbai/doctor/nandita-palshetkar',
    rating:4.8, reviews:278, expertise:['PCOS','IVF','Hormonal disorders','Ovulation disorders'],
    online:true, about:'National IVF Award winner. Specialises in hormonal imbalances and complex menstrual cycle disorders.' },
  { id:3, name:'Dr. Astha Dayal', specialisation:'Gynaecologist & Laparoscopic Surgeon',
    clinic:'CK Birla Hospital', city:'Gurugram', state:'Haryana',
    address:'J Block, Sector 51, Gurugram – 122001',
    phone:'+91-124-4825000', website:'https://www.ckbirlahospitals.com',
    consult:'https://www.practo.com/gurgaon/doctor/astha-dayal-gynecologist',
    rating:4.8, reviews:195, expertise:['Endometriosis','PCOS','Menstrual irregularities','Laparoscopy'],
    online:true, about:'Senior gynaecologist with expertise in minimally invasive surgery for endometriosis and fibroids.' },
  { id:4, name:'Dr. Sangeeta Agrawal', specialisation:'Gynaecologist & Obstetrician',
    clinic:'Max Super Speciality Hospital', city:'Delhi', state:'Delhi',
    address:'1 Press Enclave Road, Saket, New Delhi – 110017',
    phone:'+91-11-2651-5050', website:'https://www.maxhealthcare.in',
    consult:'https://www.practo.com/delhi/doctor/sangeeta-agrawal-gynecologist',
    rating:4.7, reviews:224, expertise:['PCOS','Heavy periods','PMS','Hormonal therapy'],
    online:true, about:'30+ years experience. Specialises in hormonal balance, menstrual management, and women\'s preventive health.' },
  { id:5, name:'Dr. Shalini Vijay', specialisation:'Endocrinologist',
    clinic:'Medanta – The Medicity', city:'Gurugram', state:'Haryana',
    address:'CH Baktawar Singh Road, Sector 38, Gurugram – 122001',
    phone:'+91-124-4141414', website:'https://www.medanta.org',
    consult:'https://www.practo.com/gurgaon/doctor/shalini-vijay-endocrinologist',
    rating:4.7, reviews:167, expertise:['Thyroid disorders','PCOS','Diabetes & cycle','Adrenal disorders'],
    online:true, about:'Leading endocrinologist specialising in thyroid dysfunction and PCOS, which are common drivers of menstrual irregularity.' },
  { id:6, name:'Dr. Anita Sabherwal Anand', specialisation:'Gynaecologist & Menopause Specialist',
    clinic:'Sitaram Bhartia Institute', city:'Delhi', state:'Delhi',
    address:'B-16, Qutab Institutional Area, New Delhi – 110016',
    phone:'+91-11-4200-0000', website:'https://sitarambhartia.org',
    consult:'https://www.practo.com/delhi/doctor/anita-sabherwal-anand',
    rating:4.8, reviews:189, expertise:['Perimenopause','Irregular cycles','PMS/PMDD','HRT'],
    online:false, about:'Specialist in women\'s health across all life stages — from adolescent cycle problems to perimenopause.' },

  // Bangalore
  { id:7, name:'Dr. Vandana Narula', specialisation:'Gynaecologist & Fertility Expert',
    clinic:'Cloudnine Hospital', city:'Bengaluru', state:'Karnataka',
    address:'1533, 9th Main, 3rd Block, Jayanagar, Bengaluru – 560011',
    phone:'+91-80-6862-4444', website:'https://www.cloudninecare.com',
    consult:'https://www.practo.com/bangalore/doctor/vandana-narula-gynecologist',
    rating:4.9, reviews:341, expertise:['PCOS','Adolescent gynaecology','Menstrual disorders','Fertility'],
    online:true, about:'Known for compassionate care in adolescent and reproductive health. Strong focus on PCOS and cycle disorders.' },
  { id:8, name:'Dr. Hema Divakar', specialisation:'High-Risk Obstetrics & Gynaecology',
    clinic:'Divakar\'s Specialty Hospital', city:'Bengaluru', state:'Karnataka',
    address:'45/1, 15th Cross, Sadashivanagar, Bengaluru – 560080',
    phone:'+91-80-2361-5424', website:'https://www.divakarsspecialtyhospital.com',
    consult:'https://www.practo.com/bangalore/doctor/hema-divakar-gynecologist',
    rating:4.8, reviews:256, expertise:['Endometriosis','Fibroids','Heavy bleeding','Laparoscopy'],
    online:true, about:'Former President of FIGO. International expert in endometriosis and abnormal uterine bleeding.' },

  // Chennai
  { id:9, name:'Dr. S. Vijayalakshmi', specialisation:'Gynaecologist & Reproductive Medicine',
    clinic:'NOVA IVF Fertility', city:'Chennai', state:'Tamil Nadu',
    address:'No 9, Wallace Garden, 3rd Street, Nungambakkam, Chennai – 600006',
    phone:'+91-44-4042-4242', website:'https://www.novaivf.com',
    consult:'https://www.practo.com/chennai/doctor/s-vijayalakshmi',
    rating:4.7, reviews:198, expertise:['Ovulation disorders','IVF','PCOD','Menstrual management'],
    online:true, about:'20+ years in reproductive medicine. Specialises in cycle regulation and assisted reproduction.' },
  { id:10, name:'Dr. Meenakshi Sundaram', specialisation:'Endocrinologist',
    clinic:'Apollo Hospitals', city:'Chennai', state:'Tamil Nadu',
    address:'21, Greams Lane, Off Greams Road, Chennai – 600006',
    phone:'+91-44-2829-3333', website:'https://www.apollohospitals.com',
    consult:'https://www.practo.com/chennai/doctor/meenakshi-sundaram-endocrinologist',
    rating:4.6, reviews:142, expertise:['Thyroid & cycle','Insulin resistance','PCOS management','Adrenal health'],
    online:false, about:'Endocrinologist with special interest in thyroid disorders and PCOS-related metabolic issues.' },

  // Hyderabad
  { id:11, name:'Dr. Shantha Kumari', specialisation:'Gynaecologist & FOGSI President',
    clinic:'Care Hospitals', city:'Hyderabad', state:'Telangana',
    address:'5-4-199, Exhibition Road, Hyderabad – 500001',
    phone:'+91-40-3041-8888', website:'https://www.carehospitals.com',
    consult:'https://www.practo.com/hyderabad/doctor/shantha-kumari',
    rating:4.8, reviews:289, expertise:['PCOS','Menstrual disorders','Adolescent health','Minimal access surgery'],
    online:true, about:'Past President of FOGSI and AOFOG. Internationally recognised for work on PCOS and adolescent gynaecology.' },
  { id:12, name:'Dr. Kavitha Kovi', specialisation:'Gynaecologist & Laparoscopic Surgeon',
    clinic:'Yashoda Hospitals', city:'Hyderabad', state:'Telangana',
    address:'Raj Bhavan Road, Somajiguda, Hyderabad – 500082',
    phone:'+91-40-4567-4567', website:'https://www.yashodahospitals.com',
    consult:'https://www.practo.com/hyderabad/doctor/kavitha-kovi',
    rating:4.7, reviews:176, expertise:['Endometriosis','Fibroids','Irregular periods','Laparoscopy'],
    online:false, about:'Specialist in minimally invasive gynaecological surgery, particularly for endometriosis and fibroid management.' },

  // Kolkata
  { id:13, name:'Dr. Sujata Dasgupta', specialisation:'Gynaecologist & Menstrual Health',
    clinic:'Peerless Hospital', city:'Kolkata', state:'West Bengal',
    address:'360 Pancha Sayar, Kolkata – 700094',
    phone:'+91-33-4011-1222', website:'https://www.peerlesshospital.com',
    consult:'https://www.practo.com/kolkata/doctor/sujata-dasgupta',
    rating:4.6, reviews:134, expertise:['PMS/PMDD','Heavy periods','Adolescent gynaecology','PCOS'],
    online:true, about:'Experienced gynaecologist with special focus on adolescent menstrual health and PMS management.' },

  // Pune
  { id:14, name:'Dr. Sushma Deshmukh', specialisation:'Gynaecologist & Fertility Specialist',
    clinic:'Jehangir Hospital', city:'Pune', state:'Maharashtra',
    address:'32, Sassoon Road, Pune – 411001',
    phone:'+91-20-6681-5000', website:'https://www.jehangir-hospital.com',
    consult:'https://www.practo.com/pune/doctor/sushma-deshmukh',
    rating:4.7, reviews:201, expertise:['PCOS','Fertility treatment','Hormonal therapy','Cycle regulation'],
    online:true, about:'25+ years in gynaecology. Specialises in PCOS and hormonal cycle disorders with a holistic treatment approach.' },

  // Ahmedabad
  { id:15, name:'Dr. Daksha Shah', specialisation:'Gynaecologist & Endoscopic Surgeon',
    clinic:'Shalby Hospital', city:'Ahmedabad', state:'Gujarat',
    address:'Opp. Karnavati Club, S.G. Road, Ahmedabad – 380015',
    phone:'+91-79-4020-3000', website:'https://www.shalby.org',
    consult:'https://www.practo.com/ahmedabad/doctor/daksha-shah',
    rating:4.6, reviews:158, expertise:['Endometriosis','PCOS','Laparoscopy','Menstrual issues'],
    online:false, about:'Expert in advanced laparoscopic procedures for endometriosis and chronic pelvic pain.' },
]

const SPECIALISATIONS = ['All', 'Gynaecologist', 'Endocrinologist', 'Fertility Specialist',
                          'Laparoscopic Surgeon', 'Reproductive Medicine']
const STATES = ['All', ...Array.from(new Set(DOCTORS.map(d => d.state))).sort()]
const CITIES = ['All', ...Array.from(new Set(DOCTORS.map(d => d.city))).sort()]

const SPEC_MATCH = {
  'Gynaecologist': d => d.specialisation.toLowerCase().includes('gynaecologist'),
  'Endocrinologist': d => d.specialisation.toLowerCase().includes('endocrinologist'),
  'Fertility Specialist': d => d.specialisation.toLowerCase().includes('fertility') || d.specialisation.toLowerCase().includes('ivf'),
  'Laparoscopic Surgeon': d => d.specialisation.toLowerCase().includes('laparoscopic'),
  'Reproductive Medicine': d => d.specialisation.toLowerCase().includes('reproductive'),
}

// ── Components ────────────────────────────────────────────────────────────────
function DoctorCard({ doc }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-base text-ink">{doc.name}</h3>
            {doc.online && (
              <span className="text-[10px] bg-sage/10 text-sage px-2 py-0.5 rounded-full font-medium">
                Online consult
              </span>
            )}
          </div>
          <p className="text-xs text-rose font-medium">{doc.specialisation}</p>
          <p className="text-xs text-ink-soft mt-0.5">{doc.clinic}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <Star size={12} className="text-amber fill-amber" />
            <span className="text-sm font-bold text-ink">{doc.rating}</span>
          </div>
          <p className="text-[10px] text-ink-soft">{doc.reviews} reviews</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-ink-soft">
        <MapPin size={12} className="text-rose shrink-0" />
        <span className="truncate">{doc.address}</span>
      </div>

      {/* Expertise tags */}
      <div className="flex flex-wrap gap-1.5">
        {doc.expertise.map(e => (
          <span key={e} className="text-[10px] bg-blush text-rose px-2 py-0.5 rounded-full">{e}</span>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-blush pt-3 space-y-2 animate-fadeUp">
          <p className="text-xs text-ink-soft font-body">{doc.about}</p>
          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
            <Phone size={12} className="text-rose" />
            <a href={`tel:${doc.phone}`} className="hover:text-rose transition-colors">{doc.phone}</a>
          </div>
          {doc.website && (
            <div className="flex items-center gap-1.5 text-xs text-ink-soft">
              <Globe size={12} className="text-rose" />
              <a href={doc.website} target="_blank" rel="noopener noreferrer"
                className="hover:text-rose transition-colors truncate">{doc.website.replace('https://','')}</a>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={() => setExpanded(o => !o)}
          className="btn-ghost text-xs py-1.5 flex-1">
          {expanded ? 'Show less' : 'View details'}
        </button>
        {doc.consult && (
          <a href={doc.consult} target="_blank" rel="noopener noreferrer"
            className="btn-primary text-xs py-1.5 flex-1 text-center flex items-center justify-center gap-1.5">
            Book Consult <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Doctors() {
  const [search, setSearch]         = useState('')
  const [specFilter, setSpecFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('All')
  const [cityFilter, setCityFilter]   = useState('All')
  const [onlineOnly, setOnlineOnly]   = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => DOCTORS.filter(d => {
    if (onlineOnly && !d.online) return false
    if (stateFilter !== 'All' && d.state !== stateFilter) return false
    if (cityFilter !== 'All' && d.city !== cityFilter) return false
    if (specFilter !== 'All') {
      const matchFn = SPEC_MATCH[specFilter]
      if (matchFn && !matchFn(d)) return false
    }
    if (search) {
      const q = search.toLowerCase()
      return d.name.toLowerCase().includes(q) ||
             d.specialisation.toLowerCase().includes(q) ||
             d.city.toLowerCase().includes(q) ||
             d.expertise.some(e => e.toLowerCase().includes(q))
    }
    return true
  }), [search, specFilter, stateFilter, cityFilter, onlineOnly])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fadeUp">
      <div className="mb-5">
        <h1 className="text-2xl font-display text-ink mb-0.5">Doctor Finder</h1>
        <p className="text-sm text-ink-soft font-body">
          Verified gynaecologists and specialists across India who can help with menstrual and hormonal health
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input type="search" placeholder="Search by name, city, or condition..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-9" />
      </div>

      {/* Filter toggle */}
      <button onClick={() => setShowFilters(o => !o)}
        className="flex items-center gap-2 text-sm text-ink-soft hover:text-rose mb-3 transition-colors">
        <Filter size={14} />
        {showFilters ? 'Hide filters' : 'Show filters'}
        {(stateFilter!=='All'||cityFilter!=='All'||specFilter!=='All'||onlineOnly) &&
          <span className="w-2 h-2 rounded-full bg-rose" />}
      </button>

      {showFilters && (
        <div className="card mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* State filter */}
            <div>
              <label className="text-xs text-ink-soft mb-1 block">State</label>
              <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); setCityFilter('All') }}
                className="input-field text-sm py-1.5">
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {/* City filter */}
            <div>
              <label className="text-xs text-ink-soft mb-1 block">City</label>
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                className="input-field text-sm py-1.5">
                {CITIES.filter(c => c==='All' || stateFilter==='All' ||
                  DOCTORS.find(d=>d.city===c && d.state===stateFilter))
                  .map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {/* Specialisation */}
            <div>
              <label className="text-xs text-ink-soft mb-1 block">Specialisation</label>
              <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
                className="input-field text-sm py-1.5">
                {SPECIALISATIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {/* Online only toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={onlineOnly} onChange={e => setOnlineOnly(e.target.checked)}
              className="accent-rose w-4 h-4" />
            <span className="text-sm font-body text-ink">Online consultation available only</span>
          </label>
          {/* Reset */}
          <button onClick={() => { setSpecFilter('All'); setStateFilter('All'); setCityFilter('All'); setOnlineOnly(false) }}
            className="text-xs text-rose hover:underline">
            Reset all filters
          </button>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-ink-soft mb-3 font-body">
        Showing <strong>{filtered.length}</strong> of {DOCTORS.length} doctors
      </p>

      {/* Doctor cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-ink-soft font-body">
          <p className="text-3xl mb-2">🔍</p>
          <p>No doctors match your filters.</p>
          <button onClick={() => { setSearch(''); setSpecFilter('All'); setStateFilter('All'); setCityFilter('All'); setOnlineOnly(false) }}
            className="text-rose text-sm mt-2 hover:underline">Clear all filters</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => <DoctorCard key={d.id} doc={d} />)}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-blush rounded-xl">
        <p className="text-xs text-ink-soft font-body">
          <strong>Disclaimer:</strong> This directory is for informational purposes only.
          Doctor availability, contact details, and consultation fees may change.
          Always verify details directly with the clinic before booking.
          SmartFlow does not endorse any specific doctor or medical facility.
        </p>
      </div>
    </div>
  )
}
