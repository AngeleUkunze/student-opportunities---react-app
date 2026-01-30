import { useState, useEffect } from "react";
import './styles.css';

function App() {
  const [user, setUser] = useState(() => localStorage.getItem("user") || null);
  const [opportunities, setOpportunities] = useState(() => {
    const saved = localStorage.getItem("opportunities");
    return saved
      ? JSON.parse(saved)
      : [
        { id: 1, title: "Scholarship: AI Bootcamp", type: "Scholarship", status: "" },
        { id: 2, title: "Internship: Tech Company", type: "Internship", status: "" },
      ];
  });

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [loginFor, setLoginFor] = useState(null); // store which opportunity triggered login

  // Save opportunities to localStorage
  useEffect(() => {
    localStorage.setItem("opportunities", JSON.stringify(opportunities));
  }, [opportunities]);

  // Save user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", user);
    else localStorage.removeItem("user");
  }, [user]);

  const handleAddOpportunity = (e) => {
    e.preventDefault();
    if (!title || !type) return;

    const newOpportunity = {
      id: opportunities.length + 1,
      title,
      type,
      status: ""
    };

    setOpportunities([...opportunities, newOpportunity]);
    setTitle("");
    setType("");
  };

  const toggleStatus = (id, status) => {
    setOpportunities(opportunities.map(opp =>
      opp.id === id
        ? { ...opp, status: opp.status === status ? "" : status }
        : opp
    ));
  };

  const handleApplyOrInterest = (id, status) => {
    if (!user) {
      setLoginFor({ id, status }); // trigger login modal
    } else {
      toggleStatus(id, status);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameInput) return;
    setUser(usernameInput);
    setUsernameInput("");

    // After login, automatically apply/interest
    if (loginFor) {
      toggleStatus(loginFor.id, loginFor.status);
      setLoginFor(null);
    }
  };

  const handleLogout = () => setUser(null);

  const deleteOpportunity = (id) => {
    setOpportunities(opportunities.filter(opp => opp.id !== id));
  };

  return (
    <div className="container">
      <h1>Student Opportunity Tracker 🎓</h1>

      {/* Login status */}
      {user && (
        <div style={{ marginBottom: "20px" }}>
          Logged in as <strong>{user}</strong>
          <button className="status-button logout" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Add opportunity form */}
      <form onSubmit={handleAddOpportunity} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Opportunity title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Type (Scholarship, Internship...)"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <button type="submit">Add Opportunity</button>
      </form>

      {/* Opportunities list */}
      <ul>
        {opportunities.map((opp) => (
          <li key={opp.id}>
            <div>
              <strong>{opp.title}</strong> - <em>{opp.type}</em>
            </div>
            <div>
              <button
                className={`status-button applied ${opp.status === "Applied" ? "active" : ""}`}
                onClick={() => handleApplyOrInterest(opp.id, "Applied")}
              >
                {opp.status === "Applied" ? "Applied" : "Apply"}
              </button>

              <button
                className={`status-button interested ${opp.status === "Interested" ? "active" : ""}`}
                onClick={() => handleApplyOrInterest(opp.id, "Interested")}
              >
                {opp.status === "Interested" ? "Interested" : "Interest"}
              </button>

              <button
                className="status-button delete"
                onClick={() => deleteOpportunity(opp.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Login modal triggered by Apply/Interest */}
      {loginFor && !user && (
        <div className="login-modal">
          <form onSubmit={handleLogin}>
            <h3>Login to continue</h3>
            <input
              type="text"
              placeholder="Enter username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
