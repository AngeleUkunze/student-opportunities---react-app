import { useState } from "react";
import "./styles.css";

function App() {
  const [page, setPage] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [topNotification, setTopNotification] = useState("");

  // Login / Signup states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registeredUser, setRegisteredUser] = useState(null);

  // New Opportunity form states
  const [newOppTitle, setNewOppTitle] = useState("");
  const [newOppType, setNewOppType] = useState("Internship");

  const [opportunities, setOpportunities] = useState([
    { id: 1, title: "Internship at Google", type: "Internship", applied: false, interested: false },
    { id: 2, title: "Scholarship at MIT", type: "Scholarship", applied: false, interested: false },
    { id: 3, title: "Workshop on AI", type: "Job", applied: false, interested: false },
  ]);

  // Top notification helper
  const showNotification = (text) => {
    setTopNotification(text);
    setTimeout(() => setTopNotification(""), 3000);
  };

  return (
    <div>
      <center>
        {/* Top notification */}
        {topNotification && <div className="top-notification">{topNotification}</div>}

        {/* Header */}
        <header className="header">
          <h1>Student Opportunities</h1>
          {!loggedIn && <button onClick={() => setPage("login")}>Login / Signup</button>}
          {loggedIn && (
            <button
              className="logout"
              onClick={() => {
                setLoggedIn(false);
                setMessage("");
                // Reset applied/interested on logout
                setOpportunities(prev =>
                  prev.map(opp => ({ ...opp, applied: false, interested: false }))
                );
              }}
            >
              Logout
            </button>
          )}
        </header>

        {/* Add Opportunity Form — always visible */}
        <div className="add-opportunity">
          <input
            type="text"
            placeholder="Opportunity title"
            value={newOppTitle}
            onChange={(e) => setNewOppTitle(e.target.value)}
          />

          <select
            value={newOppType}
            onChange={(e) => setNewOppType(e.target.value)}
          >
            <option value="Internship">Internship</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Job">Job</option>
          </select>

          <button
            onClick={() => {
              if (!loggedIn) {
                showNotification("Please log in first to add an opportunity");
                return;
              }
              if (!newOppTitle.trim()) {
                showNotification("Please enter a title");
                return;
              }
              // Add new opportunity
              setOpportunities(prev => [
                ...prev,
                {
                  id: Date.now(),
                  title: newOppTitle.trim(),
                  type: newOppType,
                  applied: false,
                  interested: false,
                },
              ]);
              setNewOppTitle("");
              setNewOppType("Internship");
              showNotification("Opportunity added successfully!");
            }}
          >
            Add
          </button>
        </div>

        {/* Opportunities List */}
        <main className="main">
          <ul>
            {opportunities.map((opp, index) => (
              <li key={opp.id}>
                {opp.title} | {opp.type}
                <div>
                  {/* Apply button */}
                  <button
                    onClick={() => {
                      if (!loggedIn) {
                        showNotification("Please log in first to Apply");
                        return;
                      }
                      setOpportunities(prev =>
                        prev.map((opp2, i) =>
                          i === index
                            ? { ...opp2, applied: !opp2.applied }
                            : opp2
                        )
                      );
                    }}
                  >
                    {opp.applied ? "Applied" : "Apply"}
                  </button>

                  {/* Interest button */}
                  <button
                    onClick={() => {
                      if (!loggedIn) {
                        showNotification("Please log in first to express Interest");
                        return;
                      }
                      setOpportunities(prev =>
                        prev.map((opp2, i) =>
                          i === index
                            ? { ...opp2, interested: !opp2.interested }
                            : opp2
                        )
                      );
                    }}
                  >
                    {opp.interested ? "Interested" : "Interest"}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (!loggedIn) {
                        showNotification("Please log in first to delete");
                        return;
                      }
                      setOpportunities(prev => prev.filter((_, i) => i !== index));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </center>

      {/* Login / Signup Modal */}
      {page === "login" && !loggedIn && (
        <div className="modal">
          <h2>Login / Sign Up</h2>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <small>We’ll never share your email</small>
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small>At least 6 characters</small>
          </div>

          <hr />

          <button
            className="primary"
            onClick={() => {
              if (!email || !password) {
                setError("Please fill in all fields");
                return;
              }
              if (!registeredUser) {
                setError("Please sign up first");
                return;
              }
              if (email !== registeredUser.email || password !== registeredUser.password) {
                setError("Invalid email or password");
                return;
              }
              setLoggedIn(true);
              setMessage("Logged in successfully!");
              setError("");
              setEmail("");
              setPassword("");
            }}
          >
            Login
          </button>

          <button
            className="secondary"
            onClick={() => {
              if (!email || !password) {
                setError("Please fill in all fields");
                return;
              }
              setRegisteredUser({ email, password });
              setMessage("Account created successfully. You can now log in.");
              setError("");
              setEmail("");
              setPassword("");
            }}
          >
            Sign Up
          </button>

          <p className="hint">Forgot your password?</p>
        </div>
      )}
    </div>
  );
}

export default App;
