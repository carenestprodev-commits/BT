import { buildSchedulePayload } from "./jobPayload";

export const normalizeCareCategory = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (raw.includes("adult") || raw.includes("elder")) return "elderlycare";
  if (raw.includes("tutor")) return "tutoring";
  if (raw.includes("house")) return "housekeeping";
  return "childcare";
};

const asList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const normalizeBillingCycle = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  return raw === "monthly" ? "monthly" : "hourly";
};

export const buildProviderRequirements = (formData = {}, steps = {}) => {
  const experience = steps.experience || {};
  const personality = asList(
    firstValue(
      formData.personalitySkills,
      formData.careProviderQualities,
      experience.personalitySkills,
      experience.careProviderQualities,
    ),
  );
  const communication = asList(
    firstValue(
      formData.communicationLanguage,
      experience.communicationLanguage,
      formData.preferredLanguage,
      steps.location?.preferredLanguage,
    ),
  );
  const special = asList(
    firstValue(
      formData.specialPreferences,
      formData.careProviderExperience,
      experience.specialPreferences,
      experience.careProviderExperience,
    ),
  );
  const preferred = asList(
    firstValue(formData.preferredOption, experience.preferredOption, "Live-out"),
  );
  const additional = asList(
    firstValue(
      formData.additionalCareCategories,
      formData.additionalCare,
      formData.extraCareCategory,
      experience.additionalCareCategories,
      experience.additionalCare,
      experience.extraCareCategory,
    ),
  ).filter((item) => item !== "Select" && item !== "None");

  return {
    personality_interpersonal_skills: personality,
    communication_language: communication,
    special_preferences: special,
    preferred_options_list: preferred,
    preferred_option: preferred[0] || "Live-out",
    additional_care: additional,
  };
};

