import { fireEvent, render, screen } from "@testing-library/react";

import FollowButton from "../components/follow-button";

describe("FollowButton", () => {
  test("toggles after a successful callback", async () => {
    const onFollowChange = jest.fn().mockResolvedValue(undefined);

    render(<FollowButton onFollowChange={onFollowChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Follow" }));

    expect(onFollowChange).toHaveBeenCalledWith(true);
  });
});
