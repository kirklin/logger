import kirklin from "@kirklin/eslint-config";

export default kirklin({
  rules: {
    "node/prefer-global/process": "off",
    "no-console": "off",
  },
});
