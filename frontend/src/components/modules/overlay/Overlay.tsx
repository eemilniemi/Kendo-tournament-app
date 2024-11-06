import React from "react";
import "./Overlay.css";

function Overlay(): React.ReactElement {
  return (
    <div className="overlay-container">
      <div className="overlay-teams">
        {/* Team A Section */}
        <div className="team team-a">
          <div className="team-name">{"player1"}</div>
          <div className="team-score">{"0"}</div>
        </div>

        <div className="overlay-status">
          {/* Status Section */}
          <div className="status-text">{"some text"}</div>
        </div>

        {/* Team B Section */}
        <div className="team team-b">
          <div className="team-name">{"player2"}</div>
          <div className="team-score">{"1"}</div>
        </div>
      </div>
    </div>
  );
}

export default Overlay;
