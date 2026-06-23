import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useState } from 'react'

const projects = [
  { name: 'Mending Kids', image: '/assets/mk-project.png', description: 'An operations platform that helps care teams coordinate patients, trips, and medical missions.' },
  { name: 'Wags & Walks', image: '/assets/wags-project.png', description: 'A foster portal designed to streamline matching, resources, surveys, and communication.' },
  { name: 'CRJW', image: '/assets/crjw-project.png', description: 'A centralized donation and fund-allocation system built for long-term nonprofit reporting.' },
]

const teamPhotos = ['/assets/team-1.png', '/assets/team-2.png', '/assets/team-3.png', '/assets/team-4.png']

function Logo() {
  return <a className="logo" href="#top" aria-label="Nova home"><span>✦</span><b>N</b></a>
}

function Header() {
  const [open, setOpen] = useState(false)
  const links = [['About', '#about'], ['Our Work', '#work'], ['Our Team', '#team'], ['For Students', '#students'], ['For Nonprofits', '#nonprofits']]
  return <header className="header">
    <nav className="nav" aria-label="Main navigation">
      <Logo />
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      <div className={`nav-links ${open ? 'open' : ''}`}>
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="button button-solid" href="mailto:hello@novaforgood.org">Contact Us <ArrowUpRight size={15}/></a>
      </div>
    </nav>
  </header>
}

function App() {
  return <main id="top">
    <Header />
    <section className="hero">
      <div className="stars" aria-hidden="true">✦　·　✧　　　　　　✦</div>
      <img className="orbit orbit-one" src="/assets/orbit.png" alt="" />
      <div className="hero-copy">
        <h1>N<span className="star-o">✦</span>VA</h1>
        <h2>Tech for Good</h2>
        <p>A team of UCLA students creating high-impact technical solutions that empower nonprofits to better serve disadvantaged communities.</p>
        <a className="button button-gradient" href="#nonprofits">Work With Us <ArrowUpRight size={15}/></a>
      </div>
    </section>

    <section className="photo-ribbon" id="team" aria-label="Nova team photos">
      {[...teamPhotos, ...teamPhotos].map((src, index) => <img key={index} src={src} alt={index < 4 ? 'Nova student team' : ''} />)}
    </section>

    <section className="about section-shell" id="about">
      <div className="about-card">
        <div><span className="eyebrow">Our community</span><h2>Who We Are</h2></div>
        <div><p>Developers, designers, and businesspeople who love solving meaningful problems. We learn directly from under-resourced communities and build with care, curiosity, and rigor.</p><a className="text-link" href="#team">Learn More <ArrowUpRight size={16}/></a></div>
      </div>
      <img className="planet" src="/assets/planet-ring.png" alt="" />
    </section>

    <section className="photo-ribbon ribbon-two" aria-hidden="true">
      {[...teamPhotos].reverse().concat(teamPhotos).map((src, index) => <img key={index} src={src} alt="" />)}
    </section>

    <section className="projects section-shell" id="work">
      <div className="section-heading"><span className="eyebrow">2025–2026</span><h2>Projects</h2><p>We partner with nonprofits to turn complex operational challenges into thoughtful, sustainable products—from research and design through implementation.</p></div>
      <div className="project-grid">
        {projects.map(project => <article className="project-card" key={project.name}><div className="project-image"><img src={project.image} alt={`${project.name} project preview`} /></div><h3>{project.name}</h3><p>{project.description}</p><a href="#nonprofits" aria-label={`Learn about ${project.name}`}>View project <ArrowUpRight size={15}/></a></article>)}
      </div>
      <a className="button button-outline" href="#work">View Projects <ArrowUpRight size={15}/></a>
    </section>

    <section className="network section-shell">
      <div className="section-heading"><span className="eyebrow">Our partners</span><h2>Our Network</h2><p>We’re grateful to the organizations who trust us with their missions and help us better understand the social sector.</p></div>
      <div className="logo-panel"><img src="/assets/crjw-logo.png" alt="CRJW"/><img src="/assets/wags-logo.png" alt="Wags & Walks"/><img src="/assets/mk-logo.png" alt="Mending Kids"/><span>ALZHEIMER'S<br/>SAN DIEGO</span><span>COACHART</span><span>HURIDOCS</span><span>GRAVYTY</span><span>GLADEO</span><span>WESTSIDE<br/>FOOD BANK</span></div>
    </section>

    <section className="cta" id="nonprofits"><div><span className="eyebrow">Build with Nova</span><h2>Interested?</h2><p>Whether you’re a nonprofit with a technical challenge or a UCLA student looking to use your skills for good, we’d like to hear from you.</p><div className="cta-actions"><a className="button button-solid" href="mailto:hello@novaforgood.org">Work With Us <ArrowUpRight size={15}/></a><a className="button button-outline" id="students" href="mailto:hello@novaforgood.org?subject=Student%20interest">Join Nova <ArrowUpRight size={15}/></a></div></div></section>

    <footer><div className="footer-brand"><Logo/><strong>NOVA, TECH FOR GOOD</strong></div><div className="footer-links"><a href="#about">About</a><a href="#work">Work</a><a href="#team">Our Team</a><a href="#students">For Students</a></div><small>© 2026 Nova for Good · hello@novaforgood.org</small></footer>
  </main>
}

export default App
