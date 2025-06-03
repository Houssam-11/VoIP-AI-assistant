import AssistantSpeechIndicator from "./AssistantSpeechIndicator";
import VolumeLevel from "./VolumeLevel";

const ActiveCallDetails = ({
  assistantIsSpeaking,
  volumeLevel,
  endCallCallback,
  callId
}) => {
  const handleEndCall = async () => {
    try {
      const token = localStorage.getItem("token");
      // First get call details - using /api prefix
      const callDetailsResponse = await fetch(`/api/call-details?call_id=${callId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!callDetailsResponse.ok) {
        const responseText = await callDetailsResponse.text();
        console.error(`Error fetching call details: ${callDetailsResponse.status} ${callDetailsResponse.statusText}`, `Response body: ${responseText.substring(0, 500)}...`);
        throw new Error(`Failed to fetch call details. Status: ${callDetailsResponse.status}.`);
      }

      const contentType = callDetailsResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await callDetailsResponse.text();
        console.error("Received non-JSON response from /call-details:", `Response body: ${responseText.substring(0, 500)}...`);
        throw new TypeError(`Expected JSON from /call-details, but received ${contentType}.`);
      }
      
      const callData = await callDetailsResponse.json();
      
      // Then save the interview - usin /api prefix
      const saveInterviewResponse = await fetch('/api/save-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          call_id: callId,
          summary: callData.summary, // Ensure callData has summary
          structured_data: callData.analysis // Ensure callData has analysis
        })
      });

      if (!saveInterviewResponse.ok) {
        const errorText = await saveInterviewResponse.text();
        console.error(`Error saving interview: ${saveInterviewResponse.status} ${saveInterviewResponse.statusText}`, `Response body: ${errorText.substring(0, 500)}...`);
        throw new Error(`Failed to save interview. Status: ${saveInterviewResponse.status}.`);
      }

    } catch (error) {
      console.error('Error during end call process:', error); // Updated error message
    }
    endCallCallback();
  };

  return (
    <div className="active-call-detail">
      <div className="call-info">
        <AssistantSpeechIndicator isSpeaking={assistantIsSpeaking} />
        <VolumeLevel volume={volumeLevel} />
      </div>
      <div className="end-call-button">
        <button onClick={handleEndCall}>End Call</button>
      </div>
    </div>
  );
};

export default ActiveCallDetails
