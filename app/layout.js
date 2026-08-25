export const metadata = {
  title: "N&T AI-Powered Sustainable Finance & Accounting",
  description:
    "AI-powered sustainable finance, accounting, ESG and carbon management client platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
