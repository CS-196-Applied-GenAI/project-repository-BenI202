import "./globals.css";
import { AuthProvider } from "../contexts/auth-context";

export const metadata = {
  title: "Chirper",
  description: "Twitter-like frontend for the Chirper backend."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
