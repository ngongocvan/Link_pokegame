import { ArrowRightOutlined } from "@ant-design/icons";

export default function Page4(props) {
  const {
    joinChannel,
    joinGroup,
    channelButtonImg,
    groupButtonImg,
    handleCheckCh,
    handleCheckGr,
    saveUserData,
    startButtonVisible,
  } = props;

  return (
    <div className="page">
      <img src="./img2.jpg" alt="" />
      <ul className="check-menu">
        <li className="item">
          <a href="https://t.me/test_bot_channel_ver2">
            <button
              onClick={handleCheckCh}
              disabled={joinChannel}
              className="join"
            >
              <div className="li1">
                <img
                  src={channelButtonImg}
                  alt={joinChannel ? "Checked" : "Unchecked"}
                />
                <span>Join my channel</span>
              </div>
              <div className="li2">
                {" "}
                <ArrowRightOutlined />
              </div>
            </button>
          </a>
        </li>
        <li className="item">
          <a href="https://t.me/+QyiZG-_D4IMxMDFl">
            <button
              onClick={handleCheckGr}
              disabled={joinGroup}
              className="join"
            >
              <div className="li1">
                <img
                  src={groupButtonImg}
                  alt={joinGroup ? "Checked" : "Unchecked"}
                />
                <span>Join my group</span>
              </div>
              <div className="li2">
                {" "}
                <ArrowRightOutlined />
              </div>
            </button>
          </a>
        </li>
      </ul>
      {startButtonVisible && (
        <button type="primary" className="button-next" onClick={saveUserData}>
          Start Now
        </button>
      )}
    </div>
  );
}
