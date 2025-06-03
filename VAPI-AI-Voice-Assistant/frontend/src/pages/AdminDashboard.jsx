import { useEffect, useState } from "react";

function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Orange Maroc theme colors
  const theme = {
    primary: "#ff6600",
    secondary: "#333333",
    light: "#ffffff",
    lightGray: "#f5f5f5",
    border: "#e0e0e0",
    success: "#4CAF50",
    danger: "#f03e3e",
    warning: "#ff9800",
    pending: "#666666"
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");

        const candidatesResponse = await fetch("/api/admin/candidates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const candidatesData = await candidatesResponse.json();

        const datasetResponse = await fetch("/api/admin/datasets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const datasetData = await datasetResponse.json();

        if (candidatesResponse.ok && datasetResponse.ok) {
          setCandidates(candidatesData.candidates);
          setDataset(datasetData.dataset);
        } else {
          setError(candidatesData.error || datasetData.error);
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
      }
    };

    fetchAdminData();
  }, []);

  // Fetch interviews for a candidate
  const handleCandidateClick = async (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
    setInterviews([]);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/interview-history?user_id=${candidate.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setInterviews(data.history || []);
      } else {
        setError(data.error || "Failed to fetch interview history.");
      }
    } catch (err) {
      setError("An error occurred while fetching interview history.");
    }
  };

  // Status update handler for admin
  const handleStatusUpdate = async (interviewId, newStatus) => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ interview_id: interviewId, status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        // Update local state
        setInterviews((prev) =>
          prev.map((interview) =>
            interview.id === interviewId
              ? { ...interview, status: newStatus }
              : interview
          )
        );
        
        // Refresh candidates list to reflect the new status
        const candidatesResponse = await fetch("/api/admin/candidates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const candidatesData = await candidatesResponse.json();
        if (candidatesResponse.ok) {
          setCandidates(candidatesData.candidates);
        }
      } else {
        setError(data.error || "Failed to update interview status.");
      }
    } catch (err) {
      setError("An error occurred while updating status.");
    }
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  // Function to download dataset as CSV
  const downloadCSV = () => {
    if (dataset.length === 0) return;
    
    // Define CSV headers
    const headers = [
      "User ID", 
      "Username", 
      "Email", 
      "Call ID", 
      "Date", 
      "Status", 
      "Summary"
    ];
    
    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    
    dataset.forEach(data => {
      // Clean up summary text to avoid CSV formatting issues
      const cleanSummary = data.summary ? data.summary.replace(/,/g, " ").replace(/\n/g, " ") : "";
      
      const row = [
        data.user_id,
        data.username || "",
        data.email || "",
        data.call_id,
        data.date,
        data.status || "",
        cleanSummary
      ];
      
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "interview_dataset.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter candidates based on status
  const filteredCandidates = statusFilter === "all" 
    ? candidates 
    : candidates.filter(candidate => candidate.latest_interview_status === statusFilter);

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return theme.success;
      case 'denied': return theme.danger;
      case 'postponed': return theme.warning;
      default: return theme.pending;
    }
  };

  return (
    <div className="dashboard-container" style={{ 
      padding: "30px", 
      backgroundColor: theme.lightGray,
      minHeight: "100vh"
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "30px", 
        borderBottom: `2px solid ${theme.primary}`,
        paddingBottom: "15px"
       }}>
        <img 
          src="/assets/orange.png" 
          alt="Orange Maroc Logo" 
          style={{ height: "40px", marginRight: "15px" }} 
        />
        <h1 style={{ 
          margin: 0, 
          color: theme.primary, 
          fontWeight: "bold", 
          fontSize: "28px" 
        }}>
          Admin Dashboard
        </h1>
      </div>
      

      {error && (
        <div style={{ 
          color: "#fff", 
          padding: "12px 15px", 
          background: theme.danger, 
          borderRadius: "6px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center"
        }}>
          <span style={{ marginRight: "10px", fontWeight: "bold" }}>⚠️</span>
          {error}
        </div>
      )}
      
      {/* Status Filter */}
      <div style={{ 
        marginBottom: "25px", 
        background: theme.light, 
        padding: "15px", 
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <label htmlFor="statusFilter" style={{ 
          marginRight: "15px", 
          fontWeight: "bold", 
          color: theme.secondary 
        }}>
          Filter by status:
        </label>
        <select 
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ 
            padding: "10px 15px", 
            borderRadius: "6px", 
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.light,
            color: theme.secondary,
            fontWeight: "500",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="all">All Candidates</option>
          <option value="accepted">Accepted</option>
          <option value="denied">Denied</option>
          <option value="postponed">Postponed</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      
      {/* Candidates Section - Horizontal Layout */}
      <div style={{ 
        marginBottom: "40px", 
        background: theme.light, 
        padding: "20px", 
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
      }}>
        <h2 style={{ 
          marginBottom: "20px", 
          color: theme.primary, 
          borderBottom: `2px solid ${theme.border}`,
          paddingBottom: "10px",
          fontWeight: "600"
        }}>
          <span style={{ marginRight: "10px" }}>👥</span>
          Candidates
        </h2>
        <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          flexWrap: "wrap", 
          gap: "20px", 
          overflowX: "auto", 
          padding: "10px 0" 
        }}>
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => handleCandidateClick(candidate)}
                style={{
                  cursor: "pointer",
                  border: `1px solid ${theme.border}`,
                  borderLeft: `4px solid ${getStatusColor(candidate.latest_interview_status)}`,
                  borderRadius: "10px",
                  padding: "20px",
                  background: theme.light,
                  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  minWidth: "280px",
                  flex: "0 0 auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 6px 12px rgba(255,102,0,0.15)`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.08)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <div style={{ 
                    width: "45px", 
                    height: "45px", 
                    borderRadius: "50%", 
                    backgroundColor: theme.primary, 
                    color: theme.light,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "18px",
                    marginRight: "12px"
                  }}>
                    {getInitials(candidate.username)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: theme.secondary }}>{candidate.username}</h3>
                    <p style={{ margin: "3px 0 0 0", color: "#777", fontSize: "14px" }}>{candidate.email}</p>
                  </div>
                </div>
                
                <div>
                  <p style={{ margin: "8px 0", display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "8px", color: theme.secondary }}>📱</span>
                    <span style={{ color: "#555" }}>{candidate.phone_number || "No phone"}</span>
                  </p>
                  <p style={{ margin: "8px 0", display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "8px", color: theme.secondary }}>💼</span>
                    <span style={{ color: "#555" }}>{candidate.occupation || "Not specified"}</span>
                  </p>
                </div>
                
                <div style={{ marginTop: "15px", borderTop: `1px solid ${theme.border}`, paddingTop: "12px" }}>
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                    <b>Latest Interview:</b> {candidate.latest_interview_date || 'No interviews yet'}
                  </p>
                  <p style={{ margin: "8px 0 0 0" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: theme.light,
                      background: getStatusColor(candidate.latest_interview_status)
                    }}>
                      {candidate.latest_interview_status || 'Pending'}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ padding: "15px", color: "#666", fontStyle: "italic" }}>
              No candidates available with the selected filter.
            </p>
          )}
        </div>
      </div>
      
      {/* Dataset Section - Full Width Table */}
      <div style={{ 
        background: theme.light, 
        padding: "20px", 
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "20px",
          borderBottom: `2px solid ${theme.border}`,
          paddingBottom: "10px"
        }}>
          <h2 style={{ 
            margin: 0, 
            color: theme.primary,
            fontWeight: "600",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{ marginRight: "10px" }}>📊</span>
            Dataset
          </h2>
          <button 
            onClick={downloadCSV}
            disabled={dataset.length === 0}
            style={{
              padding: "10px 18px",
              background: theme.primary,
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: dataset.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s ease",
              opacity: dataset.length === 0 ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (dataset.length > 0) {
                e.currentTarget.style.background = "#e55c00";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = theme.primary;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ marginRight: "8px" }}>⬇️</span>
            Download CSV
          </button>
        </div>
        
        {dataset.length > 0 ? (
          <div style={{ 
            overflowX: "auto", 
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)", 
            borderRadius: "8px",
            border: `1px solid ${theme.border}`
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: theme.primary }}>
                  <th style={{ padding: "14px 15px", textAlign: "left", color: theme.light, fontWeight: "600" }}>User</th>
                  <th style={{ padding: "14px 15px", textAlign: "left", color: theme.light, fontWeight: "600" }}>Email</th>
                  <th style={{ padding: "14px 15px", textAlign: "left", color: theme.light, fontWeight: "600" }}>Date</th>
                  <th style={{ padding: "14px 15px", textAlign: "left", color: theme.light, fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "14px 15px", textAlign: "left", color: theme.light, fontWeight: "600" }}>Summary</th>
                </tr>
              </thead>
              <tbody>
                {dataset.map((data, index) => (
                  <tr 
                    key={index} 
                    style={{ 
                      borderBottom: `1px solid ${theme.border}`,
                      background: index % 2 === 0 ? theme.light : theme.lightGray,
                      transition: "background 0.2s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(255,102,0,0.05)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = index % 2 === 0 ? theme.light : theme.lightGray;
                    }}
                  >
                    <td style={{ padding: "14px 15px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ 
                          width: "32px", 
                          height: "32px", 
                          borderRadius: "50%", 
                          backgroundColor: theme.primary, 
                          color: theme.light,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "14px",
                          marginRight: "10px"
                        }}>
                          {getInitials(data.username)}
                        </div>
                        {data.username || `User ${data.user_id}`}
                      </div>
                    </td>
                    <td style={{ padding: "14px 15px" }}>{data.email || "N/A"}</td>
                    <td style={{ padding: "14px 15px" }}>{data.date}</td>
                    <td style={{ padding: "14px 15px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: theme.light,
                        background: getStatusColor(data.status)
                      }}>
                        {data.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: "14px 15px" }}>
                      {data.summary ? (
                        <div style={{ 
                          maxHeight: "100px", 
                          overflowY: "auto", 
                          padding: "8px", 
                          background: "#f9f9f9", 
                          borderRadius: "4px",
                          border: `1px solid ${theme.border}`,
                          fontSize: "14px"
                        }}>
                          {data.summary}
                        </div>
                      ) : (
                        <span style={{ color: "#999", fontStyle: "italic" }}>No summary available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ padding: "15px", color: "#666", fontStyle: "italic", textAlign: "center" }}>
            No dataset available.
          </p>
        )}
      </div>
      
      {/* Modal for candidate interview summaries */}
      {showModal && selectedCandidate && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(3px)"
          }}
          onClick={closeModal}
        >
          <div
            className="modal-content"
            style={{
              background: theme.light,
              borderRadius: "12px",
              padding: "30px",
              minWidth: "400px",
              maxWidth: "550px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              border: `1px solid ${theme.border}`,
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                fontSize: "22px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.secondary,
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "none";
              }}
            >
              &times;
            </button>
            
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ 
                width: "60px", 
                height: "60px", 
                borderRadius: "50%", 
                backgroundColor: theme.primary, 
                color: theme.light,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "24px",
                marginRight: "15px"
              }}>
                {getInitials(selectedCandidate.username)}
              </div>
              <div>
                <h2 style={{ margin: 0, color: theme.primary }}>{selectedCandidate.username}</h2>
                <p style={{ margin: "5px 0 0 0", color: "#777" }}>{selectedCandidate.email}</p>
              </div>
            </div>
            
            <div style={{ 
              background: theme.lightGray, 
              padding: "15px", 
              borderRadius: "8px", 
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "15px"
            }}>
              <div style={{ flex: "1 0 45%" }}>
                <p style={{ margin: "0 0 5px 0", color: "#777", fontSize: "13px" }}>Phone</p>
                <p style={{ margin: 0, fontWeight: "500" }}>{selectedCandidate.phone_number || "Not provided"}</p>
              </div>
              <div style={{ flex: "1 0 45%" }}>
                <p style={{ margin: "0 0 5px 0", color: "#777", fontSize: "13px" }}>Occupation</p>
                <p style={{ margin: 0, fontWeight: "500" }}>{selectedCandidate.occupation || "Not specified"}</p>
              </div>
            </div>
            
            <h3 style={{ 
              color: theme.primary, 
              borderBottom: `2px solid ${theme.border}`,
              paddingBottom: "10px",
              marginTop: "25px"
            }}>
              Interview History
            </h3>
            
            {interviews.length > 0 ? (
              <ul style={{ listStyleType: "none", padding: 0, maxHeight: "300px", overflowY: "auto" }}>
                {interviews.map((interview, idx) => (
                  <li key={idx} style={{ 
                    marginBottom: "15px", 
                    padding: "15px", 
                    background: theme.lightGray, 
                    borderRadius: "8px",
                    borderLeft: `4px solid ${getStatusColor(interview.status)}`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <p style={{ margin: 0, fontWeight: "500" }}>
                        <span style={{ color: "#777", marginRight: "5px" }}>ID:</span> 
                        {interview.call_id}
                      </p>
                      <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>
                        {interview.date}
                      </p>
                    </div>
                    
                    <p style={{ margin: "10px 0" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: theme.light,
                        background: getStatusColor(interview.status)
                      }}>
                        {interview.status || 'Pending'}
                      </span>
                    </p>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button 
                        style={{ 
                          padding: "8px 15px", 
                          background: theme.success, 
                          color: theme.light, 
                          border: "none", 
                          borderRadius: "6px", 
                          cursor: "pointer",
                          fontWeight: "500",
                          flex: 1,
                          transition: "all 0.2s ease"
                        }} 
                        onClick={() => handleStatusUpdate(interview.id, 'accepted')}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#3da04a";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = theme.success;
                        }}
                      >
                        Accept
                      </button>
                      <button 
                        style={{ 
                          padding: "8px 15px", 
                          background: theme.danger, 
                          color: theme.light, 
                          border: "none", 
                          borderRadius: "6px", 
                          cursor: "pointer",
                          fontWeight: "500",
                          flex: 1,
                          transition: "all 0.2s ease"
                        }} 
                        onClick={() => handleStatusUpdate(interview.id, 'denied')}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#d93535";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = theme.danger;
                        }}
                      >
                        Deny
                      </button>
                      <button 
                        style={{ 
                          padding: "8px 15px", 
                          background: theme.warning, 
                          color: theme.light, 
                          border: "none", 
                          borderRadius: "6px", 
                          cursor: "pointer",
                          fontWeight: "500",
                          flex: 1,
                          transition: "all 0.2s ease"
                        }} 
                        onClick={() => handleStatusUpdate(interview.id, 'postponed')}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#e68a00";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = theme.warning;
                        }}
                      >
                        Postpone
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ padding: "15px", color: "#666", fontStyle: "italic", textAlign: "center" }}>
                No interviews found for this candidate.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;