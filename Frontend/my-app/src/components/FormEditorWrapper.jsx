import { useLocation } from "react-router-dom";
import FormEditor from "./FormEditor";
export default function FormEditorWrapper() {
  const location = useLocation();
  const eventId = location.state?.eventId || "";

  return <FormEditor eventId={eventId} />;
}
