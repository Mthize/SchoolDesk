import { describe, expect, it } from "bun:test";
import {
  AchievementLevel,
  getAchievementDescriptor,
  mapPercentageToAchievement,
} from "./reporting";

describe("achievement mapping", () => {
  it("maps percentages to South African achievement levels", () => {
    expect(mapPercentageToAchievement(85)).toEqual(AchievementLevel.SEVEN);
    expect(mapPercentageToAchievement(72)).toEqual(AchievementLevel.SIX);
    expect(mapPercentageToAchievement(61)).toEqual(AchievementLevel.FIVE);
    expect(mapPercentageToAchievement(55)).toEqual(AchievementLevel.FOUR);
    expect(mapPercentageToAchievement(43)).toEqual(AchievementLevel.THREE);
    expect(mapPercentageToAchievement(31)).toEqual(AchievementLevel.TWO);
    expect(mapPercentageToAchievement(10)).toEqual(AchievementLevel.ONE);
  });

  it("returns correct descriptors for each level", () => {
    expect(getAchievementDescriptor(AchievementLevel.SEVEN)).toContain(
      "Outstanding",
    );
    expect(getAchievementDescriptor(AchievementLevel.ONE)).toContain(
      "Not achieved",
    );
  });
});
