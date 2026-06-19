export const metadata = {
  title: "BenSimple. | Ask Ben. It's BenSimple.",
  description: "It was BenSimple. all along. Just had to ask Ben. Turn any dream, problem, or project into a real plan — powered by AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#05060a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
