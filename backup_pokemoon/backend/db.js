const mongoose = require("mongoose");

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

// Định nghĩa schema và model cho bảng pokemon
const pokemonSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    name: String,
    image: String,
  },
  { _id: false }
);

const Pokemon = mongoose.model("Pokemon", pokemonSchema);

// Dữ liệu mẫu
const pokemonData = [
  { id: 1, name: "Bulbasaur", image: "https://example.com/bulbasaur.png" },
  { id: 2, name: "Ivysaur", image: "https://example.com/ivysaur.png" },
  { id: 3, name: "Venusaur", image: "https://example.com/venusaur.png" },
  { id: 4, name: "Charmander", image: "https://example.com/charmander.png" },
  { id: 5, name: "Charmeleon", image: "https://example.com/charmeleon.png" },
  { id: 6, name: "Charizard", image: "https://example.com/charizard.png" },
  { id: 7, name: "Squirtle", image: "https://example.com/squirtle.png" },
  { id: 8, name: "Wartortle", image: "https://example.com/wartortle.png" },
  { id: 9, name: "Blastoise", image: "https://example.com/blastoise.png" },
  { id: 10, name: "Caterpie", image: "https://example.com/caterpie.png" },
  { id: 11, name: "Metapod", image: "https://example.com/metapod.png" },
  { id: 12, name: "Butterfree", image: "https://example.com/butterfree.png" },
  { id: 13, name: "Weedle", image: "https://example.com/weedle.png" },
  { id: 14, name: "Kakuna", image: "https://example.com/kakuna.png" },
  { id: 15, name: "Beedrill", image: "https://example.com/beedrill.png" },
  { id: 16, name: "Pidgey", image: "https://example.com/pidgey.png" },
  { id: 17, name: "Pidgeotto", image: "https://example.com/pidgeotto.png" },
  { id: 18, name: "Pidgeot", image: "https://example.com/pidgeot.png" },
  { id: 19, name: "Rattata", image: "https://example.com/rattata.png" },
  { id: 20, name: "Raticate", image: "https://example.com/raticate.png" },
];

// Thêm dữ liệu mẫu vào MongoDB
Pokemon.insertMany(pokemonData)
  .then(() => {
    console.log("Pokemon data inserted successfully!");
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error("Error inserting pokemon data:", error);
  });
