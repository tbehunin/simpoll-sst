export const devCmd = new sst.x.DevCommand("Studio", {
  dev: {
    autostart: true,
    command: "npx drizzle-kit studio",
  },
});
