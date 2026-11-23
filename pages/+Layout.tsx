import "@mantine/core/styles.css";
import { createTheme, List, MantineProvider, Text } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

const theme = createTheme({
  components: {
    List: List.extend({
      defaultProps: { size: "sm" },
    }),
    Text: Text.extend({
      defaultProps: { size: "sm" },
    }),
  },
  cursorType: "pointer", // needed for anchor tags to have a pointer cursor
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false, // default: true
            retry: false, // default: 3
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>{children}</MantineProvider>
    </QueryClientProvider>
  );
}
