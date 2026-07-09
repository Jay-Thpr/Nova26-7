import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Project = {
  slug: string
  name: string
  image: string
  screen: string
  label: string
  summary: string
  figmaNode: string
  timeline: string
  techStack: string
  teamMembers: string[]
  backgroundTitle: string
  background: string
  problem: string
  solutionIntro: string
  solutions: { title: string; body: string }[]
  testimonial?: string
  teamImages: string[]
}

const projects: Project[] = [
  {
    slug: 'mending-kids',
    name: 'Mending Kids',
    image: '/assets/mk-project.png',
    screen: '/assets/mk-screen.png',
    label: 'Dashboard',
    summary: 'A web-based inventory management system that lets MK staff log, categorize, and track medical supplies from donation to destination.',
    figmaNode: '256:2618',
    timeline: 'January 2026 - June 2026',
    techStack: 'React, Next.js, TypeScript, Supabase, Vercel, HTML, CSS',
    teamMembers: [
      'Project Leads: Aditi Karthik, Akhilesh Basetty, Himani Jha, Kasie Yang',
      'Developers: Clemente Irarrazaval, Alyssa Leung, Sunny Gandhari, Janani Acharya, Kian Shandi',
      'Designers: Edin Le, Linda Wang, Kai Davey',
    ],
    backgroundTitle: 'NonProfit BACKGROUND',
    background: 'Mending Kids provides life-changing surgical care to children worldwide by deploying volunteer medical teams and coordinating donated medical supplies for surgical missions.',
    problem: 'Mending Kids needed a clearer inventory workflow for tracking supplies from donation intake to categorization, expiration review, mission assignment, and destination handoff.',
    solutionIntro: 'Our team designed a dashboard-centered inventory system for Mending Kids staff.',
    solutions: [
      { title: 'Dashboard', body: 'The Dashboard acts as the primary anchor for users and supports general filtering.' },
      { title: 'Inventory Management', body: 'Staff can log, categorize, edit, and track medical supplies through a structured web interface.' },
      { title: 'Mission Assignment', body: 'Inventory can be associated with medical missions so supplies move from donation intake to destination.' },
    ],
    testimonial: '“This is much more like streamline process... there’s just less steps. It’s way better than what we’re working with now for sure!”',
    teamImages: ['/assets/figma/details/mk-team-1.png', '/assets/figma/details/mk-team-2.png'],
  },
  {
    slug: 'wags-walks',
    name: 'Wags & Walks',
    image: '/assets/wags-project.png',
    screen: '/assets/wags-screen.png',
    label: 'Inventory Management',
    summary: 'A webpage to centralize dog fosters, automate reminders, and consolidate resources into a user-friendly system.',
    figmaNode: '237:1366',
    timeline: 'January 2026 - June 2026',
    techStack: 'Next.js, Firebase, Google Apps Script, Google Sheets, Shelter Manager, Squarespace, Figma',
    teamMembers: [
      'Project Leads: Anusha Ladha, Ashley Varghese, Olivia Qi',
      'Developers: Tawny Huang, Jay Thapar, Shane Kuk, Clare Jin',
      'Designers: Maya Yoder, Nancy Tran',
    ],
    backgroundTitle: 'NonProfit BACKGROUND',
    background: 'Wags & Walks is a nonprofit dog rescue organization that depends on foster coordination, timely communication, and accessible foster resources to support its adoption and rescue work.',
    problem: 'Wags & Walks needed a more efficient way to track foster photo and survey submissions, follow up in a timely and organized manner, sort and search fosters, and maintain foster notes.',
    solutionIntro: 'Our team designed and built a new foster portal for Wags & Walks.',
    solutions: [
      { title: 'Foster Dashboard', body: 'Tracks foster photo and survey submissions so the team can follow up in a timely and organized manner.' },
      { title: 'Matching and Notes', body: 'Supports searching and sorting fosters by experience, key matching criteria, and detailed notes.' },
      { title: 'Resource Center', body: 'Organizes onboarding materials, educational guides, PDFs, videos, and FAQs into a searchable hub.' },
    ],
    testimonial: '“Working with the Nova team has been an incredibly positive experience for our organization, Wags & Walks. Their thoughtful, solutions-oriented approach and genuine investment in our mission have already made a meaningful impact on our foster program.” - Eitan Nir, Foster Lead, Wags & Walks',
    teamImages: ['/assets/figma/details/wags-team-1.png', '/assets/figma/details/wags-team-2.png'],
  },
  {
    slug: 'crjw',
    name: 'CRJW',
    image: '/assets/crjw-project.png',
    screen: '/assets/crjw-screen.png',
    label: 'Missions',
    summary: 'An external fund allocation platform that auto-imports donor and donation information into structured, usable data.',
    figmaNode: '237:1863',
    timeline: 'January 2026 - June 2026',
    techStack: 'React + Vite, Tailwind CSS, Firebase (Hosting & Cloud Functions), Parse Server, Resend, Figma, Ant Design',
    teamMembers: [
      'Project Leads: Lian Elsa Linton, Jimin Kim, Travis Ha, Katelyn Doanla',
      'Developers: Gokul Nambiar, Haydn Man, Edi Zhang, Viyan Dabke',
      'Designers: Sophia Kim, Katie Azuma, Tiffany Pham',
    ],
    backgroundTitle: 'NonProfit BACKGROUND',
    background: 'Center for Restorative Justice Works (CRJW) is a nonprofit organization dedicated to restoring relationships impacted by incarceration. CRJW supports children, families, and formerly incarcerated individuals through programs that promote connection, healing, and successful reentry into society.',
    problem: 'CRJW relies on donations to sustain its programs, internal needs, and serve families impacted by incarceration. While they have a functional donation intake system from multiple sources, workflows are highly manual, and they lack a centralized platform to allocate funding and store data long-term.',
    solutionIntro: 'Our team integrated fund allocation tools and automated donation tracking into CRJW’s existing internal platform.',
    solutions: [
      { title: 'Automated Donation Tracking', body: 'The updated platform syncs new donations collected through Harness Giving with CRJW’s internal database, eliminating ~90% of manual entry.' },
      { title: 'Centralized Fund Allocation System', body: 'Staff can allocate donation funds to various programs directly through the internal site, without cross-referencing donation data.' },
      { title: 'Allocation Analytics', body: 'All allocation trends are presented in filterable and exportable dashboards for ease of financial reporting, similar to QuickBooks-style reports.' },
      { title: 'Existing Site Improvements', body: 'Existing functionalities of the internal site have been updated for stylistic continuity and improved staff workflows.' },
    ],
    teamImages: ['/assets/figma/details/crjw-team-1.png', '/assets/figma/details/crjw-team-2.png'],
  },
]

