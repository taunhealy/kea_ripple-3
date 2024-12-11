"use client";

import { PresetSubmissionForm } from "@/app/components/forms/PresetSubmissionForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { useParams } from "next/navigation";

export default function SubmitPresetPage() {
  const params = useParams();
  const requestId = params?.id as string;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Preset</CardTitle>
      </CardHeader>
      <CardContent>
        <PresetSubmissionForm requestId={requestId} />
      </CardContent>
    </Card>
  );
}
