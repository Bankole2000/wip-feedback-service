import agreement from "./agreement.json";
import awareness from "./awareness.json";
import concern from "./concern.json";
import familiarity from "./familiarity.json";
import likelihood from "./likelihood.json";
import frequency from "./frequency.json";
import importance from "./importance.json";
import quality from "./quality.json";
import satisfaction from "./satisfaction.json";

const fivePoint = {
  desc: "5 Point Likert scale sample templates",
  name: "5-point Scale",
  templates: {
    agreement,
    awareness,
    concern,
    familiarity,
    frequency,
    importance,
    likelihood,
    quality,
    satisfaction,
  },
};

export { fivePoint };
