import "./App.css";
import packageJson from "../package.json";

import AKFDEV_Logo from "./assets/AKFDEV_Logo.png";
import consoleHero from "./docs/screenshot2.png";
import accountNameAnnotated from "./assets/feature-icon1.png";
import popupLight from "./assets/popup-light.png";
import popupDark from "./assets/popup-dark.png";
import popupSettings from "./assets/popup-settings.png";
import popupConsole from "./assets/popup-console.png";
import permissionsImg from "./docs/permissions.png";
import plugPermission from "./docs/plug-permission.png";
import plugPermission2 from "./docs/plug-permission2.png";

const CHROME_URL =
  "https://chromewebstore.google.com/detail/aws-console-title-bar/jhenfbkjfncfbimbkhakchbdefigenfp";
const FIREFOX_URL =
  "https://addons.mozilla.org/en-GB/firefox/addon/aws-console-title-bar/";
const REPO_URL = "https://github.com/just-ak/AWS-Console-Tittle-Bar";
const ISSUES_URL = "https://github.com/just-ak/AWS-Console-Tittle-Bar/issues";

function FirefoxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="store-btn__glyph"
    >
      <path
        fill="currentColor"
        d="M12 1.7a10.3 10.3 0 1 0 0 20.6 10.3 10.3 0 0 0 0-20.6Zm0 1.9a8.4 8.4 0 0 1 6.2 2.7c-1-.5-2.2-.8-3.4-.7 1.6.7 2.8 2 3.4 3.6.3.9.4 1.9.2 2.8-.3-1.6-1.4-3-2.9-3.6a4.9 4.9 0 0 0-4.6.4c-1 .7-1.6 1.7-1.6 2.6 0 .6.2 1.2.7 1.6-.9-.3-1.6-1-1.9-1.9-.4-1.2-.1-2.5.7-3.4-1.3.5-2.3 1.6-2.8 2.9-.5 1.5-.3 3.1.6 4.4A8.4 8.4 0 0 1 12 3.6Z"
      />
    </svg>
  );
}

function ChromeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="store-btn__glyph"
    >
      <path
        fill="currentColor"
        d="M12 1.8a10.2 10.2 0 0 1 8.9 5.2h-8.9a5 5 0 0 0-4.7 3.3L3.9 3.9A10.2 10.2 0 0 1 12 1.8ZM2.6 5.6l4.3 7.5a5 5 0 0 0 4.1 2.9l-3.4 5.9A10.2 10.2 0 0 1 2.6 5.6Zm18.6 2.9a10.2 10.2 0 0 1-9.6 13.7l4.4-7.6a5 5 0 0 0 .3-5.1ZM12 8.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z"
      />
    </svg>
  );
}

function StoreButtons({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "store-row store-row--compact" : "store-row"}>
      <a className="store-btn store-btn--primary" href={FIREFOX_URL}>
        <FirefoxIcon />
        <span>
          <small>Get it for</small>
          Firefox
        </span>
      </a>
      <a className="store-btn" href={CHROME_URL}>
        <ChromeIcon />
        <span>
          <small>Get it for</small>
          Chrome
        </span>
      </a>
    </div>
  );
}

