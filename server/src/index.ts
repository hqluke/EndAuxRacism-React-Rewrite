import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import authRouter from "./routes/auth";
import spotifyRouter from "./routes/spotify";
import { sessionMiddleware } from "./session";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(
    cors({
        origin: process.env.FRONT_END_URL,
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use("/auth", authRouter);
app.use(spotifyRouter);

const PORT = process.env.PORT ?? 3001;

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

io.on("connection", (socket) => {
    console.log("client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("client disconnected:", socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`server listening on :${PORT}`);
});
