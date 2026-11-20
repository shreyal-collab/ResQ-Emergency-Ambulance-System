
import { useEffect, useState } from "react";
import "./App.css";
import { checkBackend } from "./api/api";

const initialRequests = [
  {
    id: "RQ-1042",
    patient: "Emergency Patient",
    location: "Sector 62, Noida",
    level: "Critical",
    status: "Dispatched",
    ambulance: "AMB-01",
    time: "2 min ago",
  },
  {
    id: "RQ-1043",
    patient: "Road Accident",
    location: "NH-9, Ghaziabad",
    level: "High",
    status: "Pending",
    ambulance: "Unassigned",
    time: "5 min ago",
  },
  {
    id: "RQ-1044",
    patient: "Medical Emergency",
    location: "Modinagar Main Road",
    level: "Medium",
    status: "In Transit",
    ambulance: "AMB-03",
    time: "8 min ago",
  },
];

const initialFleet = [
  { id: "AMB-01", type: "Advanced Life Support", status: "On Call" },
  { id: "AMB-02", type: "Basic Life Support", status: "Available" },
  { id: "AMB-03", type: "Advanced Life Support", status: "On Call" },
  { id: "AMB-04", type: "Basic Life Support", status: "Available" },
];

const hospitals = [
  {
    name: "District Combined Hospital",
    location: "Sanjay Nagar, Ghaziabad",
    type: "General Hospital",
  },
  {
    name: "MMG District Hospital",
    location: "Ghaziabad, Uttar Pradesh",
    type: "Government Hospital",
  },
  {
    name: "Community Health Centre",
    location: "Modinagar, Uttar Pradesh",
    type: "Community Health Centre",
  },
];

const navigation = [
  { name: "Command Center", icon: "⌂" },
  { name: "Emergency Requests", icon: "✚" },
  { name: "Ambulance Fleet", icon: "▣" },
  { name: "Route Planning", icon: "⌖" },
  { name: "Hospitals", icon: "✚" },
  { name: "Reports & History", icon: "▤" },
  { name: "Settings", icon: "⚙" },
];

