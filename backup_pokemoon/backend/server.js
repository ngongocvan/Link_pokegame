const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const axiosRetry = require("axios-retry");
const bodyParser = require("body-parser");
const cors = require("cors");

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng CORS và body-parser
app.use(cors());
app.use(bodyParser.json());

// Kết nối MongoDB Atlas
const mongoUri =
  "mongodb+srv://ngocvan016355:RM8RmBGMBcAnnJJP@cluster0.w6ij7qb.mongodb.net/bot_tele?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});

// Định nghĩa schema và model cho người dùng
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  username: String,
  firstname: String,
  lastname: String,
  checked: Boolean,
  coin: { type: String, default: "1000" },
});

const User = mongoose.model("User", userSchema);

// Định nghĩa schema và model cho nhiệm vụ
const questSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  joinGroup: { type: Boolean, default: false },
  joinChannel: { type: Boolean, default: false },
});

const Quest = mongoose.model("Quest", questSchema);

// Định nghĩa schema và model cho bảng pokemon
const pokemonSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: String,
  image: String,
});

const Pokemon = mongoose.model("Pokemon", pokemonSchema);

// Định nghĩa schema và model cho bảng pokedeck
const pokedeckSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
});

const Pokedeck = mongoose.model("Pokedeck", pokedeckSchema);
//Pokedeck Info
const pokedeckInfoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  id_pokedeck: { type: String, required: true }, // Đảm bảo id_pokedeck là userId
  id_pokemon: { type: Number, required: true },
  level: { type: Number, default: 1 },
  cost: { type: String, default: "779" },
  mine: { type: String, default: "6.45" },
});

const PokedeckInfo = mongoose.model("PokedeckInfo", pokedeckInfoSchema);
// Định nghĩa endpoint để lấy dữ liệu user từ ID
app.post("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { username, firstname, lastname, checked } = req.body;

  if (!username || !firstname || !lastname) {
    return res
      .status(400)
      .json({ message: "Missing required user information" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { userId }, // Điều kiện để tìm người dùng
      {
        $setOnInsert: {
          userId,
          username,
          firstname,
          lastname,
          checked,
          coin: "1000",
        },
      }, // Chỉ cập nhật các trường khi tạo mới
      { upsert: true, new: true, setDefaultsOnInsert: true } // Tùy chọn để tạo mới nếu không tìm thấy, và trả về bản ghi mới nhất
    );

    res.json(user);
  } catch (error) {
    console.error("Error in /user/:userId endpoint:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch or create user data", error });
  }
});

// Roll
app.post("/roll/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Tìm người dùng
    let user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userCoin = parseFloat(user.coin);

    if (userCoin < 250.0) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    user.coin = (userCoin - 250.0).toString();
    await user.save();

    // Chọn ngẫu nhiên một Pokémon từ bảng `pokemon`
    const pokemonCount = await Pokemon.countDocuments();
    const randomIndex = Math.floor(Math.random() * pokemonCount);
    const randomPokemon = await Pokemon.findOne().skip(randomIndex);

    // Tạo bản ghi mới trong bảng `pokedeckInfo`
    const pokedeck = await Pokedeck.findOne({ userId });
    if (!pokedeck) {
      return res.status(404).json({ message: "Pokedeck not found" });
    }

    // Tạo giá trị số ngẫu nhiên cho `id`
    const newId = Math.floor(Math.random() * 1000000); // Giá trị ID mới ngẫu nhiên

    const pokedeckInfo = new PokedeckInfo({
      id: newId, // Sử dụng giá trị số cho `id`
      id_pokedeck: userId,
      id_pokemon: randomPokemon.id,
      level: 1,
      cost: 779,
      mine: 6.45,
    });
    await pokedeckInfo.save();

    res.json({
      user,
      pokedeckInfo,
      message: "Roll successful, new PokedeckInfo created",
    });
  } catch (error) {
    console.error("Error in /roll/:userId endpoint:", error);
    res.status(500).json({ message: "Failed to perform roll", error });
  }
});

