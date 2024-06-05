import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import "./App.css";
import Page1 from "./component/Page1";
import Page2 from "./component/Page2";
import Page3 from "./component/Page3";
import Page4 from "./component/Page4";
import Page5 from "./component/Page5";
import { ArrowRightOutlined } from "@ant-design/icons";
import axios from "axios";
import { message } from "antd";

function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);
  const [ischecked, setIsChecked] = useState();
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (count < 3) setCount(count + 1);
    },
    onSwipedRight: () => {
      if (count < 3 && count > 0) setCount(count - 1);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });
  const slides = [1, 2, 3, 4];
  const handleNext = () => {
    setCount(count + 1);
  };
  const [joinChannel, setJoinChannel] = useState(false);
  const [joinGroup, setJoinGroup] = useState(false);
  const [channelButtonImg, setChannelButtonImg] = useState("./checkbox.png");
  const [groupButtonImg, setGroupButtonImg] = useState("./checkbox.png");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (window.Telegram?.WebApp) {
      const telegram = window.Telegram.WebApp;
      telegram.ready();

      if (telegram.initDataUnsafe?.user) {
        try {
          const telegramUser = telegram.initDataUnsafe.user;
          const userId = telegramUser.id.toString();
          const url = `https://pokegram.games/user/${userId}`;

          const userPayload = {
            username: telegramUser.username || "",
            firstname: telegramUser.first_name || "",
            lastname: telegramUser.last_name || "",
            checked: false,
          };

          console.log("UserID:", userId);
          console.log("URL:", url);
          const response = await axios.post(url, userPayload);
          setUser(response.data);
          if (userId) {
            checkMemberships(userId);
          }
          if (response?.data.checked) {
            setIsChecked(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        console.error("Thông tin người dùng không khả dụng.");
      }
    } else {
      console.error("SDK Telegram WebApp không khả dụng.");
    }
  };

  const checkMemberships = async (userId) => {
    const isChannelMember = await checkChannel(userId);
    const isGroupMember = await checkGroup(userId);

    setJoinChannel(isChannelMember);
    setJoinGroup(isGroupMember);

    if (isChannelMember) {
      setChannelButtonImg("./check.png");
    } else {
      setChannelButtonImg("./checkbox.png");
    }

    if (isGroupMember) {
      setGroupButtonImg("./check.png");
    } else {
      setGroupButtonImg("./checkbox.png");
    }
  };

  const checkChannel = async (userId) => {
    try {
      const response = await axios.post(
        "https://pokegram.games/check-channel",
        { userId },
        { timeout: 10000 }
      );
      return response.data.isMember;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thành viên kênh:", error);
      return false;
    }
  };

  const checkGroup = async (userId) => {
    try {
      const response = await axios.post(
        "https://pokegram.games/check-group",
        { userId },
        { timeout: 10000 }
      );
      return response.data.isMember;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thành viên nhóm:", error);
      return false;
    }
  };

  const handleCheckCh = async () => {
    setChannelButtonImg("./loading.png");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const isMember = await checkChannel(user.userId);
    setTimeout(() => {
      if (isMember) {
        setJoinChannel(true);
        setChannelButtonImg("./check.png");
      } else {
        setJoinChannel(false);
        setChannelButtonImg("./checkbox.png");
        message.warning("Bạn chưa tham gia kênh.");
      }
    }, 5000);
  };

  const handleCheckGr = async () => {
    setGroupButtonImg("./loading.png");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const isMember = await checkGroup(user.userId);
    setTimeout(() => {
      if (isMember) {
        setJoinGroup(true);
        setGroupButtonImg("./check.png");
      } else {
        setJoinGroup(false);
        setGroupButtonImg("./checkbox.png");
        message.warning("Bạn chưa tham gia nhóm.");
      }
    }, 5000);
  };

  const saveUserData = async () => {
    const isChannelMember = await checkChannel(user?.userId);
    const isGroupMember = await checkGroup(user?.userId);
    if (isChannelMember && isGroupMember) {
      setUser((prevUser) => ({ ...prevUser, checked: true }));
      setIsChecked(true);
    } else {
      setUser((prevUser) => ({ ...prevUser, checked: false }));
      setIsChecked(false);
    }
    if (!user.checked) {
      message.warning(
        "Vui lòng hoàn thành tất cả các bước trước khi tiếp tục."
      );
      return;
    }
    try {
      const response = await axios.post("https://pokegram.games/save", user, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      message.success("Chào mừng đến với bot của chúng tôi!");
      console.log(response.data);
      setCount(4);
    } catch (error) {
      if (error.response) {
        console.error("Dữ liệu phản hồi:", error.response.data);
        console.error("Trạng thái phản hồi:", error.response.status);
        console.error("Headers phản hồi:", error.response.headers);
        message.error(
          `Lưu dữ liệu người dùng thất bại. Máy chủ phản hồi với mã trạng thái ${error.response.status}.`
        );
      } else if (error.request) {
        console.error("Dữ liệu yêu cầu:", error.request);
        message.error(
          "Lưu dữ liệu người dùng thất bại. Không nhận được phản hồi từ máy chủ."
        );
      } else {
        console.error("Thông báo lỗi:", error.message);
        message.error(
          "Lưu dữ liệu người dùng thất bại. Lỗi trong việc thiết lập yêu cầu."
        );
      }
      console.error("Cấu hình lỗi:", error.config);
    }
  };
  const showNum = (num) => {
    if (num >= 1000 && num <= 1000000) {
      return num / 1000 + "K";
    } else if (num >= 1000000) {
      return num / 1000000 + "M";
    }
  };

  useEffect(() => {
    if (joinChannel && joinGroup) {
      setUser((prevUser) => ({ ...prevUser, checked: true }));
    }
  }, [joinChannel, joinGroup]);

  const handleRoll = async () => {
    if (!user || user.coin < 250) {
      message.warning("You do not have enough coins to roll.");
      return;
    }
    console.log(user);
    try {
      const response = await axios.post(
        `https://pokegram.games/roll/${user.userId}`
      );
      setUser(response.data.user);
      message.success("Roll successful! 250 coins have been deducted.");
    } catch (error) {
      console.error("Error performing roll:", error);
      message.error("Failed to perform roll. Please try again.");
    }
  };

  const [startButtonVisible, setStartButtonVisible] = useState(false);
  useEffect(() => {
    if (joinChannel && joinGroup) {
      setStartButtonVisible(true);
    } else {
      setStartButtonVisible(false);
    }
  }, [joinChannel, joinGroup]);
  return (
    <div className="main" {...handlers}>
      {!ischecked && (
        <div className="uncheck">
          {count === 0 && <Page1 />}
          {count === 1 && <Page2 />}
          {count === 2 && <Page3 />}
          {count === 3 && (
            <Page4
              joinChannel={joinChannel}
              joinGroup={joinGroup}
              channelButtonImg={channelButtonImg}
              groupButtonImg={groupButtonImg}
              handleCheckCh={handleCheckCh}
              handleCheckGr={handleCheckGr}
              saveUserData={saveUserData}
              startButtonVisible={startButtonVisible}
            />
          )}
          {count === 4 && <Page5 user={user} handleRoll={handleRoll} />}
          {count < 3 && (
            <div className="slide-nav">
              {slides.map((_, index) => (
                <span
                  key={index}
                  className={`nav-dot ${index === count ? "active" : ""}`}
                  onClick={() => setCount(index)}
                ></span>
              ))}
            </div>
          )}
          {count < 3 && (
            <button className="button-next" onClick={handleNext}>
              <span>Next</span>
              <ArrowRightOutlined />
            </button>
          )}
        </div>
      )}
      {ischecked && (
        <div className="check">
          <Page5 user={user} handleRoll={handleRoll} showNum={showNum} />
        </div>
      )}
    </div>
  );
}

export default App;