function App() {
  const [activePage, setActivePage] = useState("Command Center");
  const [requests, setRequests] = useState(initialRequests);
  const [fleet, setFleet] = useState(initialFleet);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [patient, setPatient] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("High");
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [settings, setSettings] = useState({
    notifications: true,
    sound: false,
  });

  useEffect(() => {
    checkBackend()
      .then(() => setBackendStatus("Connected"))
      .catch(() => setBackendStatus("Disconnected"));
  }, []);

  const filteredRequests = requests.filter((request) => {
    const searchText = [
      request.id,
      request.patient,
      request.location,
      request.status,
      request.level,
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const criticalCount = requests.filter(
    (request) => request.level === "Critical"
  ).length;

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const activeCount = requests.filter(
    (request) =>
      request.status === "Dispatched" ||
      request.status === "In Transit"
  ).length;

  const availableCount = fleet.filter(
    (ambulance) => ambulance.status === "Available"
  ).length;

  function createEmergency(event) {
    event.preventDefault();

    if (!location.trim()) {
      alert("Please enter the emergency location.");
      return;
    }

    const newRequest = {
      id: "RQ-" + Date.now().toString().slice(-5),
      patient: patient.trim() || "Emergency Patient",
      location: location.trim(),
      level: level,
      status: "Pending",
      ambulance: "Unassigned",
      time: "Just now",
    };

    setRequests((previous) => [newRequest, ...previous]);
    setPatient("");
    setLocation("");
    setLevel("High");
    setShowForm(false);
    setActivePage("Emergency Requests");
  }

  function dispatchAmbulance(requestId) {
    const availableAmbulance = fleet.find(
      (ambulance) => ambulance.status === "Available"
    );

    if (!availableAmbulance) {
      alert("No ambulances are currently available.");
      return;
    }

    setRequests((previous) =>
      previous.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "Dispatched",
              ambulance: availableAmbulance.id,
            }
          : request
      )
    );

    setFleet((previous) =>
      previous.map((ambulance) =>
        ambulance.id === availableAmbulance.id
          ? { ...ambulance, status: "On Call" }
          : ambulance
      )
    );
  }

  function updateRequestStatus(requestId, newStatus) {
    const currentRequest = requests.find(
      (request) => request.id === requestId
    );

    if (!currentRequest) return;

    setRequests((previous) =>
      previous.map((request) =>
        request.id === requestId
          ? { ...request, status: newStatus }
          : request
      )
    );

    if (newStatus === "Completed" && currentRequest.ambulance !== "Unassigned") {
      setFleet((previous) =>
        previous.map((ambulance) =>
          ambulance.id === currentRequest.ambulance
            ? { ...ambulance, status: "Available" }
            : ambulance
        )
      );
    }

    setSelectedRequest((previous) =>
      previous && previous.id === requestId
        ? { ...previous, status: newStatus }
        : previous
    );
  }

  function renderBadge(value) {
    const className = value.toLowerCase().replace(/\s+/g, "-");

    return <span className={"badge " + className}>{value}</span>;
  }

  function renderRequestsTable(items) {
    return (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Patient / Case</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Ambulance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>
                  <strong>{request.patient}</strong>
                  <small className="table-subtext">{request.time}</small>
                </td>
                <td>{request.location}</td>
                <td>{renderBadge(request.level)}</td>
                <td>{renderBadge(request.status)}</td>
                <td>{request.ambulance}</td>
                <td>
                  <div className="action-buttons">
                    {request.status === "Pending" && (
                      <button
                        className="small-btn"
                        onClick={() => dispatchAmbulance(request.id)}
                      >
                        Dispatch
                      </button>
                    )}
                    <button
                      className="small-btn secondary-btn"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">
                  No emergency requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function renderDashboard() {
    return (
      <>
        <section className="welcome-section">
          <div>
            <p className="eyebrow">EMERGENCY RESPONSE SYSTEM</p>
            <h1>Command Center</h1>
            <p>
              Monitor emergencies, coordinate ambulances, and manage response
              operations from one place.
            </p>
          </div>
          <button
            className="primary-btn"
            onClick={() => setShowForm(true)}
          >
            + Report Emergency
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Emergencies</p>
            <h2>{requests.length}</h2>
            <span>All recorded requests</span>
          </div>
          <div className="stat-card">
            <p>Critical Cases</p>
            <h2 className="critical-number">{criticalCount}</h2>
            <span>Require urgent attention</span>
          </div>
          <div className="stat-card">
            <p>Pending Requests</p>
            <h2>{pendingCount}</h2>
            <span>Awaiting dispatch</span>
          </div>
          <div className="stat-card">
            <p>Active Responses</p>
            <h2>{activeCount}</h2>
            <span>Dispatched or in transit</span>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Recent Emergencies</h2>
                <p>Latest reported emergency cases.</p>
              </div>
              <button
                className="text-btn"
                onClick={() => setActivePage("Emergency Requests")}
              >
                View all →
              </button>
            </div>

            <div className="recent-list">
              {requests.slice(0, 5).map((request) => (
                <div className="recent-item" key={request.id}>
                  <div className="case-icon">✚</div>
                  <div className="case-details">
                    <strong>{request.patient}</strong>
                    <span>{request.location}</span>
                    <small>
                      {request.id} · {request.time}
                    </small>
                  </div>
                  {renderBadge(request.level)}
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Ambulance Fleet</h2>
                <p>Current ambulance availability.</p>
              </div>
              <button
                className="text-btn"
                onClick={() => setActivePage("Ambulance Fleet")}
              >
                View fleet →
              </button>
            </div>

            <div className="fleet-summary">
              <div className="fleet-number">{availableCount}</div>
              <div>
                <strong>Ambulances Available</strong>
                <p>Out of {fleet.length} ambulances</p>
              </div>
            </div>

            {fleet.map((ambulance) => (
              <div className="fleet-item" key={ambulance.id}>
                <div>
                  <strong>{ambulance.id}</strong>
                  <span>{ambulance.type}</span>
                </div>
                {renderBadge(ambulance.status)}
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>System Connection</h2>
              <p>Frontend and backend connectivity status.</p>
            </div>
          </div>
          <div className="connection-row">
            <span>Spring Boot API</span>
            <strong
              className={
                backendStatus === "Connected" ? "status-good" : "status-bad"
              }
            >
              ● {backendStatus}
            </strong>
          </div>
          <div className="connection-row">
            <span>Ambulances in fleet</span>
            <strong>{fleet.length}</strong>
          </div>
          <div className="connection-row">
            <span>Hospitals listed</span>
            <strong>{hospitals.length}</strong>
          </div>
        </section>
      </>
    );
  }

  function renderFleet() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Ambulance Fleet</h2>
            <p>Monitor and manage the current ambulance fleet.</p>
          </div>
        </div>
        <div className="fleet-grid">
          {fleet.map((ambulance) => (
            <div className="fleet-card" key={ambulance.id}>
              <div className="fleet-card-icon">🚑</div>
              <h3>{ambulance.id}</h3>
              <p>{ambulance.type}</p>
              {renderBadge(ambulance.status)}
              <p className="fleet-note">
                {ambulance.status === "Available"
                  ? "Ready for dispatch"
                  : "Currently assigned to a response"}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderRoutePlanning() {
    const activeRequests = requests.filter(
      (request) =>
        request.status === "Dispatched" || request.status === "In Transit"
    );

    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Route Planning</h2>
            <p>Review locations associated with active emergency responses.</p>
          </div>
        </div>

        <div className="route-notice">
          <strong>Route planning preview</strong>
          <p>
            This page lists active cases and their reported locations. Live GPS,
            maps, traffic data, and automatic route optimization are not
            connected yet.
          </p>
        </div>

        {activeRequests.length === 0 ? (
          <p className="empty-state">There are no active routes.</p>
        ) : (
          activeRequests.map((request) => (
            <div className="route-item" key={request.id}>
              <div className="case-icon">⌖</div>
              <div className="case-details">
                <strong>{request.id} · {request.patient}</strong>
                <span>{request.location}</span>
                <small>Ambulance: {request.ambulance}</small>
              </div>
              {renderBadge(request.status)}
              {request.status === "Dispatched" && (
                <button
                  className="small-btn"
                  onClick={() =>
                    updateRequestStatus(request.id, "In Transit")
                  }
                >
                  Start Transit
                </button>
              )}
            </div>
          ))
        )}
      </section>
    );
  }

  function renderHospitals() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Hospitals</h2>
            <p>Sample hospital directory for the ResQ prototype.</p>
          </div>
        </div>
        <div className="hospital-grid">
          {hospitals.map((hospital) => (
            <div className="hospital-card" key={hospital.name}>
              <div className="hospital-icon">✚</div>
              <h3>{hospital.name}</h3>
              <p>{hospital.location}</p>
              <span>{hospital.type}</span>
            </div>
          ))}
        </div>
        <p className="helper-text">
          Hospital locations and capabilities should be verified before using
          this prototype for real emergency coordination.
        </p>
      </section>
    );
  }

  function renderReports() {
    const completed = requests.filter(
      (request) => request.status === "Completed"
    ).length;

    return (
      <>
        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Requests</p>
            <h2>{requests.length}</h2>
            <span>Current session</span>
          </div>
          <div className="stat-card">
            <p>Critical Cases</p>
            <h2>{criticalCount}</h2>
            <span>Marked critical</span>
          </div>
          <div className="stat-card">
            <p>Pending Requests</p>
            <h2>{pendingCount}</h2>
            <span>Awaiting dispatch</span>
          </div>
          <div className="stat-card">
            <p>Completed</p>
            <h2>{completed}</h2>
            <span>Marked completed</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Reports & History</h2>
              <p>Review all emergency requests in this session.</p>
            </div>
            <button
              className="primary-btn"
              onClick={() => window.print()}
            >
              Print Report
            </button>
          </div>
          {renderRequestsTable(requests)}
          <p className="helper-text">
            These reports use in-memory sample data and are not yet saved to
            MySQL.
          </p>
        </section>
      </>
    );
  }

  function renderSettings() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Settings</h2>
            <p>Manage basic dashboard preferences.</p>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Emergency notifications</strong>
            <p>Enable dashboard notification preference.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(event) =>
              setSettings((previous) => ({
                ...previous,
                notifications: event.target.checked,
              }))
            }
          />
        </div>

        <div className="setting-row">
          <div>
            <strong>Alert sound preference</strong>
            <p>Enable the sound preference for future alert integration.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(event) =>
              setSettings((previous) => ({
                ...previous,
                sound: event.target.checked,
              }))
            }
          />
        </div>

        <div className="connection-row">
          <span>Backend API status</span>
          <strong>{backendStatus}</strong>
        </div>

        <p className="helper-text">
          These preferences are temporary and reset when the page reloads.
        </p>
      </section>
    );
  }

  function renderActivePage() {
    switch (activePage) {
      case "Command Center":
        return renderDashboard();
      case "Emergency Requests":
        return (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Emergency Requests</h2>
                <p>Search, dispatch, and review emergency cases.</p>
              </div>
              <button
                className="primary-btn"
                onClick={() => setShowForm(true)}
              >
                + New Emergency
              </button>
            </div>

            <input
              className="search-input"
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {renderRequestsTable(filteredRequests)}
          </section>
        );
      case "Ambulance Fleet":
        return renderFleet();
      case "Route Planning":
        return renderRoutePlanning();
      case "Hospitals":
        return renderHospitals();
      case "Reports & History":
        return renderReports();
      case "Settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h2>ResQ</h2>
            <span>Emergency Response</span>
          </div>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={
                "nav-item " +
                (activePage === item.name ? "active" : "")
              }
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="backend-indicator">
            <span
              className={
                "connection-dot " +
                (backendStatus === "Connected" ? "connected" : "")
              }
            />
            <div>
              <strong>Backend API</strong>
              <span>{backendStatus}</span>
            </div>
          </div>
          <p>ResQ Prototype · v1.0</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">ResQ / </span>
            <strong>{activePage}</strong>
          </div>
          <div className="topbar-right">
            <span className="system-status">
              <span className="connection-dot connected" />
              System Dashboard
            </span>
            <div className="profile-avatar">A</div>
          </div>
        </header>

        <div className="page-content">{renderActivePage()}</div>
      </main>

      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">NEW CASE</p>
                <h2>Report Emergency</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={createEmergency}>
              <label htmlFor="patient">Patient / Emergency type</label>
              <input
                id="patient"
                type="text"
                placeholder="e.g. Road accident"
                value={patient}
                onChange={(event) => setPatient(event.target.value)}
              />

              <label htmlFor="location">Emergency location *</label>
              <input
                id="location"
                type="text"
                placeholder="Enter the reported location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                required
              />

              <label htmlFor="level">Priority level</label>
              <select
                id="level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedRequest(null)}
        >
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">REQUEST DETAILS</p>
                <h2>{selectedRequest.id}</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="details-list">
              <div>
                <span>Patient / Case</span>
                <strong>{selectedRequest.patient}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{selectedRequest.location}</strong>
              </div>
              <div>
                <span>Priority</span>
                <strong>{selectedRequest.level}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{selectedRequest.status}</strong>
              </div>
              <div>
                <span>Ambulance</span>
                <strong>{selectedRequest.ambulance}</strong>
              </div>
              <div>
                <span>Reported</span>
                <strong>{selectedRequest.time}</strong>
              </div>
            </div>

            <label htmlFor="request-status">Update status</label>
            <select
              id="request-status"
              value={selectedRequest.status}
              onChange={(event) =>
                updateRequestStatus(selectedRequest.id, event.target.value)
              }
            >
              <option value="Pending">Pending</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={() => setSelectedRequest(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