function App() {
  const year = new Date().getFullYear();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="nav">
        <div className="nav__inner">
          <a className="nav__brand" href="#top">
            <img src={AKFDEV_Logo} alt="" width={84} height={22} />
            <span>AWS Console Title Bar</span>
          </a>
          <nav className="nav__links" aria-label="Sections">
            <a href="#features">Features</a>
            <a href="#install">Install</a>
            <a href="#privacy">Privacy</a>
            <a href="#faq">FAQ</a>
            <a href={REPO_URL}>GitHub</a>
          </nav>
          <a className="nav__cta" href="#install">
            Add it free
          </a>
        </div>
      </header>

      <main id="main">
        {/* ---------------------------------------------------------------- */}
        <section className="hero" id="top">
          <div className="hero__inner">
            <p className="eyebrow">
              <span className="dot" aria-hidden="true" />
              Free and open source · Chrome &amp; Firefox
            </p>

            <h1>
              Know which AWS account you&rsquo;re in.
              <em> At a glance.</em>
            </h1>

            <p className="hero__sub">
              Every AWS console looks exactly the same, whether you&rsquo;re in
              a sandbox or in production. This extension puts the account name
              &mdash; in a colour you choose &mdash; right into the console
              header, so you can see where you are before you click anything.
            </p>

            <StoreButtons />

            <p className="hero__meta">
              No sign-up. No subscription. No telemetry. Just install it and it
              works.
            </p>

            <figure className="hero__shot">
              <img
                src={consoleHero}
                alt="The AWS console header showing the account name 'Sandbox' highlighted in green next to the signed-in role"
                width={1834}
                height={532}
                loading="eager"
              />
              <figcaption>
                That green <code>Sandbox</code> label is the extension. It
                follows you across every page of the console.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="trust" aria-label="At a glance">
          <ul className="trust__list">
            <li>
              <strong>£0</strong>
              Free forever
            </li>
            <li>
              <strong>0</strong>
              Network requests
            </li>
            <li>
              <strong>2</strong>
              Browsers supported
            </li>
            <li>
              <strong>MV3</strong>
              Manifest v3
            </li>
            <li>
              <strong>Open</strong>
              Source on GitHub
            </li>
          </ul>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="problem">
          <div className="wrap">
            <h2>One wrong tab is all it takes</h2>
            <div className="problem__grid">
              <p>
                If you work across more than one AWS account, you already know
                the feeling. Six console tabs open, all identical, and the only
                thing telling them apart is a role name you stopped reading
                weeks ago.
              </p>
              <p>
                Terminating the wrong instance, emptying the wrong bucket, or
                editing the wrong security group is rarely a knowledge problem.
                It&rsquo;s a <em>signposting</em> problem. So this extension
                fixes the signposting.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="features" id="features">
          <div className="wrap">
            <h2 className="section-title">What you get</h2>
            <p className="section-lede">
              Built for people juggling AWS SSO across several organisations and
              clients.
            </p>

            <div className="feature feature--wide">
              <div className="feature__text">
                <h3>The account name, in the header</h3>
                <p>
                  The extension reads the account you&rsquo;re signed into and
                  writes its name into the console navigation bar. Pick any
                  colour per account &mdash; the name, its background, and the
                  header itself can all be tinted, so production can look
                  unmistakably different from everything else.
                </p>
              </div>
              <figure className="feature__media feature__media--annotated">
                <img
                  src={accountNameAnnotated}
                  alt="An annotated AWS console screenshot with a callout reading 'Account Name added' pointing at the account label in the header"
                  width={1362}
                  height={558}
                  loading="lazy"
                />
              </figure>
            </div>

            <div className="feature feature--split">
              <div className="feature__text">
                <h3>Jump straight to the right account</h3>
                <p>
                  Keep your consoles and SSO start pages in one list, grouped by
                  organisation or client. Filter as you type, collapse the
                  groups you&rsquo;re not using, and drag links into the order
                  you want them.
                </p>
                <ul className="ticks">
                  <li>Group by organisation, client or environment</li>
                  <li>Type-to-filter across every link</li>
                  <li>Drag to reorder, or sort A&ndash;Z per group</li>
                  <li>Fully keyboard navigable</li>
                </ul>
              </div>
              <figure className="feature__media feature__media--popup">
                <img
                  src={popupLight}
                  alt="The extension popup showing saved AWS links grouped under acme-nonprod, acme-prod and client-alpha, with a filter box at the top"
                  width={384}
                  height={485}
                  loading="lazy"
                />
              </figure>
            </div>

            <div className="feature__cards">
              <article className="card">
                <h3>Firefox container support</h3>
                <p>
                  Mark a group as a container group and its links open in their
                  own Firefox container. Separate cookie jars mean you can stay
                  signed into several AWS organisations at once without them
                  fighting each other.
                </p>
              </article>

              <article className="card">
                <h3>Follows your system theme</h3>
                <p>
                  Light and dark are both first-class. The popup picks up
                  whichever your OS is set to, with contrast and focus styles
                  checked in both.
                </p>
                <figure className="card__media">
                  <img
                    src={popupDark}
                    alt="The same extension popup rendered in dark mode"
                    width={384}
                    height={485}
                    loading="lazy"
                  />
                </figure>
              </article>

              <article className="card">
                <h3>Compressed console layout</h3>
                <p>
                  An optional setting that strips the generous padding out of
                  console data tables, so you get more rows on screen in the
                  services you spend all day in.
                </p>
                <figure className="card__media">
                  <img
                    src={popupConsole}
                    alt="The extension's Console preferences tab with the compress mode switch turned on"
                    width={384}
                    height={537}
                    loading="lazy"
                  />
                </figure>
              </article>

              <article className="card">
                <h3>Everything is editable</h3>
                <p>
                  Add, rename and regroup links from the popup itself.
                  Destructive actions ask for confirmation first, and nothing is
                  saved until you say so.
                </p>
                <figure className="card__media card__media--bottom">
                  <img
                    src={popupSettings}
                    alt="The extension's URL management form, pre-filled from a selected link, with Save as New, Save and Delete buttons"
                    width={384}
                    height={790}
                    loading="lazy"
                  />
                </figure>
              </article>

              <article className="card">
                <h3>Back up and move your setup</h3>
                <p>
                  Your whole configuration is plain JSON. Copy it out of the
                  options page to back it up, paste it into another browser or
                  another machine, and you&rsquo;re done. No account to sync
                  through, and nothing locked inside one profile.
                </p>
              </article>

              <article className="card">
                <h3>Works with AWS SSO</h3>
                <p>
                  Built for IAM Identity Center. It recognises accounts on both
                  the console and the <code>awsapps.com/start</code> portal,
                  across as many organisations as you have access to.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="install" id="install">
          <div className="wrap">
            <h2 className="section-title">Up and running in about a minute</h2>

            <ol className="steps">
              <li>
                <span className="steps__num" aria-hidden="true">
                  1
                </span>
                <h3>Install it</h3>
                <p>
                  Add it from the Firefox or Chrome store. Nothing to configure,
                  no account to create.
                </p>
                <StoreButtons compact />
              </li>
              <li>
                <span className="steps__num" aria-hidden="true">
                  2
                </span>
                <h3>Open the AWS console</h3>
                <p>
                  Click the extension icon in your toolbar. It will have a small
                  green dot on it the first time.
                </p>
                <figure className="steps__media steps__media--tiny">
                  <img
                    src={plugPermission}
                    alt="The extension toolbar icon with a small green permission dot on it"
                    width={90}
                    height={80}
                    loading="lazy"
                  />
                </figure>
              </li>
              <li>
                <span className="steps__num" aria-hidden="true">
                  3
                </span>
                <h3>Allow it on AWS console URLs</h3>
                <p>
                  Choose <strong>Always Allow</strong> for the console domain so
                  the label appears on every page instead of only when you
                  click.
                </p>
                <figure className="steps__media">
                  <img
                    src={plugPermission2}
                    alt="The browser extension menu with the option 'Always Allow on console.aws.amazon.com' available"
                    width={864}
                    height={544}
                    loading="lazy"
                  />
                </figure>
              </li>
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="privacy" id="privacy">
          <div className="wrap">
            <h2 className="section-title">
              It can&rsquo;t leak your data, because it never sends any
            </h2>
            <p className="section-lede">
              An extension that reads your AWS console deserves scrutiny. Here
              is exactly what this one does.
            </p>

            <div className="privacy__grid">
              <ul className="privacy__list">
                <li>
                  <strong>No network requests at all.</strong> The extension
                  contains no <code>fetch</code>, no <code>XMLHttpRequest</code>
                  , no analytics and no beacons. There is no server to send
                  anything to.
                </li>
                <li>
                  <strong>Your settings stay on your machine.</strong> Links,
                  groups and colours live in your browser&rsquo;s local
                  extension storage. Nothing is synced anywhere.
                </li>
                <li>
                  <strong>It only runs on AWS pages.</strong> The content script
                  is limited to the AWS console and <code>awsapps.com</code>{" "}
                  start pages. It is not loaded on any other site.
                </li>
                <li>
                  <strong>It reads one thing.</strong> The account identifier
                  already shown on the page, so it knows which name and colour
                  to display.
                </li>
                <li>
                  <strong>You can check all of this.</strong> The source is on
                  GitHub, and the permission list is right there in your
                  browser.
                </li>
              </ul>

              <figure className="privacy__media">
                <img
                  src={permissionsImg}
                  alt="The browser's permission screen for the extension, listing the AWS console domains it can access"
                  width={1362}
                  height={558}
                  loading="lazy"
                />
                <figcaption>
                  The full set of permissions it asks for.
                </figcaption>
              </figure>
            </div>

            <p className="privacy__note">
              For transparency: this website uses Google Analytics for basic
              visitor counts. The extension itself does not.
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="faq" id="faq">
          <div className="wrap">
            <h2 className="section-title">Questions</h2>

            <div className="faq__list">
              <details>
                <summary>Is it really free?</summary>
                <p>
                  Yes. It&rsquo;s free on both stores, there is no paid tier,
                  and the source is public. It was built to scratch an itch, not
                  to sell you anything.
                </p>
              </details>

              <details>
                <summary>
                  Does it work with AWS SSO / IAM Identity Center?
                </summary>
                <p>
                  That&rsquo;s the main use case. It handles multiple accounts
                  across multiple organisations, and recognises both the console
                  and the <code>awsapps.com/start</code> portal.
                </p>
              </details>

              <details>
                <summary>
                  Why does it need permission to read AWS pages?
                </summary>
                <p>
                  To find which account you&rsquo;re signed into, and to insert
                  the label into the header. Those permissions are scoped to AWS
                  console and <code>awsapps.com</code> domains only &mdash; it
                  cannot read any other site.
                </p>
              </details>

              <details>
                <summary>Will it slow the console down?</summary>
                <p>
                  It does a small amount of work per page: find the account,
                  write one label, and apply your colours. There are no network
                  calls to wait on.
                </p>
              </details>

              <details>
                <summary>Chrome or Firefox?</summary>
                <p>
                  Both. Firefox gets a little extra: container groups use
                  Firefox&rsquo;s contextual identities to keep sessions in
                  separate cookie jars, which Chrome has no equivalent for.
                </p>
              </details>

              <details>
                <summary>How do I move my settings to another machine?</summary>
                <p>
                  Copy the configuration JSON out of the options page and paste
                  it in on the other machine. That&rsquo;s the whole process
                  &mdash; there&rsquo;s no account and nothing to sign into.
                </p>
              </details>

              <details>
                <summary>Something&rsquo;s broken. Where do I say so?</summary>
                <p>
                  Open an issue on <a href={ISSUES_URL}>GitHub</a>. Bug reports
                  and feature requests are both welcome.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="cta">
          <div className="wrap cta__inner">
            <h2>Stop guessing which account you&rsquo;re in</h2>
            <p>Free, open source, and about a minute to set up.</p>
            <StoreButtons />
            <p className="cta__fine">
              Prefer to read the code first?{" "}
              <a href={REPO_URL}>Browse the repository on GitHub</a>.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <div className="footer__brand">
            <a href="https://akfdev.com">
              <img src={AKFDEV_Logo} alt="AKFDEV" width={114} height={30} />
            </a>
            <p>
              Built by <a href="https://akfdev.com">AKFDEV</a> because running
              the wrong command in the wrong account is a bad day.
            </p>
          </div>

          <nav className="footer__col" aria-label="Get the extension">
            <h3>Get it</h3>
            <a href={FIREFOX_URL}>Firefox Add-ons</a>
            <a href={CHROME_URL}>Chrome Web Store</a>
          </nav>

          <nav className="footer__col" aria-label="Project">
            <h3>Project</h3>
            <a href={REPO_URL}>Source on GitHub</a>
            <a href={ISSUES_URL}>Report an issue</a>
          </nav>

          <div className="footer__col">
            <h3>Build</h3>
            <p className="footer__version">
              Version <span id="version-number">{packageJson.version}</span>
            </p>
            <p className="footer__copy">&copy; {year} AKFDEV</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
