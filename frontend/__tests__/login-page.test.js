import { render, screen } from "@testing-library/react";

import LoginPage from "../app/(auth)/login/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn()
  })
}));

jest.mock("next/link", () => {
  return function Link({ children, href }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("../contexts/auth-context", () => ({
  useAuth: () => ({
    login: jest.fn(),
    status: "unauthenticated"
  })
}));

describe("LoginPage", () => {
  test("renders the login flow", () => {
    render(<LoginPage />);

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Create one")).toBeInTheDocument();
  });
});
