import { fireEvent, render, screen } from "@testing-library/react";

import TweetCard from "../components/tweet-card";

jest.mock("next/link", () => {
  return function Link({ children, href }) {
    return <a href={href}>{children}</a>;
  };
});

describe("TweetCard", () => {
  const tweet = {
    id: 1,
    text: "hello world",
    author: {
      id: 2,
      username: "alice",
      name: "Alice"
    }
  };

  test("renders a standard tweet", () => {
    render(<TweetCard tweet={tweet} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  test("calls like and delete handlers", async () => {
    const onLike = jest.fn().mockResolvedValue(undefined);
    const onDelete = jest.fn();

    render(<TweetCard canDelete onDelete={onDelete} onLike={onLike} tweet={tweet} />);

    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onLike).toHaveBeenCalledWith(tweet, true);
    expect(onDelete).toHaveBeenCalledWith(tweet);
  });
});
