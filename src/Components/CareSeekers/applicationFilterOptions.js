export const applicationFilterSections = [
  {
    key: "service",
    label: "Care services",
    options: [
      ["childcare", "Childcare"],
      ["adult_senior_care", "Adult/Senior care"],
      ["tutoring", "Tutoring"],
      ["housekeeping", "Housekeeping"],
    ],
  },
  {
    key: "location",
    label: "Location",
    options: [
      ["near", "Near me"],
      ["5", "Within 5km"],
      ["10", "Within 10km"],
    ],
  },
  {
    key: "experience",
    label: "Experience",
    options: [
      ["1-2", "1–2 years"],
      ["3-5", "3–5 years"],
      ["6-10", "6–10 years"],
      ["10+", "10+ years"],
    ],
  },
  {
    key: "rating",
    label: "Rating",
    options: [
      ["4.5", "4.5 & above"],
      ["4", "4.0 & above"],
      ["3.5", "3.5 & above"],
      ["3", "3.0 & above"],
    ],
  },
];

export const emptyApplicationFilters = {
  service: "",
  location: "",
  experience: "",
  rating: "",
  verifiedOnly: false,
};
