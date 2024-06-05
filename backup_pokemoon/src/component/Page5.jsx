import React from "react";

export default function Page5(props) {
  const { user, handleRoll, showNum } = props;

  return (
    <div>
      <div className="info">
        <p>
          {user.firstname} {user.lastname}
        </p>
        <p>Your Coin: ${showNum(user.coin)}</p>
      </div>
      <div className="field"></div>
      <div className="roll">
        <button onClick={handleRoll}>Roll</button>
      </div>
    </div>
  );
}