// Định nghĩa endpoint để xử lý yêu cầu POST
app.post("/save", async (req, res) => {
  const { userId, username, firstname, lastname, checked, coin } = req.body;

  if (!userId || !username || !firstname || !lastname) {
    return res
      .status(400)
      .json({ message: "Missing required user information" });
  }

  try {
    // Cập nhật hoặc tạo mới thông tin người dùng
    const savedUser = await User.findOneAndUpdate(
      { userId }, // Điều kiện để tìm user
      { userId, username, firstname, lastname, checked, coin }, // Dữ liệu để cập nhật
      { upsert: true, new: true, setDefaultsOnInsert: true } // Tùy chọn upsert để tạo mới nếu không tìm thấy, và trả về bản ghi mới nhất
    );
    // Tạo mới bảng pokedeck cho người dùng nếu chưa tồn tại
    await Pokedeck.findOneAndUpdate(
      { userId }, // Điều kiện để tìm pokedeck
      { userId }, // Dữ liệu để cập nhật
      { upsert: true, new: true, setDefaultsOnInsert: true } // Tùy chọn upsert để tạo mới nếu không tìm thấy, và trả về bản ghi mới nhất
    );
    // Cập nhật hoặc tạo mới thông tin nhiệm vụ
    await Quest.findOneAndUpdate(
      { userId },
      { userId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // console.log(savedUser);
    // Tạo mới bảng pokedeck cho người dùng

    // Kiểm tra trạng thái thành viên của người dùng trong kênh và nhóm Telegram
    const isMemberC = await checkTelegramMembership(
      TELEGRAM_CHANNEL_ID,
      userId
    );
    if (isMemberC) {
      await Quest.findOneAndUpdate({ userId }, { joinChannel: true });
    }

    const isMemberG = await checkTelegramMembership(TELEGRAM_GROUP_ID, userId);
    if (isMemberG) {
      await Quest.findOneAndUpdate({ userId }, { joinGroup: true });
    }

    // Trả về thông tin người dùng đã được cập nhật hoặc tạo mới
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error in /save endpoint:", error);
    res.status(500).json({ message: "Failed to save user data", error });
  }
});

const TELEGRAM_BOT_TOKEN = "7063132573:AAH6SBa6XuL589124FWeAQxNhfmpmjBlceU";
const TELEGRAM_CHANNEL_ID = "-1002200710266"; // Đảm bảo rằng Chat ID đúng
const TELEGRAM_GROUP_ID = "-1002222187506"; // Thay thế bằng Chat ID của nhóm

// Cấu hình axios-retry
axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

const checkTelegramMembership = async (chatId, userId) => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`,
      {
        params: {
          chat_id: chatId,
          user_id: userId,
        },
        timeout: 50000,
      }
    );
    return (
      response.data.result.status === "member" ||
      response.data.result.status === "administrator" ||
      response.data.result.status === "creator"
    );
  } catch (error) {
    console.error(
      "Error checking membership:",
      error.response ? error.response.data : error.message
    );
    return false;
  }
};

app.post("/check-channel", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.error("User ID is required");
    return res.status(400).json({ error: "User ID is required" });
  }

  const isMember = await checkTelegramMembership(TELEGRAM_CHANNEL_ID, userId);
  if (isMember) {
    await Quest.findOneAndUpdate({ userId }, { joinChannel: true });
  } else {
    await Quest.findOneAndUpdate({ userId }, { joinChannel: false });
  }
  res.json({ isMember });
});

app.post("/check-group", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.error("User ID is required");
    return res.status(400).json({ error: "User ID is required" });
  }

  const isMember = await checkTelegramMembership(TELEGRAM_GROUP_ID, userId);
  if (isMember) {
    await Quest.findOneAndUpdate({ userId }, { joinGroup: true });
  } else {
    await Quest.findOneAndUpdate({ userId }, { joinGroup: false });
  }
  res.json({ isMember });
});

// Bắt đầu server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
