import { render, screen } from "@testing-library/react";

import ProtectedAppLayout from "../components/protected-app-layout";
import { useAuth } from "../contexts/auth-context";

const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace
  }),
  usePathname: () => "/"
}));

jest.mock("next/link", () => {
  return function Link({ children, href }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("../contexts/auth-context", () => ({
  useAuth: jest.fn()
}));

describe("ProtectedAppLayout", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  test("shows loading while auth is bootstrapping", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      status: "loading"
    });

    render(
      <ProtectedAppLayout>
        <div>Secret</div>
      </ProtectedAppLayout>
    );

    expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
  });

  test("renders children when authenticated", () => {
    useAuth.mockReturnValue({
      currentUser: {
        username: "alice",
        name: "Alice"
      },
      isAuthenticated: true,
      logout: jest.fn(),
      status: "authenticated"
    });

    render(
      <ProtectedAppLayout>
        <div>Secret</div>
      </ProtectedAppLayout>
    );

    expect(screen.getByText("Secret")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
