export function textToolResult(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
  };
}

export function jsonToolResult(value: unknown) {
  return textToolResult(JSON.stringify(value, null, 2));
}
