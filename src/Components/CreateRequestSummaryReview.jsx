import React from "react";
import { useSelector } from "react-redux";
import {
  ChipPanel,
  GeneratedSummaryReview,
} from "./CareRequestSections";
import { buildProviderRequirements } from "../lib/seekerRequestPayload";

function CreateRequestSummaryReview({ formData, updateFormData }) {
  const preview = useSelector((state) => state.careSeeker.preview);
  const summary =
    formData.generatedSummary ||
    preview?.summary ||
    preview?.title ||
    "This text will be generated after we call the preview API.";
  const requirements = buildProviderRequirements(formData, {});

  React.useEffect(() => {
    if (!formData.generatedSummary && (preview?.summary || preview?.title)) {
      updateFormData("generatedSummary", preview.summary || preview.title);
    }
  }, [formData.generatedSummary, preview, updateFormData]);

  return (
    <GeneratedSummaryReview
      summary={summary}
      onSummaryChange={(value) => updateFormData("generatedSummary", value)}
    >
      <ChipPanel
        label="Personality and interpersonal skills"
        values={requirements.personality_interpersonal_skills}
      />
      <ChipPanel
        label="Communication and language"
        values={requirements.communication_language}
      />
      <ChipPanel
        label="Special preferences"
        values={requirements.special_preferences}
      />
      <ChipPanel
        label="Preferred option"
        values={requirements.preferred_options_list}
      />
      <ChipPanel label="Additional care" values={requirements.additional_care} />
    </GeneratedSummaryReview>
  );
}

export default CreateRequestSummaryReview;
