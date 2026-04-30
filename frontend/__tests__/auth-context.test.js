import { act, render, screen, waitFor } from "@testing-library/react";

import { AuthProvider, useAuth } from "../contexts/auth-context";
import * as api from "../lib/api";

jest.mock("../lib/api");

function Consumer() {
  const { currentUser, login, logout, status } = useAuth();

  return (
    <div>
      <p>{status}</p>
      <p>{currentUser?.username || "no-user"}</p>
      <button
        onClick={() => login({ username: "alice", password: "password1" })}
        type="button"
      >
        Login
      </button>
      <button onClick={() => logout()} type="button">
        Logout
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("bootstraps session state from /auth/me", async () => {
    api.getCurrentUser.mockResolvedValue({
      user: {
        username: "alice"
      }
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("authenticated")).toBeInTheDocument());
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  test("updates state on login and logout", async () => {
    api.getCurrentUser.mockRejectedValue(new Error("No session"));
    api.login.mockResolvedValue({
      user: {
        username: "alice"
      }
    });
    api.logout.mockResolvedValue({
      message: "ok"
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("unauthenticated")).toBeInTheDocument());

    await act(async () => {
      screen.getByRole("button", { name: "Login" }).click();
    });

    expect(screen.getByText("authenticated")).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();

    await act(async () => {
      screen.getByRole("button", { name: "Logout" }).click();
    });

    expect(screen.getByText("unauthenticated")).toBeInTheDocument();
  });
});
