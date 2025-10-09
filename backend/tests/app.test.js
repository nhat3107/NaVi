import request from "supertest";
import { app } from "../src/lib/socket.js";
import { jest, beforeAll, afterAll } from "@jest/globals";

// Mock console.log to prevent MongoDB connection logs during tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Import server.js to load routes (but don't start the server)
import "../src/server.js";

describe("API Health Check", () => {
  it("GET / should return health status", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "NaVi API is running");
    expect(res.body).toHaveProperty("status", "healthy");
  });

  it("GET /api/auth should return 404 (no specific auth endpoint)", async () => {
    const res = await request(app).get("/api/auth");
    expect(res.statusCode).toBe(404);
  });
});
