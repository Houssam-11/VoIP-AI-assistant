import { useState, useEffect } from "react";
import { vapi, startAssistant, stopAssistant } from "../ai";
import ActiveCallDetails from "../call/ActiveCallDetails";
import { useNavigate } from "react-router-dom";

function InterviewForm() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callId, setCallId] = useState("");
  const [callResult, setCallResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    vapi
      .on("call-start", () => {
        setLoading(false);
        setStarted(true);
      })
      .on("call-end", () => {
        setStarted(false);
        setLoading(false);
      })
      .on("speech-start", () => {
        setAssistantIsSpeaking(true);
      })
      .on("speech-end", () => {
        setAssistantIsSpeaking(false);
      })
      .on("volume-level", (level) => {
        setVolumeLevel(level);
      });
  }, []);

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const handleStart = async () => {
    setLoading(true);
    const data = await startAssistant(firstName, lastName, email, phoneNumber);
    setCallId(data.id);
  };

  const handleStop = () => {
    stopAssistant();
    getCallDetails();
  };

  const getCallDetails = (interval = 3000) => {
    setLoadingResult(true);
    setError(null);
    const token = localStorage.getItem("token");
    fetch("/api/call-details?call_id=" + callId, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoadingResult(false);
        } else if (data.analysis && data.summary) {
          setCallResult(data);
          setLoadingResult(false);
        } else {
          setTimeout(() => getCallDetails(interval), interval);
        }
      })
      .catch((error) => {
        setError("Failed to fetch call details.");
        setLoadingResult(false);
      });
  };

  // Save interview to backend after call result is received
  useEffect(() => {
    if (callResult && callId) {
      const saveInterview = async () => {
        try {
          const token = localStorage.getItem("token");
          await fetch("/api/save-interview", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              call_id: callId,
              summary: callResult.summary,
              status: "pending",
              structured_data: callResult.analysis?.structuredData || null,
            }),
          });
        } catch (err) {
          
        }
      };
      saveInterview();
    }
  }, [callResult, callId]);

  // Save interview to backend and redirect
  const handleSaveAndGoDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/save-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          call_id: callId,
          summary: callResult.summary,
          status: "pending",
          structured_data: callResult.analysis?.structuredData || null,
        }),
      });
      navigate("/user-dashboard");
    } catch (err) {
      setError("Failed to save interview. Please try again.");
    }
  };

  const showForm = !loading && !started && !loadingResult && !callResult;
  const allFieldsFilled = firstName && lastName && email && phoneNumber;

  
  return (
    <div className="app-container">
      {showForm && (
        <>
          <h1>Contact Details (Required)</h1>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            className="input-field"
            onChange={handleInputChange(setFirstName)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            className="input-field"
            onChange={handleInputChange(setLastName)}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            className="input-field"
            onChange={handleInputChange(setEmail)}
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            className="input-field"
            onChange={handleInputChange(setPhoneNumber)}
          />
          {!started && (
            <button
              onClick={handleStart}
              disabled={!allFieldsFilled}
              className="button"
            >
              Start Application Call
            </button>
          )}
        </>
      )}
      {started && (
        <div>
          <ActiveCallDetails
            assistantIsSpeaking={assistantIsSpeaking}
            volumeLevel={volumeLevel}
            endCallCallback={handleStop}
            callId={callId}
          />
        </div>
      )}
      {loading && !started && <div className="loading"></div>}
      {loadingResult && <p>Loading call details... please wait</p>}
      {error && <p className="error">{error}</p>}
      {!loadingResult && callResult && (
        <div className="call-result">
          <p>Qualified: {callResult.analysis.structuredData.is_qualified.toString()}</p>
          <p>{callResult.summary}</p>
          <button className="button" style={{ marginTop: 24 }} onClick={handleSaveAndGoDashboard}>
            Save & Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default InterviewForm;
