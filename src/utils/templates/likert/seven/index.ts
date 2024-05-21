import agreement from "./agreement.json";
import awareness from "./awareness.json";
import concern from "./concern.json";
import difficulty from "./difficulty.json";
import frequency from "./frequency.json";
import importance from "./importance.json";
import quality from "./quality.json";
import satisfaction from "./satisfaction.json";

const sevenPoint = {
  desc: "7 Point Likert scale sample templates",
  name: "7-point Scale",
  templates: {
    agreement,
    awareness,
    concern,
    difficulty,
    frequency,
    importance,
    quality,
    satisfaction,
  },
};

export { sevenPoint };