const moreProjects = [
  ['SaveCanto', 'A web app to act as a volunteer management system and a refined map and table system for verifying/displaying Cantonese language learning programs.'],
  ['Project Ropa Offline Forms App', 'A check-ins app for volunteers to track deliveries of clean clothing to the homeless in LA.'],
  ['Coordinating Survival Kit Distribution', 'A system streamlining on-the-ground distribution of homeless aid packages by thousands of volunteers.'],
  ['iiDecide', 'A platform for anonymously connecting victims and survivors of sexual assault who have the same perpetrator.'],
  ['Oppia', 'Supporting free, interactive online learning opportunities for students with limited access to formal education.'],
  ['Gladeo', 'A pathway mapper web application to assist community college students in planning their coursework.'],
  ['Swipe Out Hunger', 'A donor-donee matching app allowing students to share swipes with those struggling from food insecurity.'],
  ['Westside Food Bank', 'A food pantry locator with information on the nearest available pantries.'],
  ['Friends of the Semel Institute', 'Data analysis of a UCLA nonprofit’s donor base to maximize donations toward mental health awareness and research.'],
  ['Beloved Beauty', 'A donor deck and user survey to support funding for victims of sex trafficking.'],
]

const partnerLogos = [
  { name: 'CRJW', src: '/assets/figma/logos/crjw.png' },
  { name: 'Wags & Walks', src: '/assets/figma/logos/wags.png' },
  { name: 'Mending Kids', src: '/assets/figma/logos/mending-kids.png' },
  { name: 'SaveCanto', src: '/assets/figma/logos/savecanto.png' },
  { name: 'Alzheimer’s San Diego', src: '/assets/figma/logos/asd.png' },
  { name: 'CoachArt', src: '/assets/figma/logos/coachart.png' },
  { name: 'oneAll', src: '/assets/figma/logos/oneall.png' },
  { name: 'HURIDOCS', src: '/assets/figma/logos/huridocs.png' },
  { name: 'Gravyty', src: '/assets/figma/logos/gravyty.png' },
  { name: 'Swipe Out Hunger', src: '/assets/figma/logos/swoh.png' },
  { name: 'Gladeo', src: '/assets/figma/logos/gladeo.png' },
  { name: 'Westside Food Bank', src: '/assets/figma/logos/wsfb.png' },
]
const teamPhotos = ['/assets/team-1.png', '/assets/team-2.png', '/assets/team-3.png', '/assets/team-4.png']

