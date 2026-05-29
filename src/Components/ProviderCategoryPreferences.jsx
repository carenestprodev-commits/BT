function MultiCheckboxGroup({ title, options, selected = [], onChange }) {
  const toggle = (option) => {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <p className="block text-xs sm:text-sm font-medium text-gray-700">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-start gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
              className="mt-0.5 rounded"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function normalizeCategory(value = "") {
  return String(value).toLowerCase().replace(/[\s_/]+/g, "");
}

function asList(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

export function buildCategoryFormState(serviceCategory, info = {}, skills = []) {
  const category = normalizeCategory(serviceCategory || info.service_category);
  const details = info.category_specific_details || {};

  return {
    serviceCategory: category,
    typeOfCareProvider: details.type_of_care_provider || "",
    selectedServices: asList(details.services_offered || details.tutoring_services),
    selectedLanguages: asList(details.communication_language),
    selectedPreferences: asList(details.special_preferences).length
      ? asList(details.special_preferences)
      : category === "childcare"
        ? asList(skills)
        : [],
    selectedExperienceLevels: asList(details.experience_level_taught),
    selectedSubjects: asList(details.subjects_experienced_in).length
      ? asList(details.subjects_experienced_in)
      : category === "tutoring"
        ? asList(skills)
        : [],
    selectedSkills: asList(
      details.personality_and_interpersonal_skills || details.services_offered,
    ).length
      ? asList(
          details.personality_and_interpersonal_skills || details.services_offered,
        )
      : ["elderlycare", "housekeeping"].includes(category)
        ? asList(skills)
        : [],
    housekeepingPreference:
      details.preferred_option ||
      (asList(details.house_keeping_preferences)[0] ?? ""),
  };
}

export function buildCategoryPayload(categoryState) {
  const category = normalizeCategory(categoryState.serviceCategory);
  const base = {};

  switch (category) {
    case "childcare":
      base.type_of_care_provider = categoryState.typeOfCareProvider || "";
      base.services_offered = categoryState.selectedServices || [];
      base.communication_language = categoryState.selectedLanguages || [];
      base.special_preferences = categoryState.selectedPreferences || [];
      base.experience_level_taught = categoryState.selectedExperienceLevels || [];
      break;
    case "tutoring":
      base.subjects_experienced_in = categoryState.selectedSubjects || [];
      base.tutoring_services = categoryState.selectedServices || [];
      base.experience_level_taught = categoryState.selectedExperienceLevels || [];
      base.services_offered = categoryState.selectedServices || [];
      break;
    case "elderlycare":
      base.services_offered = categoryState.selectedServices || [];
      base.personality_and_interpersonal_skills = categoryState.selectedSkills || [];
      break;
    case "housekeeping":
      base.services_offered = categoryState.selectedSkills || [];
      base.house_keeping_preferences = categoryState.selectedSkills || [];
      base.preferred_option = categoryState.housekeepingPreference || "";
      break;
    default:
      break;
  }

  return base;
}

export function skillsForCategory(categoryState) {
  const category = normalizeCategory(categoryState.serviceCategory);
  if (category === "childcare") return categoryState.selectedPreferences || [];
  if (category === "tutoring") return categoryState.selectedSubjects || [];
  if (category === "elderlycare" || category === "housekeeping") {
    return categoryState.selectedSkills || [];
  }
  return [];
}

export default function ProviderCategoryPreferences({
  categoryState,
  onCategoryChange,
}) {
  const category = normalizeCategory(categoryState.serviceCategory);

  if (!category) {
    return (
      <p className="text-sm text-gray-500">
        Select a service category in personal information to manage category
        preferences.
      </p>
    );
  }

  const patch = (partial) => onCategoryChange({ ...categoryState, ...partial });

  if (category === "childcare") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            What kind of child care provider are you
          </label>
          <select
            value={categoryState.typeOfCareProvider || ""}
            onChange={(e) => patch({ typeOfCareProvider: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
          >
            <option value="">Select option</option>
            <option>Nanny</option>
            <option>Babysitter</option>
          </select>
        </div>
        <MultiCheckboxGroup
          title="Choose the services you can provide"
          options={[
            "Sleep-in",
            "Live-in",
            "Non-smoker",
            "Cook basic meals",
            "Help with homework",
            "Sign language",
            "Can drive",
            "Behavioral support",
            "Willing to live-in",
          ]}
          selected={categoryState.selectedServices}
          onChange={(selectedServices) => patch({ selectedServices })}
        />
        <MultiCheckboxGroup
          title="Communication & Language"
          options={[
            "Speaks Yoruba fluently",
            "Speaks French fluently",
            "Speaks Hausa fluently",
            "Speaks Igbo fluently",
          ]}
          selected={categoryState.selectedLanguages}
          onChange={(selectedLanguages) => patch({ selectedLanguages })}
        />
        <MultiCheckboxGroup
          title="Special Preference"
          options={[
            "Experience with autism",
            "Special needs experience",
            "Experience with twins",
            "Experience with speech delay",
          ]}
          selected={categoryState.selectedPreferences}
          onChange={(selectedPreferences) => patch({ selectedPreferences })}
        />
        <MultiCheckboxGroup
          title="Choose the experience level"
          options={[
            "Newborn (Up to 12 months)",
            "Toddler (1–3 years)",
            "Early School Age (4–6 years)",
            "Primary school age (7–12 years)",
            "Teenager (12+ years)",
          ]}
          selected={categoryState.selectedExperienceLevels}
          onChange={(selectedExperienceLevels) =>
            patch({ selectedExperienceLevels })
          }
        />
      </div>
    );
  }

  if (category === "tutoring") {
    return (
      <div className="space-y-4">
        <MultiCheckboxGroup
          title="Subjects you are best experienced in"
          options={[
            "Mathematics",
            "English",
            "Chemistry",
            "Physics",
            "History",
            "Music",
            "Other subjects",
          ]}
          selected={categoryState.selectedSubjects}
          onChange={(selectedSubjects) => patch({ selectedSubjects })}
        />
        <MultiCheckboxGroup
          title="Tutoring services you provide"
          options={[
            "Individual Tutoring",
            "Group Lessons",
            "Exam Preparation",
            "Homework help",
            "Special needs tutoring",
            "Homeschooling",
            "Online Tutoring",
          ]}
          selected={categoryState.selectedServices}
          onChange={(selectedServices) => patch({ selectedServices })}
        />
        <MultiCheckboxGroup
          title="Experience level taught"
          options={[
            "Primary School",
            "Secondary School",
            "A-Levels",
            "University",
            "Advanced",
          ]}
          selected={categoryState.selectedExperienceLevels}
          onChange={(selectedExperienceLevels) =>
            patch({ selectedExperienceLevels })
          }
        />
      </div>
    );
  }

  if (category === "elderlycare") {
    return (
      <div className="space-y-4">
        <MultiCheckboxGroup
          title="Services you can provide"
          options={[
            "Hypertension",
            "Diabetes",
            "Clean-up help",
            "Healthy diet",
            "CPR trained",
            "Non-smoker",
            "Palliative care",
            "Willing to live-in",
            "Background checked",
            "Speaks Yoruba",
            "Speaks Igbo",
            "Speaks Hausa",
            "Special Needs experience",
          ]}
          selected={categoryState.selectedServices}
          onChange={(selectedServices) => patch({ selectedServices })}
        />
        <MultiCheckboxGroup
          title="Skills you have"
          options={[
            "First Aid Certificate",
            "CPR Certificate",
            "Special Needs care Training",
            "Speech Therapist",
            "Physical Therapist",
            "Occupational Therapist",
            "Registered Nurse",
            "Healthcare Assistance",
          ]}
          selected={categoryState.selectedSkills}
          onChange={(selectedSkills) => patch({ selectedSkills })}
        />
      </div>
    );
  }

  if (category === "housekeeping") {
    return (
      <div className="space-y-4">
        <MultiCheckboxGroup
          title="Skills you have"
          options={[
            "Deep Cleaning",
            "Organizing",
            "Laundry",
            "Cooking",
            "Grocery Shopping",
            "Pet Care",
            "Elderly Assistance",
            "Childcare Assistance",
            "Special Needs care",
            "Willing to live-in",
          ]}
          selected={categoryState.selectedSkills}
          onChange={(selectedSkills) => patch({ selectedSkills })}
        />
        <div>
          <p className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Housekeeping preference
          </p>
          {["Interested in live-in jobs", "Interested in live-out jobs"].map(
            (option) => (
              <label key={option} className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="radio"
                  name="housekeepingPreference"
                  value={option}
                  checked={categoryState.housekeepingPreference === option}
                  onChange={() => patch({ housekeepingPreference: option })}
                />
                {option}
              </label>
            ),
          )}
        </div>
      </div>
    );
  }

  return null;
}
