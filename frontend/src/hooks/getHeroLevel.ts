export const getHeroLevel = (xp: number) => {
  const levels = [
    { level: 1, title: "時の旅びと", min: 0, max: 19, image: "/images/hero_lv1.png" },
    { level: 2, title: "小さな挑戦者", min: 20, max: 59, image: "/images/hero_lv2.png" },
    { level: 3, title: "習慣の申し子", min: 60, max: 119, image: "/images/hero_lv3.png" },
    { level: 4, title: "集中ハンター", min: 120, max: 199, image: "/images/hero_lv4.png" },
    { level: 5, title: "時間の職人", min: 200, max: 299, image: "/images/hero_lv5.png" },
    { level: 6, title: "習慣を極めし者", min: 300, max: 429, image: "/images/hero_lv6.png" },
    { level: 7, title: "集中の勇者", min: 430, max: 589, image: "/images/hero_lv7.png" },
    { level: 8, title: "効率の賢者", min: 590, max: 789, image: "/images/hero_lv8.png" },
    { level: 9, title: "達成の伝道師", min: 790, max: 1049, image: "/images/hero_lv9.png" },
    { level: 10, title: "最強のあなた", min: 1050, max: Infinity, image: "/images/hero_lv10.png" },
  ];
  return levels.find(l => xp >= l.min && xp <= l.max) || levels[0];
};