function usePath() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return path
}

function go(path: string) {
  if (`${window.location.pathname}${window.location.hash}` === path) return
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  const hash = path.split('#')[1]
  if (hash) {
    requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView())
  } else {
    window.scrollTo({ top: 0 })
  }
}

function Link({ href, children, className, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const isInternal = href.startsWith('/')
  return <a className={className} href={href} onClick={(event) => {
    if (isInternal) {
      event.preventDefault()
      go(href)
    }
    onClick?.(event)
  }} {...props}>{children}</a>
}

function Logo() {
  return <Link className="logo" href="/" aria-label="Nova home"><img src="/assets/figma/landing/nav-logo.svg" alt="" /></Link>
}

function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const links = [['About', '/#about'], ['Our Work', '/work'], ['Our Team', '/#team'], ['For Students', '/students'], ['For Nonprofits', '/nonprofits']]

  return <header className="header">
    <nav className="nav" aria-label="Main navigation">
      <Logo />
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      <div className={`nav-links ${open ? 'open' : ''}`}>
        {links.map(([label, href]) => <Link key={href} href={href} onClick={close}>{label}</Link>)}
        <a className="button button-solid" href="mailto:hello@novaforgood.org">Contact Us <ArrowUpRight size={15}/></a>
      </div>
    </nav>
  </header>
}

function Footer() {
  return <footer>
    <div className="footer-brand"><Logo/><strong>NOVA, TECH FOR GOOD</strong></div>
    <div className="footer-links">
      <Link href="/#about">About</Link>
      <Link href="/work">Work</Link>
      <Link href="/#team">Our Team</Link>
      <Link href="/students">For Students</Link>
    </div>
    <small>© 2026 nova for good | Last updated June 13, 2026</small>
  </footer>
}

function AppShell({ children }: { children: React.ReactNode }) {
  return <main id="top">
    <Header />
    {children}
    <Footer />
  </main>
}

function LandingPage() {
  return <AppShell>
    <section className="hero">
      <div className="stars" aria-hidden="true">✦　·　✧　　　　　　✦</div>
      <img className="orbit orbit-one" src="/assets/orbit.png" alt="" />
      <div className="hero-copy">
        <h1>N<span className="star-o">✦</span>VA</h1>
        <h2>Tech for Good</h2>
        <p>A team of UCLA students creating high-impact technical solutions that empower nonprofits to better serve disadvantaged communities.</p>
        <Link className="button button-gradient" href="/nonprofits">Work With Us <ArrowUpRight size={15}/></Link>
      </div>
    </section>

    <section className="photo-ribbon" id="team" aria-label="Nova team photos">
      {[...teamPhotos, ...teamPhotos].map((src, index) => <img key={index} src={src} alt={index < 4 ? 'Nova student team' : ''} />)}
    </section>

    <section className="about section-shell" id="about">
      <div className="about-card">
        <div><span className="eyebrow">Our community</span><h2>Who We Are</h2></div>
        <div>
          <ul className="figma-bullets">
            <li>Developers, designers, and innovators who love to solve problems.</li>
            <li>Students dedicated to learning about and supporting under-resourced communities.</li>
            <li>A team that strongly believes in making a difference.</li>
          </ul>
          <Link className="text-link" href="/students">Learn More <ArrowUpRight size={16}/></Link>
        </div>
      </div>
      <img className="planet" src="/assets/planet-ring.png" alt="" />
    </section>

    <section className="photo-ribbon ribbon-two" aria-hidden="true">
      {[...teamPhotos].reverse().concat(teamPhotos).map((src, index) => <img key={index} src={src} alt="" />)}
    </section>

    <ProjectsPreview />
    <NetworkSection />
    <CtaSection />
  </AppShell>
}

