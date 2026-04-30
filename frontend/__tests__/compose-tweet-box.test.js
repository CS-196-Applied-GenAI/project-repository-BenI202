import { fireEvent, render, screen } from "@testing-library/react";

import ComposeTweetBox from "../components/compose-tweet-box";

describe("ComposeTweetBox", () => {
  test("validates empty tweets before submitting", async () => {
    const onSubmit = jest.fn();

    render(<ComposeTweetBox onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /post tweet/i }));

    expect(await screen.findByText("Tweet text is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("submits trimmed tweet text", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<ComposeTweetBox onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/what is happening today/i), {
      target: { value: "  hello chirper  " }
    });
    fireEvent.click(screen.getByRole("button", { name: /post tweet/i }));

    expect(onSubmit).toHaveBeenCalledWith({ text: "hello chirper" });
  });
});
