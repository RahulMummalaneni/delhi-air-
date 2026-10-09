import Effects from '../components/Effects'
import BreathMap from '../components/BreathMap'
import JoinForm from '../components/JoinForm'

const whyCards = [
  ['WHAT I KNOW', 'Communication, brand building, community, participation and how people respond to information.'],
  ['WHAT I DO NOT CLAIM', 'I am not an environmental scientist, atmospheric chemist or policymaker.'],
  ['WHAT I WANT TO STUDY', 'How aware are people? How is pollution affecting their everyday lives? What are they already doing to cope? Where do they feel helpless? What would help them feel enough agency to participate more meaningfully?'],
  ['WHAT I WILL BUILD', 'Research, conversations, simple tools, masterclasses and a public record of the results.'],
]

const stages = [
  ['01 · RESEARCH', 'Understand', 'Use thorough citizen surveys, lived experiences, recurring feedback and solution testing to understand how people experience pollution and what they already know or do.'],
  ['02 · CONVERSATIONS', 'Listen', 'Speak with experts, doctors, public-health professionals, environmental practitioners, researchers and citizens to challenge assumptions and sharpen the project.'],
  ['03 · TOOL BUILDING', 'Build', 'Prototype simple tools that make information more understandable and actionable.'],
  ['04 · MASTERCLASSES', 'Learn', 'Bring people together around air, health, cities, data, law, communication and community action.'],
  ['05 · RESULTS', 'Publish', 'Release findings, limitations, tools, recommendations and what the experiment failed to solve.'],
]

const help = [
  ['Answer', 'Take short surveys about what you understand, experience and do when the air gets worse.'],
  ['Test', 'Try prototypes and tell me whether they make the problem clearer or more actionable.'],
  ['Join', 'Participate in small conversations, masterclasses or community experiments when relevant.'],
]

export default function Home() {
  return (
    <>
      <Effects />
      <div className="wrap">
        <nav>
          <div className="brand">THE 10,000 BREATHS PROJECT</div>
          <a className="nav-cta" href="#join">Join the project</a>
        </nav>

        <main>
          <section className="hero" style={{ borderTop: 0 }}>
            <div>
              <div className="kicker">A 12-WEEK CITIZEN EXPERIMENT IN DELHI NCR</div>
              <h1>
                Delhi talks about pollution every winter. <span className="accent">How does it affect you?</span>
              </h1>
              <p className="hero-copy">
                The 10,000 Breaths Project is a citizen-led experiment to understand how Delhi NCR experiences air pollution, what people actually know, where they feel powerless, and what could move us from knowing to agency to participation.
              </p>
              <div className="cta-row">
                <a className="btn btn-primary" href="#join">Add your breath</a>
                <a className="btn btn-secondary" href="#how">See how it works</a>
              </div>
              <div className="hero-note">3 minutes to join.</div>
            </div>

            <div className="goal-card">
              <div className="goal-label">THE GOAL</div>
              <div id="goal-number" className="goal-number" data-count="10000">10,000</div>
              <div className="goal-sub">citizen responses, stories, observations and actions</div>
            </div>
          </section>

          <section id="why">
            <div className="why-grid">
              <div className="why-intro">
                <div className="kicker">WHY I AM DOING THIS</div>
                <h2>
                  I got tired of ending every pollution conversation with the same sentence: <span className="accent">someone should do something.</span>
                </h2>
                <p className="lead">
                  I want to research openly, talk to ordinary citizens, learn from practitioners where possible, build simple tools, run conversations and masterclasses, and publish what works as well as what fails.
                </p>
              </div>
              <div className="why-cards">
                {whyCards.map(([title, text]) => (
                  <div className="why-card" key={title}>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="how">
            <div className="kicker">HOW IT WORKS</div>
            <h2>Delhi knows the problem. <span className="accent">What turns knowing into agency?</span></h2>
            <div className="stage-wrap">
              {stages.map(([num, title, text]) => (
                <div className="stage" key={num}>
                  <div className="stage-num">{num}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="kicker">DELHI NCR RIGHT NOW</div>
            <h2>Breaths getting <span className="accent">affected</span> in Delhi NCR right now.</h2>
            <p className="lead" style={{ maxWidth: 880 }}>
              Every marker on this map represents a person who has added their breath to the project. As more people join, the map becomes a visual record of how widely this issue is felt across Delhi NCR.
            </p>
            <div className="breath-map-wrap">
              <div className="breath-stats">
                <div className="stat-box">
                  <div id="total-count" className="stat-number stat-highlight" data-count="10000">10,000</div>
                  <div className="stat-label">breaths this project aims to hear from</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number stat-highlight">Delhi NCR</div>
                  <div className="stat-label">one region, thousands of lived experiences</div>
                </div>
                <p className="small" style={{ marginTop: 18 }}>
                  In the live version, every person who joins can appear as a dot on the map. Over time, this can show where the project is spreading and how people across NCR are participating.
                </p>
              </div>
              <BreathMap />
            </div>
          </section>

          <section>
            <div className="kicker">HOW YOU CAN HELP</div>
            <h2>You do not need to be an expert.</h2>
            <div className="grid3">
              {help.map(([title, text]) => (
                <div className="card" key={title}>
                  <h3 className="accent">{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="founder-section">
            <div className="founder-grid">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/founder.jpg" alt="Shashank Sharma, founder of The 10,000 Breaths Project" />
              <div>
                <div className="founder-label">Founder</div>
                <h2 className="founder-name">Shashank Sharma</h2>
                <p className="founder-bio">
                  I am a brand and communications leader who has worked across financial services, education, media and social impact. Much of my professional life has involved understanding how people receive information, build trust and make decisions.
                </p>
                <p className="founder-bio">
                  Over the last two years, I have taken that curiosity outside work and into community building. I built Anti-Fragile Circle around a simple question: can a digital community become meaningful social infrastructure, rather than another stream of messages competing for attention?
                </p>
                <p className="founder-bio">
                  The 10,000 Breaths Project is the next experiment in that journey. Delhi NCR does not suffer from a lack of information about pollution. We have data, experts, research, policies and an annual public conversation. What interests me is the gap between <span className="accent">knowing, agency and participation</span>.
                </p>
                <p className="founder-bio">
                  Can better communication, stronger communities and simpler tools reduce that gap? I do not know the answer yet. That is precisely why I am building this project.
                </p>
                <p className="small">This is an independent citizen initiative. Technical claims and recommendations will be sourced to credible scientific and official evidence.</p>
              </div>
            </div>
          </section>

          <section className="pullquote-section">
            <div className="pullquote">
              <blockquote>
                “The most dangerous stage of a public crisis is when everyone understands the problem, but nobody believes their participation can change the outcome.”
              </blockquote>
              <cite>Shashank Sharma, Founder, The 10,000 Breaths Project</cite>
            </div>
          </section>

          <section id="join">
            <div className="signup">
              <div>
                <div className="kicker">JOIN THE PROJECT</div>
                <h2>Add your breath.</h2>
                <p className="lead">
                  If you live, work, study or spend significant time in Delhi NCR, join the project. Your response will help shape the survey, test the tools and decide which questions are worth pursuing.
                </p>
              </div>
              <JoinForm />
            </div>
          </section>
        </main>

        <footer>
          The 10,000 Breaths Project · Delhi NCR · 2026<br />
          Independent citizen research and participation experiment.
        </footer>
      </div>
    </>
  )
}
