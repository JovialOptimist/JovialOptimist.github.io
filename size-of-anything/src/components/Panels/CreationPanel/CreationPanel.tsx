import React from "react";
import "../../../styles/global.css";

export const CreationPanel: React.FC = () => {
  return (
    <div id="creationPanel">
      {/* Panel content goes here */}
      <div>
        <input
          type="text"
          placeholder="Search for anything..."
          className="input-field"
        />
        <button
          id="microphoneButton"
          type="button"
          onClick={() => {
            const input =
              document.querySelector<HTMLInputElement>(".input-field");
            if (!("webkitSpeechRecognition" in window)) {
              alert("Speech recognition not supported in this browser.");
              return;
            }
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.onresult = (event: any) => {
              if (input) {
                input.value = event.results[0][0].transcript;
                input.dispatchEvent(new Event("input", { bubbles: true }));
              }
            };
            recognition.onerror = () => {
              alert("Speech recognition error.");
            };
            recognition.start();
          }}
        >
          🎤
        </button>
        <button id="searchButton">🔍</button>
      </div>
    </div>
  );
};
