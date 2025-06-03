import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/interview-history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setHistory(data.history);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch interview history");
      }
    };

    fetchHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-container" style={{ 
      padding: "30px", 
      backgroundColor: "#f5f5f5",
      minHeight: "100vh"
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "30px", 
        borderBottom: "2px solid #ff6600",
        paddingBottom: "15px",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img 
            src="/assets/orange.png" 
            alt="Orange Maroc Logo" 
            style={{ height: "40px", marginRight: "15px" }} 
          />
          <h1 style={{ 
            margin: 0, 
            color: "#ff6600", 
            fontWeight: "bold", 
            fontSize: "28px" 
          }}>
            User Dashboard
          </h1>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            background: "#ff6600",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#e55c00";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#ff6600";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Logout
        </button>
      </div>
      
      {error && (
        <div style={{ 
          color: "#fff", 
          padding: "12px 15px", 
          background: "#f03e3e", 
          borderRadius: "6px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center"
        }}>
          <span style={{ marginRight: "10px", fontWeight: "bold" }}>⚠️</span>
          {error}
        </div>
      )}
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "30px",
        marginTop: "20px" 
      }}>
        <div style={{ 
          background: "#fff", 
          padding: "25px", 
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}>
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: "20px", 
            color: "#ff6600",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{ marginRight: "10px" }}>🎤</span>
            Start Interview
          </h2>
          <button 
            onClick={() => navigate("/interview-form")} 
            style={{
              padding: "12px 24px",
              background: "#ff6600",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              width: "100%",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e55c00";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(255,102,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#ff6600";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Start New Interview
          </button>
        </div>
        
        <div style={{ 
          background: "#fff", 
          padding: "25px", 
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}>
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: "20px", 
            color: "#ff6600",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{ marginRight: "10px" }}>📋</span>
            Interview History
          </h2>
          {history.length > 0 ? (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {history.map((item, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: "15px", 
                    marginBottom: "15px", 
                    borderRadius: "8px", 
                    background: "#f9f9f9",
                    borderLeft: `4px solid ${item.status === 'accepted' ? '#4CAF50' : 
                                          item.status === 'denied' ? '#f03e3e' :
                                          item.status === 'postponed' ? '#ff9800' : '#666'}`
                  }}
                >
                  <p style={{ margin: "5px 0", fontSize: "15px" }}>
                    <b style={{ color: "#555" }}>Call ID:</b> {item.call_id}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "15px" }}>
                    <b style={{ color: "#555" }}>Date:</b> {item.date}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "15px" }}>
                    <b style={{ color: "#555" }}>Status:</b> 
                    <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "white",
                      marginLeft: "5px",
                      background: item.status === 'accepted' ? '#4CAF50' : 
                                item.status === 'denied' ? '#f03e3e' :
                                item.status === 'postponed' ? '#ff9800' : '#666'
                    }}>
                      {item.status || 'Pending'}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ 
              padding: "20px", 
              textAlign: "center", 
              color: "#666", 
              background: "#f9f9f9", 
              borderRadius: "8px",
              fontStyle: "italic" 
            }}>
              No interview history available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