function ProjectsPreview() {
  return <section className="projects section-shell" id="work">
    <div className="section-heading"><span className="eyebrow">2025–2026</span><h2>Projects</h2><p>We partner with nonprofits across web development, mobile development, data science, and design.</p></div>
    <div className="project-grid">
      {projects.map(project => <ProjectCard project={project} key={project.slug} />)}
    </div>
    <Link className="button button-outline" href="/work">View Projects <ArrowUpRight size={15}/></Link>
  </section>
}

function ProjectCard({ project }: { project: Project }) {
  return <article className="project-card">
    <div className="project-image"><img src={project.image} alt={`${project.name} project preview`} /></div>
    <h3>{project.name}</h3>
    <p>{project.summary}</p>
    <Link href={`/work/${project.slug}`}>View project <ArrowUpRight size={15}/></Link>
  </article>
}

function NetworkSection() {
  return <section className="network section-shell">
    <div className="section-heading"><span className="eyebrow">Our partners</span><h2>Our Network</h2><p>Past and current partners who have trusted Nova to support mission-critical work.</p></div>
    <div className="logo-panel">{partnerLogos.map(logo => <img key={logo.name} src={logo.src} alt={logo.name} />)}</div>
  </section>
}

function CtaSection() {
  return <section className="cta" id="nonprofits"><div><span className="eyebrow">Build with Nova</span><h2>Interested?</h2><p>Whether you’re a nonprofit with a technical challenge or a UCLA student looking to use your skills for good, we’d like to hear from you.</p><div className="cta-actions"><Link className="button button-solid" href="/nonprofits">Work With Us <ArrowUpRight size={15}/></Link><Link className="button button-outline" href="/students">Join Nova <ArrowUpRight size={15}/></Link></div></div></section>
}

function WorkPage() {
  return <AppShell>
    <section className="page-hero work-hero">
      <span className="spark spark-left">✦</span><span className="spark spark-right">✦</span>
      <h1>Projects</h1>
      <p>Take a look at some of the projects we’ve worked on. Whether they’re web development, mobile development, data science, or design, our solutions have been able to serve a wide variety of nonprofits.</p>
    </section>
    <section className="featured-projects section-shell">
      {projects.map(project => <article className="featured-project" key={project.slug}>
        <div className="laptop"><img src={project.screen} alt={`${project.name} screen`} /></div>
        <h2>{project.name}</h2>
        <strong>{project.label}</strong>
        <p>{project.summary}</p>
        <Link href={`/work/${project.slug}`}>Open case study <ArrowUpRight size={15}/></Link>
      </article>)}
    </section>
    <section className="more-projects section-shell">
      <h2>...and more!</h2>
      <div className="project-list">
        {moreProjects.map(([name, description]) => <Link className="project-row" href="/work" key={name}><strong>{name}</strong><span>{description}</span><ArrowUpRight size={16}/></Link>)}
      </div>
    </section>
  </AppShell>
}

