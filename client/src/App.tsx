import { useState } from "react";

const API = "http://localhost:5000";

export default function App() {
  const [email, setEmail] = useState("admin@velozity.com");
  const [password, setPassword] = useState("Password123!");
  const [token, setToken] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function login() {
    setError("");

    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    setToken(data.accessToken);
    await loadData(data.accessToken);
  }

  async function loadData(accessToken: string) {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const [projectRes, taskRes] = await Promise.all([
      fetch(`${API}/api/projects`, { headers }),
      fetch(`${API}/api/tasks`, { headers }),
    ]);

    const projectData = await projectRes.json();
    const taskData = await taskRes.json();

    setProjects(projectData.projects || []);
    setTasks(taskData.tasks || []);
  }

  if (!token) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1>Velozity Dashboard</h1>
          <p>Full Stack Developer Assessment</p>

          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <button style={styles.button} onClick={login}>
            Login
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1>Velozity Project Dashboard</h1>

        <div style={styles.stats}>
          <div style={styles.stat}>
            <strong>{projects.length}</strong>
            <span>Projects</span>
          </div>

          <div style={styles.stat}>
            <strong>{tasks.length}</strong>
            <span>Tasks</span>
          </div>

          <div style={styles.stat}>
            <strong>
              {tasks.filter((t) => t.status === "COMPLETED").length}
            </strong>
            <span>Completed</span>
          </div>
        </div>

        <h2>Projects</h2>

        {projects.map((project) => (
          <div style={styles.project} key={project.id}>
            <h3>{project.name}</h3>
            <p>{project.description || "No description"}</p>

            <strong>Tasks: {project.tasks?.length || 0}</strong>
          </div>
        ))}

        <h2>Tasks</h2>

        {tasks.map((task) => (
          <div style={styles.task} key={task.id}>
            <strong>{task.title}</strong>
            <span>Status: {task.status}</span>
            <span>Priority: {task.priority}</span>
          </div>
        ))}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1000px",
    margin: "auto",
  },
  card: {
    maxWidth: "400px",
    margin: "100px auto",
    background: "white",
    padding: "30px",
    borderRadius: "12px",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    cursor: "pointer",
  },
  stats: {
    display: "flex",
    gap: "20px",
    margin: "25px 0",
  },
  stat: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    minWidth: "120px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  project: {
    background: "white",
    padding: "20px",
    margin: "12px 0",
    borderRadius: "10px",
  },
  task: {
    background: "white",
    padding: "15px",
    margin: "8px 0",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
  },
};