// This is a placeholder landing page. Port the Landing component from the
// original ResearchHub.jsx artifact here — swap its onGetStarted/onLogin
// handlers to router.push("/signup") / router.push("/login").
export default function Home() {
  return (
    <main style={{ padding: 64, textAlign: "center" }}>
      <h1 className="serif" style={{ fontSize: 32, fontWeight: 700 }}>
        ResearchHub
      </h1>
      <p className="sans" style={{ color: "#6B7280", marginTop: 8 }}>
        Backend scaffold is wired up. Port the UI from the artifact into this page —
        see README.md for the mapping between old <code>window.storage</code> calls and
        the new <code>lib/api.ts</code> functions.
      </p>
    </main>
  );
}