export const buildSeekerJobData = (formData = {}, steps = {}) => {
  const serviceCategory = normalizeCareCategory(
    formData.careCategory || steps.careCategory,
  );
  const timeDetails = steps.timeDetails || {};
  const location = steps.location || {};
  const billingCycle = normalizeBillingCycle(
    firstValue(
      formData.billingCycle,
      timeDetails.billingCycle,
      formData.billing_cycle,
      timeDetails.billing_cycle,
    ),
  );
  const priceMin = firstValue(
    formData.hourlyRateStart,
    formData.priceMin,
    timeDetails.hourlyRateStart,
    timeDetails.priceMin,
    "25.00",
  );
  const priceMax = firstValue(
    formData.hourlyRateEnd,
    formData.priceMax,
    timeDetails.hourlyRateEnd,
    timeDetails.priceMax,
    "35.00",
  );

  const details = {
    location_information: {
      use_current_location: Boolean(
        firstValue(formData.useCurrentLocation, location.useCurrentLocation, false),
      ),
      preferred_language: firstValue(
        formData.preferredLanguage,
        location.preferredLanguage,
        "English",
      ),
      country: firstValue(formData.country, location.country, ""),
      state: firstValue(formData.state, location.state, ""),
      city: firstValue(formData.city, location.city, ""),
      zip_code: firstValue(formData.zipCode, location.zipCode, ""),
      nationality: firstValue(formData.nationality, location.nationality, ""),
    },
    provider_experience_requirements: buildProviderRequirements(formData, steps),
  };

  if (serviceCategory === "housekeeping") {
    const house = steps.housekeeping || {};
    details.housekeeping_information = {
      kind_of_housekeeping: firstValue(
        formData.housekeepingServices,
        house.housekeepingServices,
        [],
      ),
      house_size: firstValue(formData.homeSize, house.homeSize, ""),
      bedrooms: firstValue(formData.numberOfBedrooms, house.numberOfBedrooms, ""),
      bathrooms: firstValue(formData.numberOfBathrooms, house.numberOfBathrooms, ""),
      toilets: firstValue(formData.numberOfToilets, house.numberOfToilets, ""),
      pets_present: firstValue(formData.petsPresent, house.petsPresent, "No"),
      pet_details: firstValue(formData.petDetails, house.petDetails, ""),
      additional_care: asList(firstValue(formData.additionalCare, house.additionalCare, [])),
    };
  } else if (serviceCategory === "childcare") {
    const childInfo = steps.childInfo || {};
    details.child_information = {
      who_needs_care: firstValue(formData.whoNeedsCare, childInfo.whoNeedsCare, ""),
      childcare_type: firstValue(formData.childcareType, childInfo.childcareType, ""),
      number_of_children: firstValue(
        formData.numberOfChildren,
        childInfo.numberOfChildren,
        "",
      ),
      children: asList(
        firstValue(formData.childrenDetails, childInfo.childrenDetails, []),
      ).map((child) => ({
        age: child.age || child.birthDate || "",
        gender: child.gender || "",
      })),
    };
  } else if (serviceCategory === "elderlycare") {
    const elderly = steps.elderlyInfo || {};
    details.elderly_information = {
      who_needs_care: firstValue(formData.whoNeedsCare, elderly.whoNeedsCare, ""),
      elderly_care_type: firstValue(
        formData.elderlyCareType,
        elderly.elderlyCareType,
        "",
      ),
      relationship: firstValue(
        formData.relationshipWithElderly,
        elderly.relationshipWithElderly,
        "",
      ),
      age: firstValue(formData.ageOfElderly, elderly.ageOfElderly, ""),
      gender: firstValue(formData.genderOfElderly, elderly.genderOfElderly, ""),
      health_condition: firstValue(
        formData.healthCondition,
        elderly.healthCondition,
        "",
      ),
      assistance_needed: asList(
        firstValue(formData.assistanceNeeded, elderly.assistanceNeeded, ""),
      ),
    };
  } else if (serviceCategory === "tutoring") {
    const tutoring = steps.tutoringInfo || {};
    details.tutoring_information = {
      subjects_needed: asList(
        firstValue(formData.tutoringSubjects, tutoring.tutoringSubjects, []),
      ),
      learning_environment: firstValue(
        formData.learningEnvironment,
        tutoring.learningEnvironment,
        "",
      ),
      purpose_of_learning: firstValue(
        formData.purposeOfLearning,
        tutoring.purposeOfLearning,
        "",
      ),
      student_age_range: firstValue(formData.studentAge, tutoring.studentAge, ""),
      current_grade: firstValue(formData.currentGrade, tutoring.currentGrade, ""),
      additional_care: asList(firstValue(formData.additionalCare, tutoring.additionalCare, [])),
    };
  }

  return {
    service_category: serviceCategory,
    details,
    schedule: buildSchedulePayload({
      scheduleType: firstValue(formData.scheduleType, timeDetails.scheduleType, "Reoccurring"),
      startDate: firstValue(formData.startDate, timeDetails.startDate),
      endDate: firstValue(formData.endDate, timeDetails.endDate),
      repeatEvery: firstValue(formData.repeatEvery, timeDetails.repeatEvery),
      repeatFrequency: firstValue(formData.repeatFrequency, timeDetails.repeatFrequency),
      repeatDays: firstValue(formData.repeatDays, timeDetails.repeatDays, ["Friday"]),
      startTime: firstValue(formData.startTime, timeDetails.startTime),
      endTime: firstValue(formData.endTime, timeDetails.endTime),
    }),
    budget: {
      price_min: parseFloat(priceMin) || 0,
      price_max: parseFloat(priceMax) || 0,
      billing_cycle: billingCycle,
    },
    message_to_provider: firstValue(
      formData.messageToProvider,
      steps.summary?.messageToProvider,
      "",
    ),
  };
};

export const mergeRequestSkills = (preview = {}, requirements = {}) => {
  const merged = [];
  const add = (items) => {
    asList(items).forEach((item) => {
      if (item && !merged.includes(item)) merged.push(item);
    });
  };
  add(preview.skills);
  add(requirements.personality_interpersonal_skills);
  add(requirements.communication_language);
  add(requirements.special_preferences);
  add(requirements.preferred_options_list);
  add(requirements.additional_care);
  return merged;
};

export const buildPublishPayload = ({
  formData = {},
  steps = {},
  preview = {},
  title,
  summary,
}) => {
  const job_data = buildSeekerJobData(formData, steps);
  return {
    job_data,
    title: title || preview.title || "Care request",
    summary:
      summary ||
      formData.generatedSummary ||
      steps.summary?.generatedSummary ||
      preview.summary ||
      "Looking for care services",
    skills_and_expertise: mergeRequestSkills(
      preview,
      job_data.details.provider_experience_requirements,
    ),
  };
};