function NonprofitsPage() {
  return <AppShell>
    <section className="split-hero section-shell">
      <div><h1>For Nonprofits</h1><p>We partner with nonprofits to create technology solutions that address meaningful operational needs. From custom dashboards to data tools and workflow automation, our student teams scope, design, and build practical products with nonprofit partners.</p><a className="button button-outline" href="mailto:hello@novaforgood.org?subject=Nonprofit%20partnership">Work With Us <ArrowUpRight size={15}/></a></div>
      <img src="/assets/nonprofits-hero.png" alt="Nova team" />
    </section>
    <section className="looking-for section-shell">
      <h2>What We’re Looking For</h2>
      <div className="criteria-grid">
        <article><img src="/assets/team-1.png" alt="" /><h3>Community Impact</h3><p>A mission-driven organization addressing a real community need.</p></article>
        <article><img src="/assets/team-2.png" alt="" /><h3>Technical Need</h3><p>A software, data, or design problem where a custom technical solution can reduce friction.</p></article>
        <article><img src="/assets/team-3.png" alt="" /><h3>Commitment</h3><p>A partner team ready to collaborate through discovery, feedback, development, and handoff.</p></article>
      </div>
    </section>
    <section className="process section-shell">
      <h2>Project Structure</h2>
      <div className="timeline">
        {['Initial Call', 'User Research', 'Development', 'Handoff'].map((item, index) => <article key={item}><span>{index + 1}</span><h3>{item}</h3><p>{['Understand the nonprofit, problem space, and constraints.', 'Map workflows and define the product requirements.', 'Design, build, test, and iterate with partner feedback.', 'Deliver documentation and transition ownership.'][index]}</p></article>)}
      </div>
    </section>
    <section className="testimonials section-shell">
      <h2>Client Testimonials</h2>
      <div className="testimonial-stack">
        <blockquote>“Working with the Nova team has been an incredibly positive experience for our organization, Wags & Walks. Their thoughtful, solutions-oriented approach and genuine investment in our mission have already made a meaningful impact on our foster program.”<cite>— Eitan Nir, Foster Lead, Wags & Walks</cite></blockquote>
        <blockquote>“This is much more like streamline process... there’s just less steps. It’s way better than what we’re working with now for sure!”<cite>— Mary Zimmerman, Mending Kids</cite></blockquote>
      </div>
    </section>
    <NetworkSection />
    <CtaSection />
  </AppShell>
}

function StudentsPage() {
  const events = [
    ['Applications open', 'Tues, 9/22 | 5PM', 'tinyurl.com/nova2526'],
    ['Infosession #1', 'Tues, 9/29 | 8PM', 'in-person @ MS 5147'],
    ['Infosession #2', 'Wed, 9/30 | 7PM', 'on Zoom'],
    ['Applications Due', 'Fri, 10/2 | 11:59PM', ''],
    ['Meet & Greet', 'Tues, 10/6', 'Invite only'],
    ['Interviews', '10/12–15', 'Invite only'],
  ]
  const reflections = [
    ['Jimin Kim', 'Developer', 'i didn’t apply to a single club until my sophomore year out of fear of how intensive and competitive technical clubs can be. i just knew that i wanted to surround myself with people who work not for a line on a resume, but out of empathy and creativity. stalking nova’s instagram & EAF booth, it was clear that nova was exactly that :)'],
    ['Katelyn Doanla', 'Designer', 'Nova’s mission-driven approach to technology for social good resonates deeply with my values as a designer. I wanted to learn how to grow in this space and explore design’s potential to benefit people. Nova creates that environment where this people-first mindset is at the core of all our technical work!'],
    ['Anusha Ladha', 'Marketing director / Developer', 'It just seemed like such a fun group of creatives & i wanted a way to give back to the community in the way i knew best: through tech. i liked how nova mixed impact + creativity, and i wanted to be part of that energy.'],
    ['Akhilesh Basetty', 'Finance director / Developer', 'I was looking into tech clubs to get CS experience, and I found it really cool how Nova built projects for local nonprofits. I was super hyped to impact the local community while gaining technical experience.'],
    ['Lian Elsa Linton', 'Developer', 'Nova not only gives you the space to grow your technical experience, but it also gives you a really fun and amazing community that makes you feel at home :)'],
  ]

  return <AppShell>
    <section className="page-hero">
      <h1>Join Us!</h1>
      <p>At Nova, we’re building a team of developers and designers passionate about improving our communities through tech. We are so excited for you to join us this fall!</p>
    </section>
    <section className="students section-shell">
      <div className="student-banner"><span>✦</span><h2>Light the Way</h2><span>✦</span></div>
      <h3>Fall 2026 Recruitment</h3>
      <div className="event-list">{events.map(([name, date, detail]) => <article key={name}><strong>{name}</strong><span>{date}</span><small>{detail}</small></article>)}</div>
    </section>
    <section className="reflections section-shell">
      <h2>Why Nova?</h2>
      <div className="reflection-grid">
        {reflections.map(([name, role, quote]) => <article key={name}><h3>{name}</h3><strong>{role}</strong><p>{quote}</p></article>)}
      </div>
    </section>
  </AppShell>
}

