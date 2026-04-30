import { render, screen } from "@testing-library/react";

import EmptyState from "../components/empty-state";
import ErrorState from "../components/error-state";
import LoadingState from "../components/loading-state";
import ProfileHeader from "../components/profile-header";

jest.mock("next/link", () => {
  return function Link({ children, href }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("../components/follow-button", () => {
  return function FollowButton() {
    return <button type="button">Follow</button>;
  };
});

describe("display components", () => {
  test("renders basic empty, error, and loading states", () => {
    render(
      <div>
        <EmptyState message="Nothing here yet." title="Empty" />
        <ErrorState message="Something broke." title="Error" />
        <LoadingState label="Loading timeline" />
      </div>
    );

    expect(screen.getByText("Empty")).toBeInTheDocument();
    expect(screen.getByText("Something broke.")).toBeInTheDocument();
    expect(screen.getByText(/loading timeline/i)).toBeInTheDocument();
  });

  test("renders a profile header for the current user", () => {
    render(
      <ProfileHeader
        currentUsername="alice"
        onFollowChange={jest.fn()}
        profile={{
          username: "alice",
          name: "Alice",
          bio: "Bio"
        }}
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
    expect(screen.getByText("Edit profile")).toBeInTheDocument();
  });
});
