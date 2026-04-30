import { fireEvent, render, screen } from "@testing-library/react";

import AuthForm from "../components/auth-form";

describe("AuthForm", () => {
  test("collects values and submits them", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <AuthForm
        buttonLabel="Log in"
        fields={[
          { name: "username", label: "Username", type: "text" },
          { name: "password", label: "Password", type: "password" }
        ]}
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "alice" }
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password1" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(onSubmit).toHaveBeenCalledWith({
      username: "alice",
      password: "password1"
    });
  });
});