function ProjectDetailPage({ project }: { project: Project }) {
  return <AppShell>
    <section className="figma-detail-hero" data-node-id={project.figmaNode}>
      <img className="detail-deco detail-star detail-star-left" src="/assets/figma/details/star2.png" alt="" />
      <img className="detail-deco detail-star detail-star-right" src="/assets/figma/details/star2.png" alt="" />
      <div className="figma-detail-gradient">
        <h1>{project.name}</h1>
        <div className="figma-laptop">
          <img src={project.screen} alt={`${project.name} product screen`} />
        </div>
      </div>
    </section>
    <section className="figma-case-study">
      <div className="figma-case-inner">
        <div className="figma-meta" data-node-id="detail-meta">
          <p><strong>Timeline:</strong> {project.timeline}</p>
          <p><strong>Tech Stack:</strong> {project.techStack}</p>
          <div><strong>Team Members:</strong><ul>{project.teamMembers.map(member => <li key={member}>{member}</li>)}</ul></div>
        </div>

        <section className="figma-copy-block">
          <h2>{project.backgroundTitle}</h2>
          <p>{project.background}</p>
        </section>

        <section className="figma-problem">
          <h2>The Problem</h2>
          <p>{project.problem}</p>
        </section>

        <section className="figma-copy-block">
          <h2>Our Solution</h2>
          <p>{project.solutionIntro}</p>
          <div className="figma-solution-grid">
            {project.solutions.map(solution => <article key={solution.title}>
              <h3>{solution.title}</h3>
              <p>{solution.body}</p>
            </article>)}
          </div>
        </section>

        {project.testimonial ? <section className="figma-testimonial">
          <h2>Client Testimonial</h2>
          <p>{project.testimonial}</p>
        </section> : null}

        <section className="figma-team">
          <h2>Our Team:</h2>
          {project.teamImages.map((src, index) => <img key={src} src={src} alt={`${project.name} team ${index + 1}`} />)}
        </section>

        <nav className="figma-detail-nav" aria-label="Project navigation">
          <Link className="button button-solid" href="/work">Previous Project</Link>
          <Link className="button button-solid" href="/work">All Projects</Link>
          <Link className="button button-solid" href="/work">Next Project</Link>
        </nav>
      </div>
    </section>
  </AppShell>
}

function NotFoundPage() {
  return <AppShell><section className="page-hero"><h1>Page not found</h1><p>This route is not implemented yet.</p><Link className="button button-solid" href="/">Back home</Link></section></AppShell>
}

function App() {
  const path = usePath()
  const normalizedPath = path.replace(/\/$/, '') || '/'
  const project = projects.find(item => normalizedPath === `/work/${item.slug}`)

  if (normalizedPath === '/') return <LandingPage />
  if (normalizedPath === '/work') return <WorkPage />
  if (normalizedPath === '/nonprofits') return <NonprofitsPage />
  if (normalizedPath === '/students') return <StudentsPage />
  if (project) return <ProjectDetailPage project={project} />
  return <NotFoundPage />
}

export default App
