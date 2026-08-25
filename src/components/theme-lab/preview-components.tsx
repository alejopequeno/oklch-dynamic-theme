import { useId } from "react";

export function PreviewComponents() {
  const projectNameId = useId();
  const workspaceId = useId();
  const workId = useId();
  const contactId = useId();
  const heroTitleId = useId();

  return (
    <div className="preview-content">
      <nav aria-label="Preview navigation" className="preview-nav">
        <a className="preview-brand" href={`#${workId}`}>
          northstar
        </a>
        <a href={`#${contactId}`}>Contact</a>
      </nav>

      <div className="preview-main">
        <section className="preview-hero" aria-labelledby={heroTitleId}>
          <p className="preview-eyebrow">Independent product studio</p>
          <h3 id={heroTitleId}>Good systems make room for better ideas.</h3>
          <p className="preview-copy">
            We shape focused digital products for teams doing thoughtful work.
          </p>
          <button className="preview-primary-action" type="button">
            Continue
          </button>
        </section>

        <section className="preview-project preview-card" id={workId} aria-label="Project settings">
          <div className="preview-card-heading">
            <div>
              <p className="preview-eyebrow">Selected work</p>
              <h4>A clearer path to launch</h4>
            </div>
            <span className="preview-badge">Live</span>
          </div>
          <form className="preview-form">
            <label htmlFor={projectNameId}>
              Project name
              <input defaultValue="Atlas" id={projectNameId} name="project-name" type="text" />
            </label>
            <label htmlFor={workspaceId}>
              Workspace
              <select defaultValue="Studio" id={workspaceId} name="workspace">
                <option>Studio</option>
                <option>Personal</option>
              </select>
            </label>
            <button className="preview-secondary-action" type="button">
              Save draft
            </button>
          </form>
          <aside aria-label="Project update" className="preview-popover">
            <strong>New version ready</strong>
            <span>Published 2 minutes ago</span>
          </aside>
          <p className="preview-alert" role="alert">
            A review note needs your attention.
          </p>
        </section>
      </div>

      <footer className="preview-footer" id={contactId}>
        <span>New York · Remote</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
