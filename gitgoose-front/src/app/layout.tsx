import { ApolloWrapper } from "@/lib/apollo/ApolloWrapper";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitGoose",
  description: "A modern Git platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>
          <ThemeProvider>{children}</ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
