import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders the knowledge base app", async () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /KONCRIT/i })).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith("/api/articles", expect.any(Object)));
});
